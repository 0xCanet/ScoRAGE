const USER_AGENT = 'Mozilla/5.0 (compatible; ScoRAGE/1.0; +https://scorage.local)';

export type SocialChannelKind = 'x' | 'telegram' | 'discord';

export type SocialChannelObservation = {
  kind: SocialChannelKind;
  url?: string;
  handle?: string;
  username?: string;
  inviteCode?: string;
  memberCount?: number;
  onlineCount?: number;
  method?: 'public_page' | 'bot_api' | 'discord_api' | 'url_only';
  available: boolean;
  notes: string[];
  error?: string;
};

export type SocialObservation = {
  x?: SocialChannelObservation;
  telegram?: SocialChannelObservation;
  discord?: SocialChannelObservation;
  notes: string[];
};

const normalizeUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const extractHandleFromUrl = (url?: string): string | undefined => {
  const normalized = normalizeUrl(url);
  if (!normalized) return undefined;
  try {
    const parsed = new URL(normalized.startsWith('http') ? normalized : `https://${normalized}`);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const handle = parts[0];
    if (!handle) return undefined;
    if (handle.startsWith('@')) return handle.slice(1);
    return handle.replace(/^@/, '');
  } catch {
    return undefined;
  }
};

const extractTelegramUsername = (url?: string): string | undefined => {
  const normalized = normalizeUrl(url);
  if (!normalized) return undefined;
  try {
    const parsed = new URL(normalized.startsWith('http') ? normalized : `https://${normalized}`);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return undefined;
    const [first, second] = parts;
    if (first === 's' && second) return second.replace(/^@/, '');
    if (first === 'c') return undefined;
    return first.replace(/^@/, '');
  } catch {
    return undefined;
  }
};

const extractDiscordInviteCode = (url?: string): string | undefined => {
  const normalized = normalizeUrl(url);
  if (!normalized) return undefined;
  try {
    const parsed = new URL(normalized.startsWith('http') ? normalized : `https://${normalized}`);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return undefined;
    if (parts[0] === 'invite' && parts[1]) return parts[1];
    if (parts[0] === 'api' && parts[1] === 'invites' && parts[2]) return parts[2];
    if (parsed.hostname === 'discord.gg' || parsed.hostname === 'www.discord.gg') return parts[0];
    return parts[parts.length - 1];
  } catch {
    return undefined;
  }
};

const parseCompactCount = (value: string): number | undefined => {
  const cleaned = value.trim().replace(/,/g, '').replace(/\s+/g, ' ');
  const match = cleaned.match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return undefined;
  const amount = Number.parseFloat(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  const suffix = match[2]?.toUpperCase();
  if (suffix === 'K') return Math.round(amount * 1_000);
  if (suffix === 'M') return Math.round(amount * 1_000_000);
  if (suffix === 'B') return Math.round(amount * 1_000_000_000);
  return Math.round(amount);
};

const formatCount = (value?: number): string => {
  if (value === undefined || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
};

const fetchDiscordInvite = async (inviteCode: string, url?: string): Promise<SocialChannelObservation> => {
  const apiUrl = `https://discord.com/api/v10/invites/${encodeURIComponent(inviteCode)}?with_counts=true`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
    });

    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    if (!response.ok) {
      return {
        kind: 'discord',
        url,
        inviteCode,
        available: false,
        method: 'discord_api',
        notes: [`Discord API HTTP ${response.status}`],
        error: typeof payload === 'object' && payload && typeof payload.message === 'string' ? payload.message : `HTTP ${response.status}`,
      };
    }

    const memberCount = typeof payload.approximate_member_count === 'number' ? payload.approximate_member_count : undefined;
    const onlineCount = typeof payload.approximate_presence_count === 'number' ? payload.approximate_presence_count : undefined;
    const guildName = typeof payload.guild?.name === 'string' ? payload.guild.name : undefined;

    return {
      kind: 'discord',
      url,
      inviteCode,
      memberCount,
      onlineCount,
      available: true,
      method: 'discord_api',
      notes: [
        guildName ? `Serveur détecté : ${guildName}` : 'Invite Discord valide',
        memberCount !== undefined ? `Membres approximatifs : ${formatCount(memberCount)}` : 'Membres non retournés',
        onlineCount !== undefined ? `Online approximatif : ${formatCount(onlineCount)}` : 'Online non retourné',
      ],
    };
  } catch (error) {
    return {
      kind: 'discord',
      url,
      inviteCode,
      available: false,
      method: 'discord_api',
      notes: ['Discord API inaccessible'],
      error: error instanceof Error ? error.message : 'Discord API inaccessible',
    };
  }
};

