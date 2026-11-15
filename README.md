# AresNav

**Human EVA planning for the Martian surface, built on NASA mission data.**

AresNav is an interactive planning tool for a future astronaut's Martian EVA traverse. It
layers NASA datasets (terrain, imagery, thermal and geology) for one region (Gale Crater /
Mount Sharp), checks terrain against configurable safety limits, and explains results with
their data sources and limitations.

Built for the **NASA Space Apps Challenge 2026: "Interplanetary Survival Guide: Martian Map"**.

> **Disclaimer.** AresNav is a research and planning prototype. Results are computational
> assessments under stated assumptions and are **not** a certified astronaut safety analysis.

---

## What works now

- **Backend (FastAPI):** regions, datasets, map layers (rendered as PNG), point inspection and
  elevation profiles. Every response keeps its data availability status and limitations.
  Missing data is reported as unavailable or UNKNOWN, never as a pass.
- **Routing and safety engines** exist in the backend code and are covered by unit tests.
  They are not all exposed through the API yet.
- **Frontend (React):** landing page, interactive map with layer panel, point inspector,
  provenance (data source) viewer, site intelligence, mission simulation and mission reports
  (export to Markdown, Word and PDF).
- **No AI service is needed.** The optional LLM features are off by default.

See `docs/DEVELOPMENT_STATUS.md` for detailed progress and planned work.

---

## Quick start (Windows)

You need an internet connection the first time. Everything else is installed for you.

1. **Get the code**
   ```powershell
   git clone https://github.com/amaz1009/AresNav.git
   cd AresNav
   ```
   Use a normal PowerShell window, not "Run as administrator", and not inside
   `C:\Windows\System32`. A folder such as `Documents` is a good place.

2. **Install everything** by double-clicking `install-requirements.bat`.
   It installs Python 3.12 and Node.js if they are missing (using `winget`), then the backend
   packages and the frontend packages. If it installs a tool, close the window and run the
   file again. Running it a second time is safe.

3. **Add the map data** (see [Map data](#map-data) below). Without it, the site starts but
   the raster layers show as unavailable.

4. **Start the app** by double-clicking `start-aresnav.bat`.
   Two windows open (backend and frontend), and your browser opens
   <http://localhost:5173> after a few seconds.

5. **Stop the app** by closing the two windows.

---

## Map data

The large NASA raster files are **not stored in git**. They live in `backend/data`:

| Folder | What it holds |
|---|---|
| `backend/data/processed` | Map layers (GeoTIFF files) that the API reads. **Required for the raster layers.** |
| `backend/data/renders` | Cache of rendered layer images. Created automatically. |
| `backend/data/raw` | Original downloaded files. Only needed to rebuild the processed data. |
| `backend/data/surface_images` | Surface imagery. |
| `backend/data/manifests`, `backend/data/regions` | Small JSON files. Already in git. |

**Option A: copy existing data.** If you already have the data (for example on another
computer or from the project owner), copy the `processed`, `raw`, `renders` and
`surface_images` folders into `backend/data`.

**Option B: rebuild it.** Three scripts in `backend/scripts` create the data, in this order:

1. `download_data.py` downloads the raw NASA files. This is a large download.
2. `process_region.py` clips them to the region and writes `processed/*.tif`.
3. `generate_terrain_layers.py` computes slope, roughness, hillshade, hazards and confidence.

Check each script's options with `--help` first, for example:
```powershell
cd backend
.\.venv\Scripts\python scripts\download_data.py --help
```

---

## Manual setup (any operating system)

Use this if you do not want the `.bat` files, or you are on macOS or Linux.

**Requirements:** Python 3.12 or newer, Node.js 20 or newer, Git.

**Backend**
```bash
cd backend
python -m venv .venv
# Windows:      .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>.

---

## How the pieces connect

| Part | Address | Notes |
|---|---|---|
| Frontend (Vite) | <http://localhost:5173> | The web interface. |
| Backend (FastAPI) | <http://127.0.0.1:8000> | Health check: `/api/v1/health`. API docs: `/docs`. |

The frontend sends every `/api/...` request to the backend through the Vite dev proxy
(configured in `frontend/vite.config.ts`), so you do not need to configure anything locally.

**Settings** are read from a `.env` file in the repository root. The installer creates it
from `.env.example`. The defaults work for local use. Never commit `.env`.

### Open it to other devices on your network (optional)

`start-aresnav.bat` runs the frontend with `--host`, so other devices on your Wi-Fi can open
`http://<your-computer-IP>:5173` (find the IP with `ipconfig`). Windows Firewall may block
this. To allow it, run this once in an administrator PowerShell:
```powershell
New-NetFirewallRule -DisplayName "Vite 5173" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Private
```
Use this only on networks you trust. The dev server has no login.

---

## Running the tests

```powershell
# Frontend
cd frontend
npm test

# Backend
cd backend
.\.venv\Scripts\python -m pytest
```

Notes from the last run on a machine **without** the map data:
- Frontend: 69 of 69 tests pass.
- Backend: 136 of 140 pass. Four tests in `tests/unit/api/test_layer_api.py` need the
  `slope` raster from `backend/data/processed` and fail when it is missing.

---

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Map layers are blank, or an API call returns `LAYER_UNAVAILABLE` | The map data is missing. See [Map data](#map-data). |
| `'py' is not recognized` or `.venv\Scripts\python` is not found | Python 3.12 or the virtual environment is missing. Run `install-requirements.bat`. |
| `ModuleNotFoundError: No module named 'fastapi'` | Backend packages are not installed. Run `install-requirements.bat`. |
| Browser shows the page but data calls fail (502 or connection refused) | The backend is not running. Check the "AresNav Backend" window for errors. |
| "Address already in use" on port 8000 or 5173 | The app is already running. Close the old windows first. |
| Other devices cannot open the site | Allow port 5173 in the firewall, and make sure your network is set to Private. |
| The project was cloned into `C:\Windows\System32` | Delete it, and clone again into a normal folder such as `Documents`. |

---

## Project layout

```
backend/            FastAPI app, terrain, hazard and routing engines, data scripts, tests
  app/              API, services, engines, models, configuration
  data/             Map data (see above)
  scripts/          Data download and processing scripts
  requirements.txt  Python packages
frontend/           React + TypeScript + Vite interface, with tests
docs/               Architecture, API contracts, science and safety specification
install-requirements.bat   One-time setup for a new Windows PC
start-aresnav.bat         Starts the backend and frontend together
.env.example               Settings template (copy to .env)
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) | Architecture, decisions, conventions |
| [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) | Endpoints, shared models, configuration, data dictionary |
| [`docs/SCIENCE_AND_SAFETY_SPEC.md`](docs/SCIENCE_AND_SAFETY_SPEC.md) | Formulas, EVA model, routing, safety rules, references |
| [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) | NASA datasets and provenance |
| [`docs/TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) | Test catalogue and procedures |
| [`docs/DEMO_SCENARIO.md`](docs/DEMO_SCENARIO.md) | Walkthrough for a demonstration |
| [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) | Live progress |

---

## Tech stack

Backend: Python 3.12+, FastAPI, Pydantic v2, NumPy, rasterio, pyproj, Shapely.
Frontend: React, TypeScript, Vite, Tailwind CSS, Leaflet, Recharts, Zustand, three.js.