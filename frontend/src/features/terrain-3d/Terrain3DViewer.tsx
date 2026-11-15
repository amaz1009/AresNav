import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useMissionStore } from '../../store/missionStore';
import type { TraverseRoute, ScienceStop } from '../../types/models';
import { createTraverseRouteFromPoints } from '../../services/routeService';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Maximize2,
  Box,
  Zap,
  Route,
  ArrowRight,
} from 'lucide-react';

type CameraViewMode = 'ORBIT' | 'FLYTHROUGH' | 'TOP_DOWN';
type TextureStyle = 'OPTICAL' | 'ELEVATION' | 'SLOPE';

export const Terrain3DViewer: React.FC = () => {
  const {
    base,
    destination,
    selectedRoute,
    routes,
    setSelectedRoute,
    selectedRegion,
    setActivePage,
    candidateSites,
    evaConfigParams,
  } = useMissionStore();

  // Dynamically compute the exact route between Base and Destination configured in Traverse Planner
  const plannerRoute = useMemo(() => {
    if (!base || !destination) return null;
    return createTraverseRouteFromPoints(
      base,
      destination,
      selectedRegion?.region_id,
      evaConfigParams?.base_speed_kmh,
      candidateSites
    );
  }, [base, destination, selectedRegion, evaConfigParams, candidateSites]);

  const isPathConfigured = Boolean((base && destination) || selectedRoute);

  // Whatever path is selected in the traverse planner region, 3D viewer displays that respective path only
  const activeRoute: TraverseRoute | null = useMemo(() => {
    if (!isPathConfigured) return null;
    if (selectedRoute?.route_id === 'TRAVERSE_PLANNER_ROUTE') {
      return plannerRoute || selectedRoute;
    }
    if (selectedRoute) {
      return selectedRoute;
    }
    if (plannerRoute) {
      return plannerRoute;
    }
    if (base && destination && routes.length > 0) {
      return routes[0];
    }
    return null;
  }, [isPathConfigured, selectedRoute, plannerRoute, routes, base, destination]);

  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);

  // Viewer State
  const [viewMode, setViewMode] = useState<CameraViewMode>('ORBIT');
  const [textureStyle, setTextureStyle] = useState<TextureStyle>('OPTICAL');
  const verticalExaggeration = 1.8;
  const [isPlayingFlythrough, setIsPlayingFlythrough] = useState<boolean>(false);
  const [flythroughProgress, setFlythroughProgress] = useState<number>(0); // 0 to 1
  const [flythroughSpeed, setFlythroughSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [currentWaypointLabel, setCurrentWaypointLabel] = useState<string>('BASE STATION');
  const [cameraTelemetry, setCameraTelemetry] = useState<{ alt: number; pitch: number; az: number }>({
    alt: 120,
    pitch: 35,
    az: 45,
  });
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const routeLineRef = useRef<THREE.Line | null>(null);
  const routeSplineRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit control state (custom smooth mouse orbit without external OrbitControls script)
  const orbitRef = useRef({
    radius: 160,
    theta: Math.PI / 4, // Azimuth angle
    phi: Math.PI / 3,   // Elevation angle
    target: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    dragButton: 0, // 0 = left orbit, 2 = right pan
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // Dynamic geographic-to-3D projection: maps real planetary coordinates (lat, lon) onto the 3D terrain mesh [-80, 80]
  const projection = useMemo(() => {
    if (!activeRoute?.waypoints || activeRoute.waypoints.length === 0) {
      return {
        project: (_lat: number, _lon: number) => ({ x: 0, z: 0 }),
        centerLat: selectedRegion?.center?.lat ?? -4.83,
        centerLon: selectedRegion?.center?.lon ?? 137.30,
        scale: 1,
      };
    }

    const waypoints = activeRoute.waypoints;
    const lats = waypoints.map((w) => w.lat);
    const lons = waypoints.map((w) => w.lon);

    if (activeRoute.science_stops) {
      activeRoute.science_stops.forEach((s) => {
        lats.push(s.point.lat);
        lons.push(s.point.lon);
      });
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // Preserve geographic aspect ratio with isotropic scale factor
    const latSpan = Math.max(maxLat - minLat, 0.005);
    const lonSpan = Math.max(maxLon - minLon, 0.005);
    const maxSpan = Math.max(latSpan, lonSpan);

    // Dynamic scale so any route spans [-60, 60] units across the 200x200 3D world
    const scale = 120 / maxSpan;

    const project = (lat: number, lon: number) => {
      const x = (lon - centerLon) * scale;
      const z = -(lat - centerLat) * scale; // +Lat (North) maps to -Z in Three.js
      return { x, z };
    };

    return { project, centerLat, centerLon, scale };
  }, [activeRoute, selectedRegion]);

  // Extract route path 2D coordinates and real elevation profile
  const routeProfileSamples = useMemo(() => {
    if (!activeRoute) return [];

    // Prefer detailed elevation profile points if available
    if (activeRoute.elevation_profile && activeRoute.elevation_profile.length > 0) {
      return activeRoute.elevation_profile.map((p, idx, arr) => {
        const { x, z } = projection.project(p.point.lat, p.point.lon);
        const elev = p.elevation_m;
        const slope = p.slope_deg || 5;
        const progress = idx / Math.max(1, arr.length - 1);
        return { x, z, elev, slope, progress };
      });
    }

    // Fallback to waypoints
    if (activeRoute.waypoints && activeRoute.waypoints.length > 0) {
      const count = activeRoute.waypoints.length;
      const baseElev = -2500;
      const ascent = activeRoute.ascent_m || 50;
      const descent = activeRoute.descent_m || 20;

      return activeRoute.waypoints.map((wp, idx) => {
        const { x, z } = projection.project(wp.lat, wp.lon);
        const progress = idx / Math.max(1, count - 1);
        const elev =
          baseElev +
          (ascent - descent) * progress +
          Math.sin(progress * Math.PI) * (activeRoute.max_slope_deg || 10) * 3;
        const slope = activeRoute.average_slope_deg || 4.5;
        return { x, z, elev, slope, progress };
      });
    }

    return [];
  }, [activeRoute, projection]);

  const elevationStats = useMemo(() => {
    if (routeProfileSamples.length === 0) {
      return { min: -2600, max: -2400, span: 200, center: -2500 };
    }
    const elevs = routeProfileSamples.map((s) => s.elev);
    const min = Math.min(...elevs);
    const max = Math.max(...elevs);
    const span = Math.max(max - min, 20);
    const center = (min + max) / 2;
    return { min, max, span, center };
  }, [routeProfileSamples]);

  // Exact 3D Replica of the user's traverse path and flanking topography
  const getTerrainHeight = useCallback(
    (x: number, z: number, exaggeration: number = 1.8): number => {
      if (routeProfileSamples.length < 2) {
        const baseRelief = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 4;
        return baseRelief * (exaggeration / 1.5);
      }

      let minDistanceSq = Infinity;
      let closestHeight = 0;
      let closestSlope = 5;
      let lateralOffset = 0;
      let segDirX = 1;
      let segDirZ = 0;

      for (let i = 0; i < routeProfileSamples.length - 1; i++) {
        const p0 = routeProfileSamples[i];
        const p1 = routeProfileSamples[i + 1];

        const dx = p1.x - p0.x;
        const dz = p1.z - p0.z;
        const segLenSq = dx * dx + dz * dz;

        let t = 0;
        if (segLenSq > 1e-6) {
          t = Math.max(0, Math.min(1, ((x - p0.x) * dx + (z - p0.z) * dz) / segLenSq));
        }

        const projX = p0.x + t * dx;
        const projZ = p0.z + t * dz;
        const distSq = (x - projX) * (x - projX) + (z - projZ) * (z - projZ);

        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          const segLen = Math.sqrt(segLenSq) || 1;
          segDirX = dx / segLen;
          segDirZ = dz / segLen;

          const elev = p0.elev + t * (p1.elev - p0.elev);
          closestHeight = ((elev - elevationStats.center) / elevationStats.span) * 26;
          closestSlope = p0.slope + t * (p1.slope - p0.slope);

          // Lateral offset perpendicular to the segment: normal is (-segDirZ, segDirX)
          lateralOffset = (x - projX) * (-segDirZ) + (z - projZ) * segDirX;
        }
      }

      const d = Math.sqrt(minDistanceSq);

      // Path centerline follows exact route elevation profile
      const crossSlopeAngleRad = (closestSlope * Math.PI) / 180;
      const crossSlopeTilt = lateralOffset * Math.tan(crossSlopeAngleRad) * 0.25;

      // Flanking mountain slopes and Martian dune ripples flanking the corridor
      const flankFactor = Math.min(1, d / 14);
      const alongTrack = x * segDirX + z * segDirZ;
      const flankingRelief =
        flankFactor *
        (Math.sin(alongTrack * 0.07) * 7 +
          Math.cos(lateralOffset * 0.06) * 6 +
          Math.sin(x * 0.14 + z * 0.12) * 2.4);

      // Boundary taper at mesh edges
      const rMax = Math.max(Math.abs(x), Math.abs(z));
      const edgeFalloff = rMax > 80 ? Math.max(0, 1 - (rMax - 80) / 20) : 1;

      return (closestHeight + crossSlopeTilt + flankingRelief) * (exaggeration / 1.5) * edgeFalloff;
    },
    [routeProfileSamples, elevationStats]
  );

  // Map route waypoints dynamically to 3D points on the terrain surface
  const route3DPoints = useMemo(() => {
    if (!activeRoute?.waypoints || activeRoute.waypoints.length === 0) return [];
    return activeRoute.waypoints.map((wp) => {
      const { x, z } = projection.project(wp.lat, wp.lon);
      const y = getTerrainHeight(x, z, verticalExaggeration) + 1.2;
      return new THREE.Vector3(x, y, z);
    });
  }, [activeRoute, projection, getTerrainHeight, verticalExaggeration]);

  // Map science stops dynamically to 3D points
  const scienceStops3D = useMemo(() => {
    if (!activeRoute?.science_stops || activeRoute.science_stops.length === 0) return [];
    return activeRoute.science_stops.map((stop) => {
      const { x, z } = projection.project(stop.point.lat, stop.point.lon);
      const y = getTerrainHeight(x, z, verticalExaggeration) + 1.2;
      return {
        stop,
        position: new THREE.Vector3(x, y, z),
      };
    });
  }, [activeRoute, projection, getTerrainHeight, verticalExaggeration]);

  // Texture generator for Optical, Hypsometric Elevation, and Slope Safety
  const createTerrainTexture = useCallback((style: TextureStyle): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const imgData = ctx.createImageData(1024, 1024);
    const data = imgData.data;

    for (let py = 0; py < 1024; py++) {
      const z = ((py / 1024) - 0.5) * 200;
      for (let px = 0; px < 1024; px++) {
        const x = ((px / 1024) - 0.5) * 200;
        const h = getTerrainHeight(x, z, 1.8);
        const idx = (py * 1024 + px) * 4;

        if (style === 'OPTICAL') {
          // Realistic Martian rust, basalt, and crater shadows
          const noise = (Math.sin(x * 0.4) * Math.cos(z * 0.4) + 1) * 0.5;
          const rustR = 190 + Math.floor(h * 1.2) + Math.floor(noise * 25);
          const rustG = 85 + Math.floor(h * 0.6) + Math.floor(noise * 15);
          const rustB = 45 + Math.floor(noise * 10);
          data[idx] = Math.min(255, Math.max(0, rustR));
          data[idx + 1] = Math.min(255, Math.max(0, rustG));
          data[idx + 2] = Math.min(255, Math.max(0, rustB));
          data[idx + 3] = 255;
        } else if (style === 'ELEVATION') {
          // Hypsometric Tint: Deep blues/greens for low floor, rust for mid, white for rim
          const normH = Math.min(1, Math.max(0, (h + 15) / 50));
          if (normH < 0.3) {
            // Low Séítah floor (Teal/Emerald)
            data[idx] = 40;
            data[idx + 1] = Math.floor(120 + normH * 200);
            data[idx + 2] = Math.floor(160 + normH * 150);
          } else if (normH < 0.7) {
            // Mid delta fan (Martian Rust & Amber)
            data[idx] = Math.floor(180 + (normH - 0.3) * 150);
            data[idx + 1] = Math.floor(90 + (normH - 0.3) * 80);
            data[idx + 2] = 40;
          } else {
            // High crater rim (Bright tan/white)
            data[idx] = Math.floor(220 + (normH - 0.7) * 110);
            data[idx + 1] = Math.floor(180 + (normH - 0.7) * 120);
            data[idx + 2] = Math.floor(150 + (normH - 0.7) * 140);
          }
          data[idx + 3] = 255;
        } else {
          // SLOPE Safety: Green (<10°), Amber (10-15°), Red (>15°)
          const slopeApprox = Math.abs(Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 18;
          if (slopeApprox < 10) {
            data[idx] = 78;     // #4E9A68 Green
            data[idx + 1] = 154;
            data[idx + 2] = 104;
          } else if (slopeApprox <= 15) {
            data[idx] = 212;    // #D4A359 Amber
            data[idx + 1] = 163;
            data[idx + 2] = 89;
          } else {
            data[idx] = 201;    // #C94D4D Red Hazard
            data[idx + 1] = 77;
            data[idx + 2] = 77;
          }
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [getTerrainHeight]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;
    } catch {
      setWebglSupported(false);
      return;
    }

    setWebglSupported(true);
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0e);
    scene.fog = new THREE.FogExp2(0x18100e, 0.0035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;

    // 2. Lighting (Deep Martian sun and atmospheric fill)
    const ambientLight = new THREE.AmbientLight(0xd49b80, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff0e2, 1.4);
    sunLight.position.set(-90, 110, -70);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 3. Terrain Mesh
    const gridSegments = 120;
    const geometry = new THREE.PlaneGeometry(200, 200, gridSegments, gridSegments);
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getTerrainHeight(x, z, verticalExaggeration);
      posAttr.setY(i, y);
    }
    geometry.computeVertexNormals();

    const texture = createTerrainTexture(textureStyle);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.88,
      metalness: 0.12,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(geometry, material);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // 4. Markers Group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [getTerrainHeight, verticalExaggeration, createTerrainTexture, textureStyle]);

  // Update Route Spline, 3D Waypoint Pins & Science Stops
  useEffect(() => {
    const scene = sceneRef.current;
    const markersGroup = markersGroupRef.current;
    if (!scene || !markersGroup || route3DPoints.length < 2) return;

    // Remove previous route line
    if (routeLineRef.current) {
      scene.remove(routeLineRef.current);
      routeLineRef.current.geometry.dispose();
      routeLineRef.current = null;
    }

    // Clear previous markers
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0];
      markersGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    // Create smooth Catmull-Rom curve along 3D route points
    const spline = new THREE.CatmullRomCurve3(route3DPoints, false, 'catmullrom', 0.2);
    routeSplineRef.current = spline;

    const curvePoints = spline.getPoints(200);
    // Conform spline to surface elevation contours so the line hugs the terrain
    curvePoints.forEach((pt) => {
      pt.y = getTerrainHeight(pt.x, pt.z, verticalExaggeration) + 0.8;
    });

    const lineGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xc85a32, // Muted Martian Rust glow
      linewidth: 3,
    });
    const line = new THREE.Line(lineGeom, lineMat);
    scene.add(line);
    routeLineRef.current = line;

    // Add 3D Spherical Pins at Real Waypoints
    route3DPoints.forEach((pt, idx) => {
      const isBase = idx === 0;
      const isEnd = idx === route3DPoints.length - 1;
      const pinColor = isBase ? 0x4e9a68 : isEnd ? 0xef4444 : 0xd4a359;

      const sphereGeom = new THREE.SphereGeometry(isBase || isEnd ? 2.4 : 1.6, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: pinColor,
        emissiveIntensity: 0.45,
        roughness: 0.3,
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.copy(pt);
      sphere.position.y += 1.0;
      markersGroup.add(sphere);

      // Pin stem to ground
      const stemHeight = Math.max(2, pt.y + 1.0);
      const stemGeom = new THREE.CylinderGeometry(0.25, 0.25, stemHeight, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x282c37 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.set(pt.x, stemHeight / 2, pt.z);
      markersGroup.add(stem);
    });

    // Add Distinct Science Stop Tactical Beacons
    scienceStops3D.forEach(({ position }) => {
      // Inverted cone pointing at drill/sample target
      const coneGeom = new THREE.ConeGeometry(1.6, 3.2, 5);
      coneGeom.rotateX(Math.PI); // Point down towards ground
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        emissive: 0xe5a93c,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.position.set(position.x, position.y + 3.0, position.z);
      markersGroup.add(cone);

      // Vertical beacon beam
      const beamGeom = new THREE.CylinderGeometry(0.12, 0.12, 10, 6);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xe5a93c,
        transparent: true,
        opacity: 0.6,
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(position.x, position.y + 5.0, position.z);
      markersGroup.add(beam);
    });
  }, [route3DPoints, scienceStops3D, getTerrainHeight, verticalExaggeration]);

  // Main 3D Animation & Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const spline = routeSplineRef.current;

      if (!camera || !renderer || !scene) return;

      const orbit = orbitRef.current;

      if (viewMode === 'ORBIT') {
        // Spherical orbital position
        camera.position.x = orbit.target.x + orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
        camera.position.y = orbit.target.y + orbit.radius * Math.cos(orbit.phi);
        camera.position.z = orbit.target.z + orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
        camera.lookAt(orbit.target);

        // Update telemetry display
        setCameraTelemetry({
          alt: Math.round(camera.position.y),
          pitch: Math.round((orbit.phi * 180) / Math.PI - 90),
          az: Math.round(((orbit.theta * 180) / Math.PI + 360) % 360),
        });
      } else if (viewMode === 'TOP_DOWN') {
        camera.position.set(0, 240, 0);
        camera.lookAt(0, 0, 0);
        setCameraTelemetry({ alt: 240, pitch: 90, az: 0 });
      } else if (viewMode === 'FLYTHROUGH' && spline) {
        // Advance flythrough progress if playing
        if (isPlayingFlythrough) {
          setFlythroughProgress((prev) => {
            const next = prev + (delta * 0.05 * flythroughSpeed);
            if (next >= 1) {
              setIsPlayingFlythrough(false);
              return 1;
            }
            return next;
          });
        }

        const t = Math.min(0.999, Math.max(0.001, flythroughProgress));
        const pos = spline.getPoint(t);
        const tangent = spline.getTangent(t).normalize();
        const terrainY = getTerrainHeight(pos.x, pos.z, verticalExaggeration);

        // Eye-level view: camera at +3.2m above terrain surface
        camera.position.set(pos.x, terrainY + 3.2, pos.z);

        // Look forward towards next waypoint along spline
        const lookTarget = pos.clone().add(tangent.clone().multiplyScalar(16));
        lookTarget.y = getTerrainHeight(lookTarget.x, lookTarget.z, verticalExaggeration) + 2.0;
        camera.lookAt(lookTarget);

        // Determine real waypoint telemetry
        if (activeRoute?.waypoints && activeRoute.waypoints.length > 0) {
          const wpIdx = Math.min(
            activeRoute.waypoints.length - 1,
            Math.floor(t * (activeRoute.waypoints.length - 1))
          );
          const currentWp = activeRoute.waypoints[wpIdx];
          const wpName = wpIdx === 0
            ? 'BASE STATION'
            : wpIdx === activeRoute.waypoints.length - 1
            ? (activeRoute.route_id === 'TRAVERSE_PLANNER_ROUTE' ? 'DESTINATION TARGET' : 'MISSION TARGET / RETURN')
            : `WAYPOINT 0${wpIdx + 1}`;
          setCurrentWaypointLabel(`${wpName} // ${currentWp.lat.toFixed(4)}°N, ${currentWp.lon.toFixed(4)}°E // ELEV ${Math.round(terrainY)}m`);
        }

        setCameraTelemetry({
          alt: Math.round(camera.position.y),
          pitch: -4,
          az: Math.round(((Math.atan2(tangent.x, tangent.z) * 180) / Math.PI + 360) % 360),
        });
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [viewMode, isPlayingFlythrough, flythroughProgress, flythroughSpeed, activeRoute, getTerrainHeight, verticalExaggeration]);

  // 2D Canvas Isometric 3D Wireframe Fallback for headless / non-WebGL environments
  useEffect(() => {
    if (webglSupported) return;
    const canvas = fallbackCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    canvas.width = width;
    canvas.height = height;

    let animId: number;
    let angle = orbitRef.current.theta;

    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      const cols = 26;
      const rows = 26;
      const step = 6.5;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const project = (x: number, z: number, y: number) => {
        const rx = x * cosA - z * sinA;
        const rz = x * sinA + z * cosA;
        const px = width / 2 + rx * 4.4;
        const py = height / 2 + rz * 2.4 - y * 4.8 * (verticalExaggeration / 1.5);
        return { x: px, y: py };
      };

      // Draw wireframe terrain contours
      ctx.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        const z = (r - rows / 2) * step;
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const x = (c - cols / 2) * step;
          const y = getTerrainHeight(x, z, verticalExaggeration);
          const p = project(x, z, y);
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle =
          textureStyle === 'SLOPE'
            ? 'rgba(201, 77, 77, 0.45)'
            : textureStyle === 'ELEVATION'
            ? 'rgba(100, 181, 246, 0.45)'
            : 'rgba(200, 90, 50, 0.45)';
        ctx.stroke();
      }

      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * step;
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const z = (r - rows / 2) * step;
          const y = getTerrainHeight(x, z, verticalExaggeration);
          const p = project(x, z, y);
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(200, 90, 50, 0.22)';
        ctx.stroke();
      }

      // Draw 3D Route Line & Waypoint Spheres
      if (route3DPoints.length > 1) {
        ctx.beginPath();
        route3DPoints.forEach((pt, i) => {
          const p = project(pt.x, pt.z, pt.y);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#D4A359';
        ctx.stroke();

        route3DPoints.forEach((pt, i) => {
          const p = project(pt.x, pt.z, pt.y);
          ctx.beginPath();
          ctx.arc(p.x, p.y, i === 0 || i === route3DPoints.length - 1 ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? '#4E9A68' : i === route3DPoints.length - 1 ? '#EF4444' : '#E27B54';
          ctx.fill();
        });

        // Draw science stops in isometric view
        scienceStops3D.forEach(({ position }) => {
          const p = project(position.x, position.z, position.y);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#E5A93C';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });
      }

      if (isPlayingFlythrough) {
        angle += 0.006 * flythroughSpeed;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [
    webglSupported,
    verticalExaggeration,
    textureStyle,
    isPlayingFlythrough,
    flythroughSpeed,
    getTerrainHeight,
    route3DPoints,
    scienceStops3D,
  ]);

  // Orbit Mouse Event Listeners
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    orbitRef.current.isDragging = true;
    orbitRef.current.dragButton = e.button;
    orbitRef.current.lastMouseX = e.clientX;
    orbitRef.current.lastMouseY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!orbitRef.current.isDragging || viewMode !== 'ORBIT') return;

    const deltaX = e.clientX - orbitRef.current.lastMouseX;
    const deltaY = e.clientY - orbitRef.current.lastMouseY;
    orbitRef.current.lastMouseX = e.clientX;
    orbitRef.current.lastMouseY = e.clientY;

    if (orbitRef.current.dragButton === 0) {
      // Left button: Orbit rotation
      orbitRef.current.theta -= deltaX * 0.008;
      orbitRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, orbitRef.current.phi - deltaY * 0.008));
    } else {
      // Right button: Pan target
      orbitRef.current.target.x -= deltaX * 0.2;
      orbitRef.current.target.z -= deltaY * 0.2;
    }
  }, [viewMode]);

  const handleMouseUp = useCallback(() => {
    orbitRef.current.isDragging = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLElement>) => {
    e.preventDefault();
    if (viewMode !== 'ORBIT') return;
    orbitRef.current.radius = Math.max(50, Math.min(320, orbitRef.current.radius + e.deltaY * 0.12));
  }, [viewMode]);

  const handleResetCamera = useCallback(() => {
    orbitRef.current.radius = 160;
    orbitRef.current.theta = Math.PI / 4;
    orbitRef.current.phi = Math.PI / 3;
    orbitRef.current.target.set(0, 0, 0);
    setViewMode('ORBIT');
    setIsPlayingFlythrough(false);
    setFlythroughProgress(0);
  }, []);

  // Science Stop lookup
  const stops: ScienceStop[] = activeRoute?.science_stops || [];

  if (!isPathConfigured || !activeRoute) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050507] text-center select-text font-sans h-full">
        <div className="max-w-md border border-[#181A22] bg-[#0A0B0E] p-10 rounded-[2px] flex flex-col items-center justify-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center">
            <Box className="h-7 w-7 text-[#C85A32]" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-normal text-[#F4F4F2] font-editorial tracking-wide">
              No Traverse Path Configured
            </h3>
            <p className="text-xs text-[#8B909A] leading-relaxed font-sans font-light">
              The 3D Surface Topography Viewer dynamically generates an exact 3D replica of the chosen traverse path.
              Please designate your starting point (Base) and destination in the Traverse Planner to render the 3D terrain profile and flythrough simulation.
            </p>
          </div>
          <button
            onClick={() => setActivePage('traverse')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#D6653C] text-[#F4F4F2] text-xs font-mono font-medium rounded-[2px] transition-colors uppercase tracking-wider"
          >
            <span>Open Traverse Planner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0A0B0E] text-[#F4F4F2] select-none overflow-hidden h-full">
      {/* Top 3D Mission Navigation Ribbon */}
      <div className="border-b border-[#181A22] bg-[#050507] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#1A1C22] border border-[#3D2C26] px-2.5 py-1 rounded-[2px]">
            <Box className="h-4 w-4 text-[#C85A32]" />
            <span className="text-xs font-mono font-bold tracking-[0.16em] uppercase text-[#F4F4F2]">
              3D SURFACE TOPOGRAPHY // WEBGL VIEWER
            </span>
            <span className="text-[10px] font-mono bg-[#C85A32]/20 text-[#E27B54] px-1.5 py-0.2 rounded-[2px] border border-[#C85A32]/40 font-semibold">
              ELEVATION MESH
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-[#8B909A]">
            <span>TARGET:</span>
            <span className="text-[#F4F4F2] font-semibold">
              {activeRoute?.route_id === 'TRAVERSE_PLANNER_ROUTE'
                ? `Traverse Planner Vector (${activeRoute.total_distance_km.toFixed(2)} km)`
                : `${activeRoute?.name || selectedRegion.name} (Delta Fan Corridor)`}
            </span>
          </div>
        </div>

        {/* Route Selector & View Switchers */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono uppercase text-[#8B909A] hidden md:inline">
            EVALUATED ROUTE:
          </span>
          <div className="flex items-center space-x-1.5">
            {plannerRoute && (
              <button
                key={plannerRoute.route_id}
                onClick={() => {
                  setSelectedRoute(plannerRoute);
                }}
                className={`text-[10px] font-mono px-2 py-1 rounded-[2px] border transition-colors flex items-center space-x-1 ${
                  activeRoute?.route_id === plannerRoute.route_id
                    ? 'bg-[#4E9A68]/20 border-[#4E9A68] text-[#68D391] font-bold shadow-[0_0_8px_#4E9A68]/20'
                    : 'bg-[#0A0B0E] border-[#181A22] text-[#8B909A] hover:text-[#F4F4F2]'
                }`}
              >
                <Route className="h-3 w-3 text-[#4E9A68]" />
                <span>PLANNER PATH</span>
              </button>
            )}
            {routes.map((rt) => {
              const isSelected = activeRoute?.route_id === rt.route_id;
              return (
                <button
                  key={rt.route_id}
                  onClick={() => {
                    setSelectedRoute(rt);
                  }}
                  className={`text-[10px] font-mono px-2 py-1 rounded-[2px] border transition-colors ${
                    isSelected
                      ? 'bg-[#C85A32]/20 border-[#C85A32] text-[#E27B54] font-bold'
                      : 'bg-[#0A0B0E] border-[#181A22] text-[#8B909A] hover:text-[#F4F4F2]'
                  }`}
                >
                  {rt.objective.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setActivePage('traverse')}
            className="text-[10px] font-mono border border-[#181A22] bg-[#0A0B0E] hover:bg-[#20242D] text-[#8B909A] hover:text-[#F4F4F2] px-2.5 py-1 rounded-[2px] flex items-center space-x-1 transition-colors"
          >
            <span>MAP VIEW</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="flex-1 relative overflow-hidden bg-black flex items-center justify-center cursor-grab active:cursor-grabbing outline-none select-none"
      >
        {!webglSupported && (
          <>
            <canvas
              ref={fallbackCanvasRef}
              data-testid="three-canvas"
              className="w-full h-full block"
            />
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-[#050507]/85 border border-[#3D2C26] px-3 py-1 rounded-[2px] text-[10px] font-mono text-[#D4A359] pointer-events-none z-10 shadow-lg">
              3D PERSPECTIVE MESH // ISOMETRIC ELEVATION MODE
            </div>
          </>
        )}

        {/* Floating Technical Controls Panel (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2 pointer-events-auto">
          {/* Camera View Mode Switcher */}
          <div className="bg-[#050507]/90 border border-[#181A22] p-1.5 rounded-[2px] flex items-center space-x-1 shadow-xl">
            <button
              onClick={() => {
                setViewMode('ORBIT');
                setIsPlayingFlythrough(false);
              }}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-[2px] border transition-colors flex items-center space-x-1 ${
                viewMode === 'ORBIT'
                  ? 'bg-[#C85A32]/25 border-[#C85A32] text-[#E27B54] font-bold'
                  : 'bg-[#0A0B0E] border-transparent text-[#8B909A] hover:text-[#F4F4F2]'
              }`}
            >
              <Box className="h-3 w-3" />
              <span>ORBIT 3D</span>
            </button>

            <button
              onClick={() => {
                setViewMode('FLYTHROUGH');
                setIsPlayingFlythrough(true);
              }}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-[2px] border transition-colors flex items-center space-x-1 ${
                viewMode === 'FLYTHROUGH'
                  ? 'bg-[#C85A32]/25 border-[#C85A32] text-[#E27B54] font-bold'
                  : 'bg-[#0A0B0E] border-transparent text-[#8B909A] hover:text-[#F4F4F2]'
              }`}
            >
              <Zap className="h-3 w-3 text-[#D4A359]" />
              <span>FLYTHROUGH</span>
            </button>

            <button
              onClick={() => {
                setViewMode('TOP_DOWN');
                setIsPlayingFlythrough(false);
              }}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-[2px] border transition-colors flex items-center space-x-1 ${
                viewMode === 'TOP_DOWN'
                  ? 'bg-[#C85A32]/25 border-[#C85A32] text-[#E27B54] font-bold'
                  : 'bg-[#0A0B0E] border-transparent text-[#8B909A] hover:text-[#F4F4F2]'
              }`}
            >
              <Maximize2 className="h-3 w-3" />
              <span>ORTHO 2D</span>
            </button>

            <button
              onClick={handleResetCamera}
              title="Reset 3D Camera"
              className="text-[#8B909A] hover:text-[#F4F4F2] p-1 rounded transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Scientific Layer */}
          <div className="bg-[#050507]/90 border border-[#181A22] p-1.5 rounded-[2px] flex items-center space-x-1 shadow-xl">
            <span className="text-[9px] font-mono text-[#8B909A] px-1 uppercase">LAYER:</span>
            <button
              onClick={() => setTextureStyle('OPTICAL')}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] border ${
                textureStyle === 'OPTICAL'
                  ? 'bg-[#0F1015] border-[#D4A359] text-[#D4A359] font-bold'
                  : 'border-transparent text-[#8B909A] hover:text-[#F4F4F2]'
              }`}
            >
              CTX/HiRISE
            </button>
          </div>
        </div>

        {/* Floating Telemetry & Orbit Guide (Top Right) */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none flex flex-col items-end space-y-1.5 font-mono text-[10px]">
          <div className="bg-[#050507]/90 border border-[#181A22] px-3 py-1.5 rounded-[2px] flex items-center space-x-3 text-[#8B909A] shadow-xl">
            <div>
              <span>CAM ALT: </span>
              <span className="text-[#F4F4F2] font-semibold">{cameraTelemetry.alt}m</span>
            </div>
            <div>
              <span>AZ: </span>
              <span className="text-[#D4A359] font-semibold">{cameraTelemetry.az}°</span>
            </div>
            <div>
              <span>PITCH: </span>
              <span className="text-[#F4F4F2] font-semibold">{cameraTelemetry.pitch}°</span>
            </div>
          </div>

          <div className="bg-[#050507]/75 border border-[#181A22] px-2.5 py-1 rounded-[2px] text-[#8B909A]">
            <span>LEFT DRAG: ORBIT // RIGHT DRAG: PAN // SCROLL: ZOOM</span>
          </div>
        </div>

        {/* Trajectory Flythrough Controls Ribbon (Bottom Overlay) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#050507]/95 border border-[#181A22] p-3 rounded-[2px] shadow-2xl flex flex-col space-y-2 pointer-events-auto max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
              <span className="font-bold text-[#F4F4F2] uppercase">
                {viewMode === 'FLYTHROUGH' ? currentWaypointLabel : `EVA ROUTE: ${activeRoute?.name || 'WESTERN DELTA'}`}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-[#8B909A]">
              <span>TOTAL DISTANCE: <strong className="text-[#F4F4F2]">{activeRoute?.total_distance_km.toFixed(2)} km</strong></span>
              <span>MAX SLOPE: <strong className="text-[#D4A359]">{activeRoute?.max_slope_deg.toFixed(1)}°</strong></span>
              <span>STOPS: <strong className="text-[#64B5F6]">{stops.length} SITES</strong></span>
            </div>
          </div>

          {/* Timeline Flythrough Scrubber & Player */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => {
                if (viewMode !== 'FLYTHROUGH') setViewMode('FLYTHROUGH');
                setIsPlayingFlythrough((prev) => !prev);
              }}
              className="btn-primary py-1.5 px-3 text-xs font-mono flex items-center space-x-1.5 shrink-0"
            >
              {isPlayingFlythrough ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>{viewMode === 'FLYTHROUGH' ? 'RESUME' : 'FLY ALONG ROUTE'}</span>
                </>
              )}
            </button>

            {/* Timeline Progress Slider */}
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="range"
                aria-label="Route Flythrough Scrubber"
                min="0"
                max="1"
                step="0.005"
                value={flythroughProgress}
                onChange={(e) => {
                  if (viewMode !== 'FLYTHROUGH') setViewMode('FLYTHROUGH');
                  setFlythroughProgress(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 accent-[#C85A32] bg-[#181A22] rounded cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#8B909A] w-12 text-right">
                {Math.round(flythroughProgress * 100)}%
              </span>
            </div>

            {/* Flythrough Speed Selector */}
            <div className="flex items-center space-x-1 shrink-0">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setFlythroughSpeed(spd)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-[2px] border ${
                    flythroughSpeed === spd
                      ? 'bg-[#C85A32]/25 border-[#C85A32] text-[#E27B54] font-bold'
                      : 'bg-[#0A0B0E] border-[#181A22] text-[#8B909A]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terrain3DViewer;