const fetchTelegramMemberCountFromBotApi = async (username: string, url?: string): Promise<SocialChannelObservation | null> => {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || process.env.TELEGRAM_BOT_API_TOKEN?.trim();
  if (!token) return null;

  try {
    const apiUrl = `https://api.telegram.org/bot${encodeURIComponent(token)}/getChatMemberCount?chat_id=@${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, {
      headers: {
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
    });
    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    if (!response.ok || payload.ok !== true) {
      return {
        kind: 'telegram',
        url,
        username,
        available: false,
        method: 'bot_api',
        notes: ['Telegram Bot API inaccessible'],
        error: typeof payload.description === 'string' ? payload.description : `HTTP ${response.status}`,
      };
    }

    return {
      kind: 'telegram',
      url,
      username,
      memberCount: typeof payload.result === 'number' ? payload.result : undefined,
      available: true,
      method: 'bot_api',
      notes: [
        typeof payload.result === 'number' ? `Membres : ${formatCount(payload.result)}` : 'Nombre de membres non retourné',
        'Source: Telegram Bot API',
      ],
    };
  } catch (error) {
    return {
      kind: 'telegram',
      url,
      username,
      available: false,
      method: 'bot_api',
      notes: ['Telegram Bot API inaccessible'],
      error: error instanceof Error ? error.message : 'Telegram Bot API inaccessible',
    };
  }
};

const fetchTelegramMemberCountFromPublicPage = async (username: string, url?: string): Promise<SocialChannelObservation> => {
  const pageUrl = `https://t.me/s/${encodeURIComponent(username)}`;
  try {
    const response = await fetch(pageUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': USER_AGENT,
      },
    });
    const html = await response.text();
    if (!response.ok) {
      return {
        kind: 'telegram',
        url,
        username,
        available: false,
        method: 'public_page',
        notes: [`Telegram page HTTP ${response.status}`],
        error: `HTTP ${response.status}`,
      };
    }

    const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const countMatch = text.match(/([\d.,]+\s*[KMB]?)\s+subscribers?/i) ?? text.match(/([\d.,]+\s*[KMB]?)\s+members?/i);
    const memberCount = countMatch ? parseCompactCount(countMatch[1]) : undefined;

    return {
      kind: 'telegram',
      url,
      username,
      memberCount,
      available: true,
      method: 'public_page',
      notes: [
        memberCount !== undefined ? `Membres : ${formatCount(memberCount)}` : 'Membres non lisibles dans la page publique',
        'Source: page Telegram publique',
      ],
    };
  } catch (error) {
    return {
      kind: 'telegram',
      url,
      username,
      available: false,
      method: 'public_page',
      notes: ['Page Telegram publique inaccessible'],
      error: error instanceof Error ? error.message : 'Page Telegram publique inaccessible',
    };
  }
};

const fetchTelegramObservation = async (url?: string): Promise<SocialChannelObservation | undefined> => {
  const username = extractTelegramUsername(url);
  if (!username) return undefined;

  const fromBotApi = await fetchTelegramMemberCountFromBotApi(username, url);
  if (fromBotApi?.available) return fromBotApi;
  return fetchTelegramMemberCountFromPublicPage(username, url);
};

export function inspectSocialSignals(input: {
  websiteSocialLinks?: Partial<Record<'x' | 'telegram' | 'discord' | 'github', string>>;
  xUrl?: string;
  telegramUrl?: string;
  discordUrl?: string;
}): Promise<SocialObservation> {
  const xUrl = normalizeUrl(input.xUrl ?? input.websiteSocialLinks?.x);
  const telegramUrl = normalizeUrl(input.telegramUrl ?? input.websiteSocialLinks?.telegram);
  const discordUrl = normalizeUrl(input.discordUrl ?? input.websiteSocialLinks?.discord);

  return Promise.all([
    xUrl ? Promise.resolve({
      kind: 'x' as const,
      url: xUrl,
      handle: extractHandleFromUrl(xUrl),
      available: true,
      method: 'url_only' as const,
      notes: [
        extractHandleFromUrl(xUrl) ? `Handle détecté : @${extractHandleFromUrl(xUrl)}` : 'Compte X détecté',
        'Analyse X authentifiée non branchée en V1',
      ],
    }) : Promise.resolve(undefined),
    telegramUrl ? fetchTelegramObservation(telegramUrl) : Promise.resolve(undefined),
    discordUrl ? fetchDiscordInvite(extractDiscordInviteCode(discordUrl) ?? discordUrl, discordUrl) : Promise.resolve(undefined),
  ]).then(([x, telegram, discord]) => ({
    x,
    telegram,
    discord,
    notes: [
      x?.notes[0],
      telegram?.notes[0],
      discord?.notes[0],
    ].filter((value): value is string => Boolean(value)),
  }));
}

export { extractDiscordInviteCode, extractHandleFromUrl, extractTelegramUsername, parseCompactCount, formatCount };
