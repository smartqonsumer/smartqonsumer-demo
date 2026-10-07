import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('links every legal page as a real static route', () => {
    render(<Footer />);
    expect(screen.queryByRole('link', { name: 'CGV' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Confidentialité' })).toHaveAttribute('href', '/legal/confidentialite/');
    expect(screen.getByRole('link', { name: 'RGPD' })).toHaveAttribute('href', '/legal/rgpd/');
    expect(screen.getByRole('link', { name: 'Mentions légales' })).toHaveAttribute('href', '/legal/mentions-legales/');
  });

  it('links product sections to in-page anchors', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Fonctionnalités' })).toHaveAttribute('href', '#features');
  });
});
