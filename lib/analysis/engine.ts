import { randomUUID } from 'node:crypto';

import type { Evidence, EvidenceCategory, EvidenceSeverity, EvidenceSignalType } from '@/types/evidence';
import type { Project } from '@/types/project';
import { chainLabels } from '@/types/project';
import type { Report, ReportBundle, ReportRequest, ReportRequestInput } from '@/types/report';
import { scoreToVerdict, type ScoreBreakdown } from '@/types/score';

import { inspectDexscreenerToken } from './providers/dexscreener';
import { inspectDomain } from './providers/domain';
import { inspectEvmContract } from './providers/evm';
import { inspectGoPlusToken } from './providers/goplus';
import { inspectSocialSignals } from './providers/social';
import { inspectSolanaToken } from './providers/solana';
import { inspectWebsite } from './providers/website';
import { inspectWhitepaper } from './providers/whitepaper';

const methodologyVersion = 'fires-v2-real-analysis';

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));
const encodeStructuredValue = (value: unknown): string => JSON.stringify(value);

const DEFAULT_IMPACT_BY_SIGNAL: Record<Exclude<EvidenceSignalType, 'positive'>, Record<EvidenceSeverity, number>> = {
  risk: { positive: 0, warning: -10, critical: -18 },
  missing_data: { positive: 0, warning: -4, critical: -7 },
  incompatible_object: { positive: 0, warning: -6, critical: -8 },
  provider_unavailable: { positive: 0, warning: -2, critical: -4 },
};

const POSITIVE_IMPACT = 8;

const evidenceImpact = (evidence: Evidence): number => {
  if (typeof evidence.impact === 'number') {
    return evidence.impact;
  }

  if (evidence.severity === 'positive') {
    return POSITIVE_IMPACT;
  }

  const signalType = evidence.signalType ?? 'risk';
  if (signalType === 'positive') {
    return POSITIVE_IMPACT;
  }

  return DEFAULT_IMPACT_BY_SIGNAL[signalType][evidence.severity];
};

const createEvidence = (
  reportId: string,
  category: EvidenceCategory,
  severity: EvidenceSeverity,
  title: string,
  detail: string,
  createdAt: string,
  extra?: { signalType?: EvidenceSignalType; impact?: number; sourceLabel?: string; sourceUrl?: string; rawValue?: string },
): Evidence => ({
  id: randomUUID(),
  reportId,
  category,
  title,
  detail,
  severity,
  signalType: extra?.signalType ?? (severity === 'positive' ? 'positive' : 'risk'),
  impact: extra?.impact,
  sourceLabel: extra?.sourceLabel,
  sourceUrl: extra?.sourceUrl,
  rawValue: extra?.rawValue,
  createdAt,
});

const normalizeNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const isTruthy = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'y', 'ok', 'enabled', 'on'].includes(value.trim().toLowerCase());
  return false;
};

const firstRecordValue = (records: Record<string, unknown>[], keys: string[]): unknown => {
  for (const record of records) {
    for (const key of keys) {
      if (key in record && record[key] !== undefined && record[key] !== null) {
        return record[key];
      }
    }
  }
  return undefined;
};

const toTitleList = (evidences: Evidence[], predicate: (evidence: Evidence) => boolean, limit = 4): string[] =>
  evidences.filter(predicate).map((evidence) => evidence.title).slice(0, limit);

const scoreCategory = (evidences: Evidence[], category: EvidenceCategory): number => {
  const relevant = evidences.filter((evidence) => evidence.category === category);
  if (relevant.length === 0) {
    return 50;
  }
  const base = 58;
  const total = relevant.reduce((accumulator, evidence) => accumulator + evidenceImpact(evidence), base);
  return clampScore(total);
};

const buildScoreBreakdown = (evidences: Evidence[]): ScoreBreakdown => {
  const financials = scoreCategory(evidences, 'financials');
  const integrity = scoreCategory(evidences, 'integrity');
  const reputation = scoreCategory(evidences, 'reputation');
  const ecosystem = scoreCategory(evidences, 'ecosystem');
  const security = scoreCategory(evidences, 'security');

  const total = clampScore(Math.round((financials * 0.25) + (integrity * 0.25) + (reputation * 0.2) + (ecosystem * 0.15) + (security * 0.15)));

  return { financials, integrity, reputation, ecosystem, security, total };
};

const buildSummary = (projectLabel: string, chain: Project['chain'], evidences: Evidence[], verdict: ReturnType<typeof scoreToVerdict>): string => {
  const chainName = chainLabels[chain];
  const compatibility = evidences.find((evidence) => evidence.title.startsWith('Compatibilité :'))?.title.replace('Compatibilité : ', '');
  const positives = toTitleList(evidences, (evidence) => evidence.severity === 'positive', 2).join(' · ');
  const risks = toTitleList(evidences, (evidence) => evidence.signalType === 'risk' && evidence.severity !== 'positive', 2).join(' · ');
  const missing = toTitleList(evidences, (evidence) => evidence.signalType === 'missing_data', 2).join(' · ');

  const verdictLabel = verdict === 'critical' ? 'très risqué' : verdict === 'high' ? 'risqué' : verdict === 'moderate' ? 'mitigé' : 'plutôt propre';
  const parts = [
    `${projectLabel} sur ${chainName} est ${verdictLabel}.`,
    compatibility ? `Objet détecté : ${compatibility.toLowerCase()}.` : undefined,
    positives ? `Confirmé : ${positives}.` : undefined,
    risks ? `Risques principaux : ${risks}.` : undefined,
    missing ? `Informations manquantes : ${missing}.` : undefined,
  ].filter(Boolean);

  return parts.join(' ');
};

