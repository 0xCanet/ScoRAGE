const USER_AGENT = 'Mozilla/5.0 (compatible; ScoRAGE/1.0; +https://scorage.local)';

export type ExtractedLink = {
  url: string;
  text: string;
  kind:
    | 'internal'
    | 'external'
    | 'docs'
    | 'whitepaper'
    | 'tokenomics'
    | 'roadmap'
    | 'team'
    | 'legal'
    | 'x'
    | 'telegram'
    | 'discord'
    | 'github';
};

export type WebsitePageSnapshot = {
  url: string;
  title?: string;
  metaDescription?: string;
  headings: string[];
  text: string;
};

export type WebsiteObservation = {
  provided: boolean;
  reachable: boolean;
  finalUrl?: string;
  status?: number;
  https: boolean;
  domain?: string;
  title?: string;
  metaDescription?: string;
  headings: string[];
  extractedText: string;
  textLength: number;
  richness: 'rich' | 'minimal' | 'thin' | 'unknown';
  keyPages: Partial<Record<'docs' | 'whitepaper' | 'tokenomics' | 'roadmap' | 'team' | 'legal' | 'about', string>>;
  socialLinks: Partial<Record<'x' | 'telegram' | 'discord' | 'github', string>>;
  links: ExtractedLink[];
  pageSnapshots: WebsitePageSnapshot[];
  notes: string[];
  error?: string;
};

const decodeHtmlEntities = (input: string): string => input
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const stripTags = (html: string): string => decodeHtmlEntities(
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim(),
);

const extractTitle = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : undefined;
};

const extractMetaDescription = (html: string): string | undefined => {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i)
    ?? html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["'][^>]*>/i);
  return match ? decodeHtmlEntities(match[1]).trim() : undefined;
};

const extractHeadings = (html: string): string[] => {
  return Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .map((match) => stripTags(match[1]))
    .filter(Boolean)
    .slice(0, 12);
};

const cleanText = (text: string, maxLength = 4000): string => text.slice(0, maxLength).trim();

const sameOrigin = (baseUrl: URL, url: URL): boolean => baseUrl.hostname === url.hostname;

const linkKind = (baseUrl: URL, url: URL, text: string): ExtractedLink['kind'] => {
  const haystack = `${url.href} ${text}`.toLowerCase();
  if (/(whitepaper|litepaper|\.pdf)/.test(haystack)) return 'whitepaper';
  if (/(docs|documentation|gitbook)/.test(haystack)) return 'docs';
  if (/tokenomics/.test(haystack)) return 'tokenomics';
  if (/roadmap/.test(haystack)) return 'roadmap';
  if (/(team|founder|about-us|about us)/.test(haystack)) return 'team';
  if (/(legal|privacy|terms|imprint|mentions légales|compliance)/.test(haystack)) return 'legal';
  if (/(twitter\.com|x\.com)/.test(haystack)) return 'x';
  if (/t\.me|telegram/.test(haystack)) return 'telegram';
  if (/discord/.test(haystack)) return 'discord';
  if (/github\.com/.test(haystack)) return 'github';
  return sameOrigin(baseUrl, url) ? 'internal' : 'external';
};

const extractLinks = (html: string, baseUrl: URL): ExtractedLink[] => {
  const seen = new Set<string>();
  const results: ExtractedLink[] = [];

  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1], baseUrl.href);
      if (!['http:', 'https:'].includes(url.protocol)) {
        continue;
      }
      if (seen.has(url.href)) {
        continue;
      }
      seen.add(url.href);
      const text = stripTags(match[2]).slice(0, 180);
      results.push({ url: url.href, text, kind: linkKind(baseUrl, url, text) });
    } catch {
      continue;
    }
  }

  return results;
};

const classifyRichness = (textLength: number, headingCount: number): WebsiteObservation['richness'] => {
  if (textLength > 2200 || headingCount >= 6) {
    return 'rich';
  }
  if (textLength > 900 || headingCount >= 3) {
    return 'minimal';
  }
  if (textLength > 0) {
    return 'thin';
  }
  return 'unknown';
};

const fetchPage = async (url: string): Promise<{ html: string; finalUrl: string; status: number }> => {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    html: await response.text(),
    finalUrl: response.url,
    status: response.status,
  };
};

