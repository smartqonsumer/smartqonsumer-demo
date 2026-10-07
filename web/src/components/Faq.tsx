import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { siteConfig } from '@/lib/site-config';

const FAQ_ITEMS = [
  {
    question: 'Dois-je changer mes étiquettes ?',
    answer:
      'Non. Le QR peut être ajouté sur une étiquette existante, un packaging, une affiche ou tout autre support déjà en circulation.',
  },
  {
    question: "Que se passe-t-il lorsqu'un client scanne ?",
    answer:
      "Il arrive sur une landing page à votre image et peut découvrir un contenu. S'il rejoint votre programme de fidélité ou laisse ses coordonnées, sa fiche client est créée ou mise à jour automatiquement.",
  },
  {
    question: 'Est-ce que mes données restent ma propriété ?',
    answer:
      "Oui. Contrairement à un programme de fidélité d'enseigne, la donnée collectée vous appartient et n'est partagée avec personne. En fin de contrat, vous disposez de 30 jours pour exporter vos données ; elles sont ensuite supprimées ou anonymisées.",
  },
  {
    question: 'Faut-il installer une application ?',
    answer: 'Non, ni pour vous ni pour vos consommateurs. Tout se passe dans le navigateur, dès le scan.',
  },
  {
    question: 'Puis-je commencer avec un seul produit ?',
    answer:
      "Oui. La plupart des marques démarrent avec un seul produit avant d'étendre progressivement à tout leur catalogue.",
  },
] as const;

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${siteConfig.url}/#faq`,
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container>
        <SectionHeading eyebrow="Questions fréquentes" title="Tout savoir avant de se lancer." />
        <Reveal className="mx-auto mt-12 max-w-[760px] space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group rounded-lg border border-neutral-200 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-neutral-950 marker:content-none">
                {item.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{item.answer}</p>
            </details>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