const pushPresenceEvidence = (evidences: Evidence[], reportId: string, request: ReportRequestInput, createdAt: string): void => {
  if (request.websiteUrl) {
    evidences.push(createEvidence(reportId, 'reputation', 'positive', 'Présence fournie : site officiel', 'Un site officiel a été fourni dans la demande.', createdAt, { sourceLabel: 'Formulaire ScoRAGE', sourceUrl: request.websiteUrl }));
  } else {
    evidences.push(createEvidence(reportId, 'reputation', 'warning', 'Donnée manquante : site officiel absent', 'Aucun site officiel n’a été fourni, ce qui limite fortement la lecture Fundamentals et Reputation.', createdAt, { signalType: 'missing_data', sourceLabel: 'Formulaire ScoRAGE' }));
  }

  if (request.xUrl) {
    evidences.push(createEvidence(reportId, 'reputation', 'positive', 'Présence fournie : compte X', 'Un compte X a été fourni dans la demande.', createdAt, { sourceLabel: 'Formulaire ScoRAGE', sourceUrl: request.xUrl }));
  }

  if (request.telegramUrl) {
    evidences.push(createEvidence(reportId, 'ecosystem', 'positive', 'Présence fournie : Telegram', 'Un lien Telegram a été fourni dans la demande.', createdAt, { sourceLabel: 'Formulaire ScoRAGE', sourceUrl: request.telegramUrl }));
  }

  if (request.projectName) {
    evidences.push(createEvidence(reportId, 'reputation', 'positive', 'Contexte : nom projet fourni', 'Le nom du projet a été fourni dans la demande.', createdAt, { sourceLabel: 'Formulaire ScoRAGE', rawValue: request.projectName }));
  }
};

const pushAddressQualificationEvidence = (
  evidences: Evidence[],
  reportId: string,
  request: ReportRequestInput,
  options: {
    solanaObservation: Awaited<ReturnType<typeof inspectSolanaToken>> | null;
    evmObservation: Awaited<ReturnType<typeof inspectEvmContract>> | null;
  },
  createdAt: string,
): void => {
  if (request.chain === 'solana' && options.solanaObservation) {
    const observation = options.solanaObservation;
    if (!observation.reachable) {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Provider indisponible : RPC Solana', observation.error ?? 'Le RPC Solana n’a pas répondu.', createdAt, { signalType: 'provider_unavailable', sourceLabel: 'RPC Solana' }));
      return;
    }

    if (observation.addressType === 'token_mint') {
      evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Compatibilité : token fungible Solana détecté', 'L’adresse ressemble à un mint SPL et peut être analysée comme token.', createdAt, { sourceLabel: 'RPC Solana' }));
    } else if (observation.addressType === 'program') {
      evidences.push(createEvidence(reportId, 'integrity', 'critical', 'Compatibilité : programme Solana non token', 'L’adresse fournie est un programme exécutable, pas un token fungible standard.', createdAt, { signalType: 'incompatible_object', sourceLabel: 'RPC Solana' }));
    } else if (observation.addressType === 'wallet') {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Compatibilité : wallet Solana non token', 'L’adresse fournie ressemble à un wallet / compte système, pas à un mint SPL.', createdAt, { signalType: 'incompatible_object', sourceLabel: 'RPC Solana' }));
    } else if (observation.addressType === 'account') {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Compatibilité : compte Solana non mint', 'L’adresse existe mais ne ressemble pas à un mint token standard.', createdAt, { signalType: 'incompatible_object', sourceLabel: 'RPC Solana' }));
    } else {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Compatibilité : objet Solana non confirmé', 'ScoRAGE ne peut pas confirmer que cette adresse est un token Solana standard.', createdAt, { signalType: 'missing_data', sourceLabel: 'RPC Solana' }));
    }
    return;
  }

  if (request.chain !== 'solana' && options.evmObservation) {
    const observation = options.evmObservation;
    if (!observation.reachable) {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Provider indisponible : RPC EVM', observation.error ?? 'Le RPC EVM n’a pas répondu.', createdAt, { signalType: 'provider_unavailable', sourceLabel: 'RPC EVM' }));
      return;
    }

    if (observation.contractType === 'token') {
      evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Compatibilité : token EVM détecté', `Le contrat expose des métadonnées compatibles ERC-20${observation.tokenSymbol ? ` (${observation.tokenSymbol})` : ''}.`, createdAt, { sourceLabel: 'RPC EVM' }));
    } else if (observation.contractType === 'contract') {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Compatibilité : contrat générique non token', 'Un contrat existe à cette adresse mais ScoRAGE ne détecte pas de métadonnées token standard.', createdAt, { signalType: 'incompatible_object', sourceLabel: 'RPC EVM' }));
    } else if (observation.contractType === 'wallet') {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Compatibilité : wallet EVM non token', 'Aucun bytecode n’a été détecté : l’adresse ressemble à un wallet / EOA, pas à un token.', createdAt, { signalType: 'incompatible_object', sourceLabel: 'RPC EVM' }));
    } else {
      evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Compatibilité : objet EVM non confirmé', 'ScoRAGE ne peut pas confirmer la nature token de cette adresse.', createdAt, { signalType: 'missing_data', sourceLabel: 'RPC EVM' }));
    }
  }
};