const uniqueByUrl = <T extends { url: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
};

export async function inspectWebsite(websiteUrl?: string): Promise<WebsiteObservation> {
  if (!websiteUrl) {
    return {
      provided: false,
      reachable: false,
      https: false,
      headings: [],
      extractedText: '',
      textLength: 0,
      richness: 'unknown',
      keyPages: {},
      socialLinks: {},
      links: [],
      pageSnapshots: [],
      notes: ['Aucun site fourni'],
    };
  }

  try {
    const normalizedInput = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    const homepage = await fetchPage(normalizedInput.href);
    const finalUrl = new URL(homepage.finalUrl);
    const title = extractTitle(homepage.html);
    const metaDescription = extractMetaDescription(homepage.html);
    const headings = extractHeadings(homepage.html);
    const extractedText = cleanText(stripTags(homepage.html), 6000);
    const links = uniqueByUrl(extractLinks(homepage.html, finalUrl));
    const socialLinks: WebsiteObservation['socialLinks'] = {};
    const keyPages: WebsiteObservation['keyPages'] = {};

    for (const link of links) {
      if (link.kind === 'x' && !socialLinks.x) socialLinks.x = link.url;
      if (link.kind === 'telegram' && !socialLinks.telegram) socialLinks.telegram = link.url;
      if (link.kind === 'discord' && !socialLinks.discord) socialLinks.discord = link.url;
      if (link.kind === 'github' && !socialLinks.github) socialLinks.github = link.url;
      if (link.kind === 'docs' && !keyPages.docs) keyPages.docs = link.url;
      if (link.kind === 'whitepaper' && !keyPages.whitepaper) keyPages.whitepaper = link.url;
      if (link.kind === 'tokenomics' && !keyPages.tokenomics) keyPages.tokenomics = link.url;
      if (link.kind === 'roadmap' && !keyPages.roadmap) keyPages.roadmap = link.url;
      if (link.kind === 'team' && !keyPages.team) keyPages.team = link.url;
      if (link.kind === 'legal' && !keyPages.legal) keyPages.legal = link.url;
    }

    const pagesToVisit = Object.entries(keyPages)
      .filter(([, value]) => Boolean(value))
      .slice(0, 5) as Array<[keyof WebsiteObservation['keyPages'], string]>;

    const pageSnapshots: WebsitePageSnapshot[] = [{
      url: finalUrl.href,
      title,
      metaDescription,
      headings,
      text: extractedText,
    }];

    for (const [, url] of pagesToVisit) {
      try {
        if (/\.pdf(\?|$)/i.test(url)) {
          continue;
        }
        const page = await fetchPage(url);
        pageSnapshots.push({
          url: page.finalUrl,
          title: extractTitle(page.html),
          metaDescription: extractMetaDescription(page.html),
          headings: extractHeadings(page.html),
          text: cleanText(stripTags(page.html), 3000),
        });
      } catch {
        continue;
      }
    }

    const notes = [`Site joignable (${finalUrl.hostname})`];
    if (keyPages.whitepaper) notes.push('Lien whitepaper détecté');
    if (keyPages.docs) notes.push('Documentation détectée');
    if (socialLinks.x || socialLinks.telegram || socialLinks.discord || socialLinks.github) notes.push('Présence publique détectée depuis le site');

    return {
      provided: true,
      reachable: true,
      finalUrl: finalUrl.href,
      status: homepage.status,
      https: finalUrl.protocol === 'https:',
      domain: finalUrl.hostname,
      title,
      metaDescription,
      headings,
      extractedText,
      textLength: extractedText.length,
      richness: classifyRichness(extractedText.length, headings.length),
      keyPages,
      socialLinks,
      links,
      pageSnapshots,
      notes,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch site impossible';
    return {
      provided: true,
      reachable: false,
      https: /^https:/i.test(websiteUrl),
      headings: [],
      extractedText: '',
      textLength: 0,
      richness: 'unknown',
      keyPages: {},
      socialLinks: {},
      links: [],
      pageSnapshots: [],
      notes: [message],
      error: message,
    };
  }
}
