import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from '../../src/features/landing/LandingPage';

describe('LandingPage Feature', () => {
  it('renders project identity, NASA challenge context, and core mission description', () => {
    render(<LandingPage onEnterWorkstation={() => {}} />);

    expect(screen.getAllByText(/AresNav/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Surface Intelligence & Mission Planning for/i)).toBeInTheDocument();
    expect(screen.getByText(/Human Exploration of Mars/i)).toBeInTheDocument();
    expect(screen.getAllByText(/NASA SPACE APPS 2026/i).length).toBeGreaterThan(0);
  });

  it('renders mission directive showcase in place of the imagebox', () => {
    render(<LandingPage onEnterWorkstation={() => {}} />);

    const card = screen.getByTestId('mission-directive-card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText(/Surface Intelligence & Mission Planning for/i)).toBeInTheDocument();
    expect(screen.getByText(/Human Exploration of Mars/i)).toBeInTheDocument();
    expect(screen.getByText(/MISSION DIRECTIVE/i)).toBeInTheDocument();
  });

  it('displays the three analytical decision pillars: site, traverse, and feasibility', () => {
    render(<LandingPage onEnterWorkstation={() => {}} />);

    expect(screen.getByText('Site Suitability & Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Terrain-Aware Traverse Routing')).toBeInTheDocument();
    expect(screen.getByText('Deterministic Consumables Modeling')).toBeInTheDocument();
  });

  it('invokes onEnterWorkstation when the CTA button is clicked', () => {
    const handleEnter = vi.fn();
    render(<LandingPage onEnterWorkstation={handleEnter} />);

    const ctaButtons = screen.getAllByRole('button', { name: /ENTER MISSION WORKSTATION/i });
    expect(ctaButtons.length).toBeGreaterThan(0);
    fireEvent.click(ctaButtons[0]);

    expect(handleEnter).toHaveBeenCalledTimes(1);
  });

  it('renders interactive scroll wheel indicator with scroll prompt', () => {
    render(<LandingPage onEnterWorkstation={() => {}} />);

    const scrollWheel = screen.getByTestId('scroll-wheel');
    expect(scrollWheel).toBeInTheDocument();
    expect(screen.getByText(/SCROLL TO EXPLORE/i)).toBeInTheDocument();

    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    fireEvent.click(scrollWheel);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
