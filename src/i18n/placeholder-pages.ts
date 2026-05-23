import type { Lang } from './config';
import { getContentRoutes } from '../data';
import { translations } from './translations';

export interface PlaceholderRoute {
  path: string;
  title: string;
}

export interface PlaceholderPage {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  statusText: string;
  primaryCta: string;
  secondaryCta: string;
  metaTitle: string;
  metaDescription: string;
}

const copy = {
  sr: {
    eyebrow: 'STRANICA U PRIPREMI',
    description:
      'Ova sekcija je dio redizajna sajta i trenutno je u pripremi. Uskoro ćemo objaviti puni sadržaj, dokumente i detalje za ovu oblast.',
    statusLabel: 'Uskoro dostupno',
    statusText: 'Sadržaj se priprema u skladu sa novom strukturom javnog sajta Pokreta Evropa sad.',
    primaryCta: 'Nazad na naslovnu',
    secondaryCta: 'Pišite nam',
    metaDescription: 'Stranica je u pripremi u okviru redizajna javnog sajta Pokreta Evropa sad.',
  },
  en: {
    eyebrow: 'PAGE IN PREPARATION',
    description:
      'This section is part of the website redesign and is currently being prepared. The full content, documents and details for this area will be published soon.',
    statusLabel: 'Coming soon',
    statusText: 'Content is being prepared as part of the new public website structure for the Europe Now Movement.',
    primaryCta: 'Back to home',
    secondaryCta: 'Email us',
    metaDescription: 'This page is being prepared as part of the Europe Now Movement public website redesign.',
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeInternalPath(href: string): string | null {
  if (/^(https?:|mailto:|tel:)/i.test(href) || href.startsWith('#')) {
    return null;
  }

  const [withoutHash] = href.split('#');
  const [withoutQuery] = withoutHash.split('?');
  const withSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const trimmed = withSlash.replace(/\/+$/, '');

  return trimmed || '/';
}

function titleFromPath(path: string): string {
  const segment = path.split('/').filter(Boolean).at(-1) ?? 'stranica';
  const title = segment.replace(/-/g, ' ');

  return title.charAt(0).toUpperCase() + title.slice(1);
}

function collectRoutes(node: unknown, routes: Map<string, string>): void {
  if (Array.isArray(node)) {
    node.forEach((item) => collectRoutes(item, routes));
    return;
  }

  if (!isRecord(node)) {
    return;
  }

  if (typeof node.href === 'string') {
    const path = normalizeInternalPath(node.href);
    const title = typeof node.title === 'string' ? node.title : typeof node.label === 'string' ? node.label : undefined;

    if (path && path !== '/' && title && !routes.has(path)) {
      routes.set(path, title);
    }
  }

  Object.values(node).forEach((value) => collectRoutes(value, routes));
}

export function getPlaceholderRoutes(lang: Lang): PlaceholderRoute[] {
  const routes = new Map<string, string>();
  collectRoutes(translations[lang], routes);
  getContentRoutes(lang).forEach((route) => routes.set(route.path, route.title));

  return Array.from(routes, ([path, title]) => ({ path, title })).sort((a, b) => a.path.localeCompare(b.path));
}

export function getPlaceholderPage(lang: Lang, path: string): PlaceholderPage {
  const route = getPlaceholderRoutes(lang).find((item) => item.path === path);
  const title = route?.title ?? titleFromPath(path);
  const langCopy = copy[lang];
  const suffix = lang === 'sr' ? 'U pripremi' : 'Coming soon';

  return {
    ...langCopy,
    title,
    metaTitle: `${title} | ${suffix}`,
  };
}

export function getNotFoundPage(lang: Lang): PlaceholderPage {
  const langCopy = copy[lang];
  const title = lang === 'sr' ? 'Stranica nije pronađena' : 'Page not found';

  return {
    ...langCopy,
    eyebrow: lang === 'sr' ? '404' : '404',
    title,
    description:
      lang === 'sr'
        ? 'Tražena stranica ne postoji ili je još uvijek u pripremi. Možete se vratiti na naslovnu stranicu ili nas kontaktirati.'
        : 'The requested page does not exist or is still being prepared. You can return to the homepage or contact us.',
    metaTitle: title,
  };
}