const pushChainEvidence = (
  evidences: Evidence[],
  reportId: string,
  request: ReportRequestInput,
  options: {
    solanaObservation: Awaited<ReturnType<typeof inspectSolanaToken>> | null;
    evmObservation: Awaited<ReturnType<typeof inspectEvmContract>> | null;
  },
  createdAt: string,
): void => {
  if (request.chain === 'solana' && options.solanaObservation) {
    const observation = options.solanaObservation;
    if (!observation.reachable) return;

    evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Provider : RPC Solana joignable', observation.notes[0] ?? 'Le réseau Solana répond correctement.', createdAt, { sourceLabel: 'RPC Solana', rawValue: observation.slot?.toString() }));

    if (observation.account?.exists) {
      evidences.push(createEvidence(reportId, 'integrity', 'positive', 'On-chain : adresse Solana trouvée', 'L’adresse répond bien sur Solana.', createdAt, { sourceLabel: 'RPC Solana', rawValue: observation.account.owner }));
      if (observation.addressType === 'token_mint') {
        evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Fiche contrat : mint SPL', 'ScoRAGE a structuré les faits on-chain du mint Solana analysé.', createdAt, {
          sourceLabel: 'RPC Solana',
          rawValue: encodeStructuredValue({
            addressType: observation.addressType,
            owner: observation.account.owner,
            lamports: observation.account.lamports,
            dataLength: observation.account.dataLength,
            supply: observation.account.supply,
            decimals: observation.account.decimals,
            mintAuthority: observation.account.mintAuthority,
            freezeAuthority: observation.account.freezeAuthority,
            parsedType: observation.account.parsedType,
            slot: observation.slot,
            endpoint: observation.endpoint,
          }),
        }));
      }
      if (observation.account.mintAuthority) {
        evidences.push(createEvidence(reportId, 'security', 'warning', 'Risque : mint authority active', 'Une mint authority reste visible sur le mint analysé.', createdAt, { sourceLabel: 'RPC Solana', rawValue: observation.account.mintAuthority }));
      }
      if (observation.account.freezeAuthority) {
        evidences.push(createEvidence(reportId, 'security', 'warning', 'Risque : freeze authority active', 'Une freeze authority reste visible sur le mint analysé.', createdAt, { sourceLabel: 'RPC Solana', rawValue: observation.account.freezeAuthority }));
      }
      if (!observation.account.mintAuthority && observation.addressType === 'token_mint') {
        evidences.push(createEvidence(reportId, 'security', 'positive', 'Sécurité : mint authority non visible', 'Aucune mint authority évidente n’a été remontée par le RPC.', createdAt, { sourceLabel: 'RPC Solana' }));
      }
    }
  }

  if (request.chain !== 'solana' && options.evmObservation) {
    const observation = options.evmObservation;
    if (!observation.reachable) return;

    evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Provider : RPC EVM joignable', observation.notes[0] ?? `Le RPC ${request.chain} répond correctement.`, createdAt, { sourceLabel: 'RPC EVM', rawValue: observation.blockNumber?.toString() }));

    if (observation.codeFound) {
      evidences.push(createEvidence(reportId, 'integrity', 'positive', 'On-chain : bytecode détecté', 'Un contrat a bien été détecté à cette adresse.', createdAt, { sourceLabel: 'RPC EVM', rawValue: observation.codeSize?.toString() }));
    }

    if (observation.isTokenLike) {
      if (observation.tokenName || observation.tokenSymbol) {
        evidences.push(createEvidence(reportId, 'integrity', 'positive', 'On-chain : métadonnées token lisibles', `Nom/symbole détectés${observation.tokenName || observation.tokenSymbol ? ` (${observation.tokenName ?? ''} ${observation.tokenSymbol ?? ''})`.trim() : ''}.`, createdAt, { sourceLabel: 'RPC EVM', rawValue: observation.tokenDecimals?.toString() }));
      }
      evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Fiche contrat : token EVM', 'ScoRAGE a structuré les faits on-chain du contrat EVM analysé.', createdAt, {
        sourceLabel: 'RPC EVM',
        rawValue: encodeStructuredValue({
          chain: request.chain,
          contractType: observation.contractType,
          tokenName: observation.tokenName,
          tokenSymbol: observation.tokenSymbol,
          tokenDecimals: observation.tokenDecimals,
          totalSupply: observation.totalSupply,
          codeSize: observation.codeSize,
          blockNumber: observation.blockNumber,
          endpoint: observation.endpoint,
        }),
      }));
      if (observation.totalSupply) {
        evidences.push(createEvidence(reportId, 'financials', 'positive', 'Tokenomics : total supply lisible', 'Le contrat expose un total supply consultable on-chain.', createdAt, { sourceLabel: 'RPC EVM', rawValue: observation.totalSupply }));
      }
    }
  }
};

