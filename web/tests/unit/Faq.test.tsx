import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Faq } from '@/components/Faq';

describe('Faq', () => {
  it('renders every question as an accordion item', () => {
    render(<Faq />);
    expect(screen.getByText('Dois-je changer mes étiquettes ?')).toBeInTheDocument();
    expect(screen.getByText('Puis-je commencer avec un seul produit ?')).toBeInTheDocument();
  });

  it('emits a valid FAQPage JSON-LD block matching the visible questions', () => {
    const { container } = render(<Faq />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const jsonLd = JSON.parse(script?.innerHTML ?? '{}');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(5);
    expect(jsonLd.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Dois-je changer mes étiquettes ?',
    });
    // No literal HTML-entity artifacts should leak into structured data.
    for (const item of jsonLd.mainEntity) {
      expect(item.name).not.toMatch(/&\w+;/);
      expect(item.acceptedAnswer.text).not.toMatch(/&\w+;/);
    }
  });
});
