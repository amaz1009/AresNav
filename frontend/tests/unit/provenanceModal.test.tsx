import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProvenanceModal } from '../../src/features/common/ProvenanceModal';
import { SAMPLE_DATASETS } from '../../src/features/mock/sampleData';

describe('ProvenanceModal (WP-09)', () => {
  it('renders nothing when dataset is null', () => {
    const { container } = render(
      <ProvenanceModal dataset={null} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders full scientific citation and limitations when dataset is provided', () => {
    const dataset = SAMPLE_DATASETS[0];
    const onClose = vi.fn();

    render(<ProvenanceModal dataset={dataset} onClose={onClose} />);

    expect(screen.getByText('HIRISE_DTM_GALE_MOUND')).toBeInTheDocument();
    expect(screen.getByText('Mars Reconnaissance Orbiter')).toBeInTheDocument();
    expect(
      screen.getAllByText(/High Resolution Imaging Science Experiment/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/McEwen, A.S., et al./i)).toBeInTheDocument();
    expect(
      screen.getByText(/Coverage limited to the HiRISE stereo pair footprint/i)
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