const pushWebsiteEvidence = async (
  evidences: Evidence[],
  reportId: string,
  request: ReportRequestInput,
  createdAt: string,
): Promise<{
  website: Awaited<ReturnType<typeof inspectWebsite>>;
  whitepaper: Awaited<ReturnType<typeof inspectWhitepaper>>;
  domain: Awaited<ReturnType<typeof inspectDomain>>;
}> => {
  const website = await inspectWebsite(request.websiteUrl);
  const domain = await inspectDomain(website.domain);
  const whitepaper = await inspectWhitepaper(website);

  if (!website.provided) {
    return { website, whitepaper, domain };
  }

  if (!website.reachable) {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Donnée manquante : site non joignable', website.error ?? 'Le site fourni n’a pas pu être récupéré.', createdAt, { signalType: 'missing_data', sourceLabel: 'Fetch site', sourceUrl: request.websiteUrl }));
    return { website, whitepaper, domain };
  }

  evidences.push(createEvidence(reportId, 'financials', 'positive', 'Fundamentals : site joignable', `ScoRAGE a récupéré le site (${website.domain}).`, createdAt, { sourceLabel: 'Fetch site', sourceUrl: website.finalUrl }));

  if (website.https) {
    evidences.push(createEvidence(reportId, 'financials', 'positive', 'Fundamentals : site en HTTPS', 'Le site final est servi en HTTPS.', createdAt, { sourceLabel: 'Fetch site', sourceUrl: website.finalUrl }));
  } else {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Risque : site sans HTTPS', 'Le site final n’est pas servi en HTTPS.', createdAt, { sourceLabel: 'Fetch site', sourceUrl: website.finalUrl }));
  }

  if (website.richness === 'rich') {
    evidences.push(createEvidence(reportId, 'financials', 'positive', 'Fundamentals : site riche en contenu', 'Le site contient suffisamment de texte et de sections pour soutenir une analyse projet.', createdAt, { sourceLabel: 'Fetch site', sourceUrl: website.finalUrl, rawValue: website.textLength.toString() }));
  } else if (website.richness === 'minimal') {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Donnée manquante : site encore léger', 'Le site est joignable mais reste relativement limité en matière exploitable.', createdAt, { signalType: 'missing_data', sourceLabel: 'Fetch site', sourceUrl: website.finalUrl, rawValue: website.textLength.toString() }));
  } else {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Donnée manquante : site très pauvre', 'Le site contient très peu de matière utile pour comprendre le projet.', createdAt, { signalType: 'missing_data', sourceLabel: 'Fetch site', sourceUrl: website.finalUrl, rawValue: website.textLength.toString() }));
  }

  const keyPageChecks: Array<{ key: keyof typeof website.keyPages; title: string; category: EvidenceCategory }> = [
    { key: 'docs', title: 'docs', category: 'financials' },
    { key: 'whitepaper', title: 'whitepaper', category: 'financials' },
    { key: 'tokenomics', title: 'tokenomics', category: 'financials' },
    { key: 'roadmap', title: 'roadmap', category: 'reputation' },
    { key: 'team', title: 'team', category: 'reputation' },
    { key: 'legal', title: 'legal', category: 'financials' },
  ];

  for (const check of keyPageChecks) {
    if (website.keyPages[check.key]) {
      evidences.push(createEvidence(reportId, check.category, 'positive', `Pages clés : ${check.title} détecté(e)`, `Une page ${check.title} a été repérée depuis le site.`, createdAt, { sourceLabel: 'Analyse site', sourceUrl: website.keyPages[check.key] }));
    } else {
      evidences.push(createEvidence(reportId, check.category, 'warning', `Donnée manquante : ${check.title} non détecté(e)`, `ScoRAGE n’a pas trouvé de page ${check.title} évidente depuis le site.`, createdAt, { signalType: 'missing_data', sourceLabel: 'Analyse site', sourceUrl: website.finalUrl }));
    }
  }

  const socials: Array<{ key: keyof typeof website.socialLinks; label: string; category: EvidenceCategory }> = [
    { key: 'x', label: 'X', category: 'reputation' },
    { key: 'telegram', label: 'Telegram', category: 'ecosystem' },
    { key: 'discord', label: 'Discord', category: 'ecosystem' },
    { key: 'github', label: 'GitHub', category: 'reputation' },
  ];

  for (const social of socials) {
    if (website.socialLinks[social.key]) {
      evidences.push(createEvidence(reportId, social.category, 'positive', `Présence publique : ${social.label} détecté`, `Un lien ${social.label} a été trouvé directement sur le site.`, createdAt, { sourceLabel: 'Analyse site', sourceUrl: website.socialLinks[social.key] }));
    } else {
      evidences.push(createEvidence(reportId, social.category, 'warning', `Donnée manquante : ${social.label} non détecté`, `ScoRAGE n’a pas trouvé de lien ${social.label} directement sur le site.`, createdAt, { signalType: 'missing_data', sourceLabel: 'Analyse site', sourceUrl: website.finalUrl }));
    }
  }

  if (domain.available && domain.registeredAt) {
    if ((domain.ageDays ?? 0) < 180) {
      evidences.push(createEvidence(reportId, 'financials', 'warning', 'Risque : domaine très récent', `Le domaine semble avoir moins de 6 mois (${domain.ageDays} jours).`, createdAt, { sourceLabel: 'RDAP domaine', sourceUrl: website.finalUrl, rawValue: domain.registeredAt }));
    } else {
      evidences.push(createEvidence(reportId, 'financials', 'positive', 'Fundamentals : domaine avec historique', `Le domaine semble plus ancien (${domain.ageDays} jours).`, createdAt, { sourceLabel: 'RDAP domaine', sourceUrl: website.finalUrl, rawValue: domain.registeredAt }));
    }
  } else {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Provider indisponible : âge du domaine non confirmé', domain.error ?? 'RDAP n’a pas pu confirmer l’âge du domaine.', createdAt, { signalType: 'provider_unavailable', sourceLabel: 'RDAP domaine', sourceUrl: website.finalUrl }));
  }

  if (whitepaper.available) {
    const qualityLabel = whitepaper.quality === 'serious' ? 'document sérieux' : whitepaper.quality === 'light' ? 'document léger mais exploitable' : 'document trop mince';
    const severity: EvidenceSeverity = whitepaper.quality === 'serious' ? 'positive' : whitepaper.quality === 'light' ? 'warning' : 'warning';
    const signalType: EvidenceSignalType = whitepaper.quality === 'serious' ? 'positive' : whitepaper.quality === 'light' ? 'missing_data' : 'missing_data';
    evidences.push(createEvidence(reportId, 'financials', severity, `Whitepaper : ${qualityLabel}`, `ScoRAGE a analysé ${whitepaper.sourceType === 'pdf' ? 'un PDF' : 'une page docs'} avec ${whitepaper.sections.length} section(s) structurantes détectées.`, createdAt, { signalType, sourceLabel: 'Analyse whitepaper', sourceUrl: whitepaper.sourceUrl, rawValue: whitepaper.textLength.toString() }));
    if (whitepaper.sections.includes('risk')) {
      evidences.push(createEvidence(reportId, 'reputation', 'positive', 'Whitepaper : section risques détectée', 'Le document évoque explicitement des risques / disclaimers.', createdAt, { sourceLabel: 'Analyse whitepaper', sourceUrl: whitepaper.sourceUrl }));
    } else {
      evidences.push(createEvidence(reportId, 'reputation', 'warning', 'Donnée manquante : section risques absente du document', 'Le document analysé ne montre pas clairement de section dédiée aux risques.', createdAt, { signalType: 'missing_data', sourceLabel: 'Analyse whitepaper', sourceUrl: whitepaper.sourceUrl }));
    }
  } else {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Donnée manquante : whitepaper / litepaper non exploitable', whitepaper.error ?? 'Aucun whitepaper ou document équivalent n’a pu être analysé.', createdAt, { signalType: 'missing_data', sourceLabel: 'Analyse whitepaper', sourceUrl: website.keyPages.whitepaper ?? website.keyPages.docs }));
  }

  return { website, whitepaper, domain };
};

