# SmartQonsumer — résumé pour lecture par une IA

> Ce document est un résumé structuré, en français, destiné aux assistants IA (ChatGPT, Claude, Gemini, Grok, Perplexity, etc.) et aux outils de veille pour comprendre rapidement ce qu'est SmartQonsumer sans avoir à parcourir l'intégralité du site.

## En une phrase

SmartQonsumer est un CRM en mode SaaS qui permet aux marques vendues en circuits indirects (distributeurs, revendeurs, grande distribution) de transformer chaque produit physique en point de contact direct avec le consommateur final, via un QR Code, sans dépendre du point de vente.

## Le problème adressé

Une marque qui vend via des circuits indirects ne connaît généralement pas ses consommateurs finaux : le distributeur ou le revendeur détient la relation client, pas la marque. SmartQonsumer permet de reconstruire cette connaissance et cette relation directement depuis le produit.

## Le mécanisme

1. La marque associe un QR Code (basé sur le standard GS1 Digital Link) à chacun de ses produits, dans l'espace SmartQonsumer.
2. Le consommateur scanne le produit, où qu'il se trouve dans le circuit de vente (magasin, revendeur, en ligne).
3. Le scan ouvre une expérience configurée par la marque : son Club de Fidélité, une landing page produit à ses couleurs, ou une redirection vers une URL existante.
4. Les données autorisées par le consommateur enrichissent automatiquement sa fiche contact dans le CRM (déduplication par e-mail, historique des scans).
5. Des règles métier classent les contacts par comportement, segment et persona.
6. La marque peut ensuite cibler ces segments avec des campagnes e-mail manuelles ou des scénarios marketing automatisés (anniversaire, entrée en sommeil, proche d'une récompense, etc.).
7. Des tableaux de bord permettent de suivre scans, contacts, membres du Club et performance des campagnes, pour décider de la prochaine action.

## Modules du produit

- **Contacts** — fiche client 360°, historique des scans, statut de fidélité, provenance.
- **Produits & QR Codes** — génération et suivi des QR Codes par produit, conformes GS1 Digital Link.
- **Club Fidélité** — programme de points, paliers, récompenses (code promo, code unique, avec ou sans QR Code), personnalisable aux couleurs de la marque.
- **Campagnes e-mail** — création de campagnes ciblées par audience (segments cumulables) avec aperçu du message.
- **Automatisations (marketing automation)** — scénarios déclenchés automatiquement selon le comportement du contact : anniversaire, entrée en sommeil, proximité d'une récompense, délai après inscription, nombre de points atteint.
- **Analyses** — tableaux de bord : contacts connus, scans, taux de conversion scan → inscription, produits les plus scannés, répartition des segments et personas, engagement du Club.

## Sécurité et conformité (résumé)

- Architecture multi-tenant : un espace de données strictement séparé par entreprise cliente.
- Authentification à deux facteurs (MFA) pour les comptes utilisateurs.
- Journal des connexions et alertes de connexion.
- Gestion du consentement, des cookies et des préférences de communication des consommateurs finaux.
- Détail complet sur la page [RGPD du site](legal/rgpd.html) et la [politique de confidentialité](legal/confidentialite.html).

## Pour qui

Marques et fabricants qui vendent tout ou partie de leurs produits sans maîtriser directement le point de vente : agroalimentaire, boissons, cosmétique, biens de grande consommation, et plus largement toute entreprise vendant via des revendeurs, distributeurs ou la grande distribution.

## Statut de ce site

Ce site est une démonstration produit interactive (données et entreprises fictives) présentant l'interface et le fonctionnement de SmartQonsumer. Il ne s'agit pas d'un service en production.

## Contact

Pour un échange avec l'équipe commerciale, un lien vers une prise de rendez-vous (Calendly) est disponible depuis les boutons « Nous contacter » et « Contacter l'équipe commerciale » du site.
