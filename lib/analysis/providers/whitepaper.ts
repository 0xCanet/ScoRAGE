import { PDFParse } from 'pdf-parse';

import type { WebsiteObservation } from './website';

export type WhitepaperObservation = {
  available: boolean;
  sourceUrl?: string;
  sourceType?: 'pdf' | 'html';
  textLength: number;
  sections: string[];
  quality: 'serious' | 'light' | 'thin' | 'missing';
  excerpt?: string;
  notes: string[];
  error?: string;
};

const extractHtmlText = (html: string): string => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();

const detectSections = (text: string): string[] => {
  const haystack = text.toLowerCase();
  const sections: string[] = [];
  if (/(tokenomics|allocation|supply|vesting)/.test(haystack)) sections.push('tokenomics');
  if (/(use case|utility|problem|solution)/.test(haystack)) sections.push('use_case');
  if (/(roadmap|milestones|timeline)/.test(haystack)) sections.push('roadmap');
  if (/(governance|dao|vote)/.test(haystack)) sections.push('governance');
  if (/(team|founder|contributors)/.test(haystack)) sections.push('team');
  if (/(risk|risks|disclaimer|warning)/.test(haystack)) sections.push('risk');
  return sections;
};

const qualityFromText = (textLength: number, sectionCount: number): WhitepaperObservation['quality'] => {
  if (textLength > 7000 && sectionCount >= 4) return 'serious';
  if (textLength > 2500 && sectionCount >= 2) return 'light';
  if (textLength > 0) return 'thin';
  return 'missing';
};

const excerpt = (text: string): string | undefined => {
  const value = text.slice(0, 500).trim();
  return value || undefined;
};

export async function inspectWhitepaper(website: WebsiteObservation): Promise<WhitepaperObservation> {
  const candidateUrl = website.keyPages.whitepaper ?? website.keyPages.docs;
  if (!candidateUrl) {
    return {
      available: false,
      textLength: 0,
      sections: [],
      quality: 'missing',
      notes: ['Aucun whitepaper ni page de docs exploitable détecté'],
    };
  }

  try {
    if (/\.pdf(\?|$)/i.test(candidateUrl)) {
      const response = await fetch(candidateUrl, {
        headers: {
          'user-agent': 'ScoRAGE/1.0',
          accept: 'application/pdf,*/*',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
      const parsed = await parser.getText();
      await parser.destroy();
      const text = parsed.text.replace(/\s+/g, ' ').trim();
      const sections = detectSections(text);
      return {
        available: true,
        sourceUrl: candidateUrl,
        sourceType: 'pdf',
        textLength: text.length,
        sections,
        quality: qualityFromText(text.length, sections.length),
        excerpt: excerpt(text),
        notes: ['PDF analysé'],
      };
    }

    const response = await fetch(candidateUrl, {
      headers: {
        'user-agent': 'ScoRAGE/1.0',
        accept: 'text/html,*/*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const html = await response.text();
    const text = extractHtmlText(html);
    const sections = detectSections(text);
    return {
      available: true,
      sourceUrl: candidateUrl,
      sourceType: 'html',
      textLength: text.length,
      sections,
      quality: qualityFromText(text.length, sections.length),
      excerpt: excerpt(text),
      notes: ['Page docs/whitepaper analysée'],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analyse whitepaper impossible';
    return {
      available: false,
      sourceUrl: candidateUrl,
      textLength: 0,
      sections: [],
      quality: 'missing',
      notes: [message],
      error: message,
    };
  }
}