const socialCountSeverity = (count?: number): EvidenceSeverity => {
  if (count === undefined || !Number.isFinite(count)) {
    return 'warning';
  }
  if (count <= 0) {
    return 'critical';
  }
  if (count < 100) {
    return 'warning';
  }
  return 'positive';
};

const pushSocialEvidence = async (
  evidences: Evidence[],
  reportId: string,
  request: ReportRequestInput,
  websiteSocialLinks: Partial<Record<'x' | 'telegram' | 'discord' | 'github', string>>,
  createdAt: string,
): Promise<void> => {
  const social = await inspectSocialSignals({
    websiteSocialLinks,
    xUrl: request.xUrl,
    telegramUrl: request.telegramUrl,
    discordUrl: websiteSocialLinks.discord,
  });

  if (social.x) {
    evidences.push(createEvidence(reportId, 'reputation', 'positive', 'Social : X détecté', social.x.handle ? `Compte X relié au projet : @${social.x.handle}.` : 'Compte X relié au projet.', createdAt, {
      sourceLabel: 'Social X',
      sourceUrl: social.x.url,
      rawValue: encodeStructuredValue(social.x),
    }));
  }

  if (social.telegram) {
    const severity = socialCountSeverity(social.telegram.memberCount);
    const countLabel = social.telegram.memberCount !== undefined ? `${Math.round(social.telegram.memberCount).toLocaleString('fr-FR')} membres` : 'compte non lisible';
    evidences.push(createEvidence(reportId, 'ecosystem', severity, 'Social : Telegram', social.telegram.available && social.telegram.memberCount !== undefined
      ? `Communauté Telegram détectée (${countLabel}) via ${social.telegram.method === 'bot_api' ? 'Bot API' : 'page publique'}.`
      : 'Communauté Telegram détectée mais le nombre de membres n’a pas pu être confirmé.', createdAt, {
      signalType: social.telegram.available && social.telegram.memberCount !== undefined ? 'positive' : 'missing_data',
      sourceLabel: social.telegram.method === 'bot_api' ? 'Telegram Bot API' : 'Telegram public page',
      sourceUrl: social.telegram.url,
      rawValue: encodeStructuredValue(social.telegram),
    }));
  }

  if (social.discord) {
    const severity = socialCountSeverity(social.discord.memberCount);
    const countLabel = social.discord.memberCount !== undefined ? `${Math.round(social.discord.memberCount).toLocaleString('fr-FR')} membres` : 'compte non lisible';
    evidences.push(createEvidence(reportId, 'ecosystem', severity, 'Social : Discord', social.discord.available && social.discord.memberCount !== undefined
      ? `Serveur Discord détecté (${countLabel}) avec ${social.discord.onlineCount !== undefined ? `${Math.round(social.discord.onlineCount).toLocaleString('fr-FR')} en ligne approximativement` : 'online non confirmé'}.`
      : 'Serveur Discord détecté mais le nombre de membres n’a pas pu être confirmé.', createdAt, {
      signalType: social.discord.available && social.discord.memberCount !== undefined ? 'positive' : 'missing_data',
      sourceLabel: 'Discord API',
      sourceUrl: social.discord.url,
      rawValue: encodeStructuredValue(social.discord),
    }));
  }

  if (social.telegram && social.discord && social.telegram.memberCount !== undefined && social.discord.memberCount !== undefined) {
    const maxCount = Math.max(social.telegram.memberCount, social.discord.memberCount);
    const minCount = Math.max(1, Math.min(social.telegram.memberCount, social.discord.memberCount));
    const ratio = maxCount / minCount;
    const severity: EvidenceSeverity = ratio > 25 ? 'warning' : ratio > 10 ? 'warning' : 'positive';
    evidences.push(createEvidence(reportId, 'ecosystem', severity, 'Social : cohérence Discord / Telegram', ratio > 25
      ? `Les tailles Discord (${Math.round(social.discord.memberCount).toLocaleString('fr-FR')}) et Telegram (${Math.round(social.telegram.memberCount).toLocaleString('fr-FR')}) sont très déséquilibrées.`
      : `Les tailles Discord et Telegram semblent cohérentes (ratio ~${ratio.toFixed(1)}x).`, createdAt, {
      sourceLabel: 'Social coherence',
      rawValue: encodeStructuredValue({
        discordMemberCount: social.discord.memberCount,
        telegramMemberCount: social.telegram.memberCount,
        ratio,
      }),
    }));
  }
};

