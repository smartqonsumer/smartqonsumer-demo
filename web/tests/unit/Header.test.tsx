import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  beforeEach(() => {
    // @ts-expect-error -- minimal PostHog stub for this test
    window.posthog = { capture: vi.fn() };
  });

  it('renders every main navigation entry', () => {
    render(<Header />);
    for (const label of ['Solution', 'Comment ça marche', 'Fonctionnalités', 'Sécurité', 'FAQ']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('tracks a nav_click event when a desktop nav link is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('link', { name: 'Fonctionnalités' }));
    // @ts-expect-error -- reading back the stub set above
    expect(window.posthog.capture).toHaveBeenCalledWith('nav_click', { label: 'Fonctionnalités', menu: 'desktop' });
  });

  it('opens and closes the mobile menu', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Ouvrir le menu' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Fermer le menu' })).toBeInTheDocument();
  });

  it('closes the mobile menu on Escape and moves focus back to the toggle', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));
    expect(screen.getByRole('navigation', { name: 'Navigation mobile' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Navigation mobile' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ouvrir le menu' })).toHaveFocus();
  });
});
