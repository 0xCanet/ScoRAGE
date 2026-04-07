export const navItems = [
  { label: 'Comment ça marche', href: '#process' },
  { label: 'F.I.R.E.S.', href: '#fires' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const processSteps = [
  {
    number: '01',
    title: "Colle l'adresse",
    description: 'Un champ. 4 chaînes. Copie-colle le contrat du token.',
  },
  {
    number: '02',
    title: 'ScoRAGE scanne',
    description: 'On-chain, off-chain, social. Scoring F.I.R.E.S. sur 5 dimensions. 2 à 5 min.',
  },
  {
    number: '03',
    title: 'Verdict + rapport',
    description: 'Score, alertes, points rassurants, analyse. Web + PDF. Tu décides.',
  },
];

export const firesItems = [
  {
    key: 'financials',
    letter: 'F',
    name: 'Financials',
    description:
      'Analyse de la structure financière du token : répartition du supply, liquidité, mécanismes de lock et concentration des wallets majeurs.',
    criteria: [
      'Distribution du supply',
      'Profondeur de liquidité',
      'Lock / vesting schedule',
      'Concentration top wallets',
      'Analyse des taxes achat/vente',
    ],
  },
  {
    key: 'integrity',
    letter: 'I',
    name: 'Integrity',
    description:
      'Vérification de la cohérence entre les promesses du projet et sa réalité technique. Le whitepaper dit-il la vérité ? Le contrat fait-il ce qu\u2019il prétend ?',
    criteria: [
      'Cohérence whitepaper / contrat',
      'Audit smart contract',
      "Transparence de l'équipe",
      'Roadmap vs. livraisons',
      'Code source ouvert',
    ],
  },
  {
    key: 'reputation',
    letter: 'R',
    name: 'Reputation',
    description:
      'Historique des fondateurs et du projet. Liens avec des scams passés, track record vérifiable et sentiment communautaire réel vs. artificiel.',
    criteria: [
      'Historique fondateurs',
      'Liens avec des scams précédents',
      'Sentiment social réel',
      'Détection de bots',
      'Engagement communautaire',
    ],
  },
  {
    key: 'ecosystem',
    letter: 'E',
    name: 'Ecosystem',
    description:
      "La santé de l'écosystème autour du projet. TVL, intégrations DeFi réelles, activité développeur et partenariats vérifiables.",
    criteria: [
      'TVL & volume réel',
      'Intégrations DeFi',
      'Activité développeurs',
      'Partenariats vérifiables',
      'Présence multi-chain',
    ],
  },
  {
    key: 'security',
    letter: 'S',
    name: 'Security',
    description:
      'Analyse technique du smart contract. Détection de vulnérabilités, patterns de rugpull, honeypot et fonctions dangereuses.',
    criteria: [
      'Détection honeypot',
      'Patterns de rugpull',
      'Fonctions mint / pause',
      'Proxy upgradeable',
      'Privilèges owner',
    ],
  },
];

export const chains = [
  { name: 'Solana', description: 'Pump.fun, memecoins, 1 000 tokens/jour' },
  { name: 'BSC', description: 'Honeypots, low-caps toxiques, volume massif' },
  { name: 'Base', description: 'L2 en explosion, copycats quotidiens' },
  { name: 'Ethereum', description: 'DeFi majeur, contracts complexes, gros enjeux' },
];

export const pricingTiers = [
  {
    name: 'Starter',
    price: '0 €',
    period: '3 analyses / mois · aucune carte',
    featured: false,
    cta: 'Essayer gratuitement',
    ctaClassName: 'btn-secondary',
    features: [
      'Rapport Web complet',
      'Score F.I.R.E.S. + verdict',
      'Alertes détaillées',
      'Export PDF — bientôt',
      'Historique — bientôt',
    ],
  },
  {
    name: 'Pro',
    price: '29 € / mois',
    period: 'Sans engagement · annule quand tu veux',
    featured: true,
    cta: 'Passer Pro',
    ctaClassName: 'btn-primary',
    features: [
      '50 analyses / mois',
      'Rapport Web + export PDF',
      'Historique complet',
      'Rapports partageables',
      'Alertes score critique',
    ],
  },
];

export const faqs = [
  {
    question: "C'est un audit ?",
    answer:
      "Non. ScoRAGE est un filtre rapide. Verdict structuré pour décider : ignorer, surveiller ou creuser. C'est ce que tu fais avant un audit, pas à la place.",
  },
  {
    question: 'Le score est-il fiable à 100 % ?',
    answer:
      'Non. Quiconque dit le contraire ment. ScoRAGE détecte des patterns de risque connus. Aide à la décision, pas boule de cristal.',
  },
  {
    question: 'Combien de temps pour un rapport ?',
    answer: '2 à 5 minutes. Colle l\u2019adresse, le rapport arrive. Web + PDF.',
  },
  {
    question: 'Quelles chaînes sont prises en charge ?',
    answer: 'V1 : Solana, BSC, Base, Ethereum. Là où ça brûle le plus. D\u2019autres suivront.',
  },
  {
    question: "C'est gratuit ?",
    answer: '3 analyses gratuites par mois. Pro à 29 €/mois : 50 analyses, PDF, historique. Sans engagement.',
  },
];