const pushDexscreenerEvidence = (evidences: Evidence[], reportId: string, observation: Awaited<ReturnType<typeof inspectDexscreenerToken>>, createdAt: string): void => {
  if (!observation.found || !observation.bestPair) {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Compatibilité marché : aucune paire détectée', 'Dexscreener ne montre pas de paire exploitable pour cette adresse.', createdAt, { signalType: 'missing_data', sourceLabel: 'Dexscreener' }));
    return;
  }

  const pairs = observation.pairs.map((pair) => ({
    chainId: pair.chainId,
    dexId: pair.dexId,
    pairAddress: pair.pairAddress,
    baseToken: pair.baseToken,
    quoteToken: pair.quoteToken,
    liquidityUsd: pair.liquidityUsd,
    volume24hUsd: pair.volume24hUsd,
    marketCap: pair.marketCap,
    fdv: pair.fdv,
    pairCreatedAt: pair.pairCreatedAt,
    pairAgeDays: pair.pairAgeDays,
    priceChange24h: pair.priceChange24h,
    txns24hBuys: pair.txns24hBuys,
    txns24hSells: pair.txns24hSells,
  }));
  const pair = observation.bestPair;

  evidences.push(createEvidence(reportId, 'financials', 'positive', 'Marché : paire de référence détectée', `Une paire de référence a été trouvée sur ${pair.dexId ?? pair.chainId}.`, createdAt, { sourceLabel: 'Dexscreener', sourceUrl: `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`, rawValue: encodeStructuredValue({ ...pairs[0], bestPairAddress: pair.pairAddress }) }));
  evidences.push(createEvidence(reportId, 'financials', 'positive', `Marché : ${pairs.length} paire(s) détectée(s)`, 'ScoRAGE a structuré les pools de liquidité récupérés sur Dexscreener.', createdAt, {
    sourceLabel: 'Dexscreener',
    sourceUrl: `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
    rawValue: encodeStructuredValue(pairs),
  }));

  const liquidity = pair.liquidityUsd ?? 0;
  if (liquidity < 5_000) {
    evidences.push(createEvidence(reportId, 'financials', 'critical', 'Risque : liquidité très faible', `La liquidité observée est très basse (${Math.round(liquidity).toLocaleString('fr-FR')} USD).`, createdAt, { sourceLabel: 'Dexscreener', rawValue: liquidity.toFixed(2) }));
  } else if (liquidity < 50_000) {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Risque : liquidité modeste', `La liquidité reste modeste (${Math.round(liquidity).toLocaleString('fr-FR')} USD).`, createdAt, { sourceLabel: 'Dexscreener', rawValue: liquidity.toFixed(2) }));
  } else {
    evidences.push(createEvidence(reportId, 'financials', 'positive', 'Marché : liquidité confortable', `La liquidité paraît plus confortable (${Math.round(liquidity).toLocaleString('fr-FR')} USD).`, createdAt, { sourceLabel: 'Dexscreener', rawValue: liquidity.toFixed(2) }));
  }

  const volume = pair.volume24hUsd ?? 0;
  if (volume < 1_000) {
    evidences.push(createEvidence(reportId, 'ecosystem', 'warning', 'Risque : volume 24h faible', `Le volume 24h reste faible (${Math.round(volume).toLocaleString('fr-FR')} USD).`, createdAt, { sourceLabel: 'Dexscreener', rawValue: volume.toFixed(2) }));
  } else {
    evidences.push(createEvidence(reportId, 'ecosystem', 'positive', 'Marché : volume 24h observé', `Le token montre une activité 24h de ${Math.round(volume).toLocaleString('fr-FR')} USD.`, createdAt, { sourceLabel: 'Dexscreener', rawValue: volume.toFixed(2) }));
  }

  if (pair.marketCap !== undefined) {
    evidences.push(createEvidence(reportId, 'financials', 'positive', 'Marché : market cap renseignée', `Dexscreener remonte une market cap d’environ ${Math.round(pair.marketCap).toLocaleString('fr-FR')} USD.`, createdAt, { sourceLabel: 'Dexscreener', rawValue: pair.marketCap.toFixed(0) }));
  }

  if (pair.fdv !== undefined) {
    evidences.push(createEvidence(reportId, 'financials', 'positive', 'Marché : FDV renseignée', `Dexscreener remonte une FDV d’environ ${Math.round(pair.fdv).toLocaleString('fr-FR')} USD.`, createdAt, { sourceLabel: 'Dexscreener', rawValue: pair.fdv.toFixed(0) }));
  }

  if (pair.pairAgeDays !== undefined) {
    if (pair.pairAgeDays < 7) {
      evidences.push(createEvidence(reportId, 'financials', 'warning', 'Risque : paire très récente', `La paire de référence semble avoir moins de 7 jours (${pair.pairAgeDays} jours).`, createdAt, { sourceLabel: 'Dexscreener', rawValue: pair.pairCreatedAt }));
    } else {
      evidences.push(createEvidence(reportId, 'financials', 'positive', 'Marché : paire avec historique', `La paire de référence semble avoir ${pair.pairAgeDays} jours.`, createdAt, { sourceLabel: 'Dexscreener', rawValue: pair.pairCreatedAt }));
    }
  }

  if (pair.priceChange24h !== undefined && Math.abs(pair.priceChange24h) > 40) {
    evidences.push(createEvidence(reportId, 'ecosystem', 'warning', 'Risque : volatilité 24h élevée', `Variation 24h d’environ ${pair.priceChange24h.toFixed(1)}%.`, createdAt, { sourceLabel: 'Dexscreener', rawValue: pair.priceChange24h.toFixed(1) }));
  }
};

const pushGoPlusEvidence = (evidences: Evidence[], reportId: string, observation: Awaited<ReturnType<typeof inspectGoPlusToken>>, createdAt: string): void => {
  if (!observation.available || observation.records.length === 0) {
    evidences.push(createEvidence(reportId, 'security', 'warning', 'Provider indisponible : GoPlus', observation.error ?? 'Aucune donnée GoPlus exploitable.', createdAt, { signalType: 'provider_unavailable', sourceLabel: 'GoPlus' }));
    return;
  }

  evidences.push(createEvidence(reportId, 'security', 'positive', 'Sécurité : scan GoPlus récupéré', 'GoPlus a renvoyé des signaux de sécurité exploitables.', createdAt, { sourceLabel: 'GoPlus' }));

  const record = observation.records[0] ?? {};
  const label = typeof record.token_name === 'string' ? record.token_name : typeof record.token_symbol === 'string' ? record.token_symbol : 'Token';

  const honeypot = isTruthy(record.is_honeypot ?? record.honeypot);
  if (honeypot) {
    evidences.push(createEvidence(reportId, 'security', 'critical', 'Risque : comportement honeypot', `${label} semble exposé à un comportement de honeypot.`, createdAt, { sourceLabel: 'GoPlus' }));
  }

  const buyTax = normalizeNumber(firstRecordValue(observation.records, ['buy_tax', 'buyFee', 'buy_fee', 'tax_buy']));
  const sellTax = normalizeNumber(firstRecordValue(observation.records, ['sell_tax', 'sellFee', 'sell_fee', 'tax_sell']));
  if (buyTax !== undefined && buyTax > 20) {
    evidences.push(createEvidence(reportId, 'financials', 'critical', 'Risque : taxe d’achat très élevée', `Taxe d’achat détectée à ${buyTax}%.`, createdAt, { sourceLabel: 'GoPlus', rawValue: buyTax.toString() }));
  } else if (buyTax !== undefined && buyTax > 10) {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Risque : taxe d’achat notable', `Taxe d’achat détectée à ${buyTax}%.`, createdAt, { sourceLabel: 'GoPlus', rawValue: buyTax.toString() }));
  }

  if (sellTax !== undefined && sellTax > 20) {
    evidences.push(createEvidence(reportId, 'financials', 'critical', 'Risque : taxe de vente très élevée', `Taxe de vente détectée à ${sellTax}%.`, createdAt, { sourceLabel: 'GoPlus', rawValue: sellTax.toString() }));
  } else if (sellTax !== undefined && sellTax > 10) {
    evidences.push(createEvidence(reportId, 'financials', 'warning', 'Risque : taxe de vente notable', `Taxe de vente détectée à ${sellTax}%.`, createdAt, { sourceLabel: 'GoPlus', rawValue: sellTax.toString() }));
  }

  if (isTruthy(record.is_proxy)) {
    evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Risque : contrat proxy', 'Le contrat semble utiliser un mécanisme proxy.', createdAt, { sourceLabel: 'GoPlus' }));
  }

  if (isTruthy(record.is_mintable ?? record.mintable ?? (record.mintable as { status?: unknown } | undefined)?.status)) {
    evidences.push(createEvidence(reportId, 'security', 'warning', 'Risque : mint encore possible', 'Le token semble encore mintable.', createdAt, { sourceLabel: 'GoPlus' }));
  }

  if (isTruthy((record.freezable as { status?: unknown } | undefined)?.status ?? record.is_freezable)) {
    evidences.push(createEvidence(reportId, 'security', 'warning', 'Risque : freeze possible', 'Le token ou ses comptes semblent encore freezables.', createdAt, { sourceLabel: 'GoPlus' }));
  }

  if (isTruthy((record.balance_mutable_authority as { status?: unknown } | undefined)?.status ?? record.balance_mutable_authority)) {
    evidences.push(createEvidence(reportId, 'integrity', 'warning', 'Risque : metadata / balance mutable', 'GoPlus remonte une capacité de mutation supplémentaire côté token.', createdAt, { sourceLabel: 'GoPlus' }));
  }

  if (isTruthy(record.can_take_back_ownership)) {
    evidences.push(createEvidence(reportId, 'integrity', 'critical', 'Risque : ownership récupérable', 'L’owner peut reprendre le contrôle du contrat.', createdAt, { sourceLabel: 'GoPlus' }));
  }

  if (isTruthy(record.is_open_source ?? record.is_verified)) {
    evidences.push(createEvidence(reportId, 'integrity', 'positive', 'Intégrité : contrat plus lisible', 'GoPlus remonte un signal de lisibilité / vérification encourageant.', createdAt, { sourceLabel: 'GoPlus' }));
  }
};

const detectMarketingRisk = (text: string): { count: number; matches: string[] } => {
  const patterns = [
    /guaranteed returns?/gi,
    /risk[- ]?free/gi,
    /100x/gi,
    /to the moon/gi,
    /passive income/gi,
    /get rich/gi,
    /no risk/gi,
    /next big thing/gi,
  ];
  const matches = patterns.flatMap((pattern) => Array.from(text.matchAll(pattern)).map((match) => match[0].toLowerCase()));
  return { count: matches.length, matches: Array.from(new Set(matches)).slice(0, 5) };
};

export async function buildAnalyzedReportBundle({
  request,
  projectId,
  reportId,
  requestId,
  createdAt,
}: {
  request: ReportRequestInput;
  projectId: string;
  reportId: string;
  requestId: string;
  createdAt: string;
}): Promise<ReportBundle> {
  const project: Project = {
    id: projectId,
    chain: request.chain,
    contractAddress: request.contractAddress,
    projectName: request.projectName,
    websiteUrl: request.websiteUrl,
    xUrl: request.xUrl,
    telegramUrl: request.telegramUrl,
    createdAt,
  };

  const evidences: Evidence[] = [];
  pushPresenceEvidence(evidences, reportId, request, createdAt);

  const [solanaObservation, evmObservation, dexscreenerObservation, goplusObservation] = await Promise.all([
    request.chain === 'solana' ? inspectSolanaToken(request.contractAddress) : Promise.resolve(null),
    request.chain !== 'solana' ? inspectEvmContract(request.chain, request.contractAddress) : Promise.resolve(null),
    inspectDexscreenerToken(request.contractAddress),
    inspectGoPlusToken(request.chain, request.contractAddress),
  ]);

  pushAddressQualificationEvidence(evidences, reportId, request, { solanaObservation, evmObservation }, createdAt);
  pushChainEvidence(evidences, reportId, request, { solanaObservation, evmObservation }, createdAt);
  const websiteBundle = await pushWebsiteEvidence(evidences, reportId, request, createdAt);
  await pushSocialEvidence(evidences, reportId, request, websiteBundle.website.socialLinks, createdAt);
  pushDexscreenerEvidence(evidences, reportId, dexscreenerObservation, createdAt);
  pushGoPlusEvidence(evidences, reportId, goplusObservation, createdAt);

  const combinedText = [websiteBundle.website.extractedText, websiteBundle.whitepaper.excerpt ?? ''].filter(Boolean).join(' ');
  const marketingRisk = detectMarketingRisk(combinedText);
  if (marketingRisk.count >= 2) {
    evidences.push(createEvidence(reportId, 'reputation', 'warning', 'Risque : communication très marketing', `Le site/document contient plusieurs formulations agressives ou promesses excessives (${marketingRisk.matches.join(', ')}).`, createdAt, { sourceLabel: 'Analyse contenu', sourceUrl: websiteBundle.website.finalUrl ?? websiteBundle.whitepaper.sourceUrl }));
  } else if (combinedText) {
    evidences.push(createEvidence(reportId, 'reputation', 'positive', 'Réputation : pas de promesse absurde évidente', 'Le contenu récupéré ne montre pas immédiatement de wording type “risk-free / 100x / guaranteed returns”.', createdAt, { sourceLabel: 'Analyse contenu', sourceUrl: websiteBundle.website.finalUrl ?? websiteBundle.whitepaper.sourceUrl }));
  }

  const score = buildScoreBreakdown(evidences);
  const verdict = scoreToVerdict(score.total);
  const projectLabel = request.projectName ?? `${chainLabels[request.chain]} contract`;
  const positives = toTitleList(evidences, (evidence) => evidence.severity === 'positive', 8);
  const redFlags = toTitleList(evidences, (evidence) => evidence.severity !== 'positive', 8);

  const report: Report = {
    id: reportId,
    projectId,
    status: 'completed',
    verdict,
    summary: buildSummary(projectLabel, request.chain, evidences, verdict),
    score,
    positives,
    redFlags,
    methodologyVersion,
    generatedAt: createdAt,
    createdAt,
  };

  const requestRecord: ReportRequest = {
    id: requestId,
    projectId,
    reportId,
    payload: request,
    createdAt,
  };

  return {
    project,
    report,
    evidences,
    request: requestRecord,
  };
}

export { methodologyVersion };
