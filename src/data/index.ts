import type { Lang } from '../i18n/config';

import documentsData from './documents.json';
import newsData from './news.json';
import organizationData from './organization.json';
import programData from './program.json';
import resultsData from './results.json';

type Localized<T> = Record<Lang, T>;
type NewsTone = 'eu' | 'team' | 'coast';
type ResultTone = 'people' | 'road' | 'flag' | 'education';

interface ContentRoute {
  path: string;
  title: string;
}

interface RawNewsItem {
  slug: string;
  date: string;
  category: string;
  tone: NewsTone;
  imageSrc?: string;
  featured: boolean;
  translations: Localized<{
    title: string;
    excerpt: string;
    categoryLabel: string;
    body: string[];
  }>;
}

interface RawResultItem {
  slug: string;
  category: string;
  tone: ResultTone;
  imageSrc?: string;
  featured: boolean;
  order: number;
  metrics: Array<{
    value: string;
    label: Localized<string>;
  }>;
  sources: string[];
  translations: Localized<{
    title: string;
    description: string;
    imageLabel: string;
    body: string;
  }>;
}

interface RawProgramSection {
  slug: string;
  order: number;
  icon: string;
  translations: Localized<{
    title: string;
    lead: string;
    points: string[];
  }>;
}

interface RawDocumentItem {
  slug: string;
  type: string;
  date: string;
  fileUrl: string | null;
  featured: boolean;
  translations: Localized<{
    title: string;
    description: string;
    label: string;
  }>;
}

interface RawOrganization {
  summary: {
    translations: Localized<{
      eyebrow: string;
      title: string;
      description: string;
    }>;
  };
  people: Array<{
    id: string;
    imageSrc: string | null;
    links: Array<{ href: string; label: string }>;
    isPlaceholder: boolean;
    translations: Localized<{
      name: string;
      role: string;
      location: string;
      bio: string;
    }>;
  }>;
  bodies: Array<{
    id: string;
    order: number;
    members: Array<{
      personId: string;
      order: number;
      role: Localized<string>;
      responsibility?: Localized<string>;
      bioUrl?: string;
      email?: string;
      socials?: Array<{ href: string; label: string }>;
    }>;
    translations: Localized<{
      title: string;
      description: string;
      article: string;
      competences: string[];
    }>;
  }>;
  localBoards: Array<{
    id: string;
    slug: string;
    municipality: string;
    region: string;
    contactEmail: string | null;
    president: string | null;
    active: boolean;
    featured: boolean;
    members?: Array<{
      personId: string;
      order: number;
      role: Localized<string>;
      responsibility?: Localized<string>;
      bioUrl?: string;
      email?: string;
      socials?: Array<{ href: string; label: string }>;
    }>;
    translations: Localized<{
      name: string;
      title: string;
      coordinator: string;
    }>;
  }>;
}

const newsItems = newsData as RawNewsItem[];
const resultItems = resultsData as RawResultItem[];
const programSections = programData as RawProgramSection[];
const documentItems = documentsData as RawDocumentItem[];
const organization = organizationData as RawOrganization;

const monthLabels: Record<Lang, string[]> = {
  sr: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

function localizeEntry<TTranslation extends object, TEntry extends { translations: Localized<TTranslation> }>(
  entry: TEntry,
  lang: Lang,
): Omit<TEntry, 'translations'> & TTranslation {
  const { translations, ...base } = entry;

  return {
    ...base,
    ...translations[lang],
  };
}

function getDateParts(date: string, lang: Lang) {
  const [, month, day] = date.split('-').map(Number);

  return {
    day: String(day).padStart(2, '0'),
    month: monthLabels[lang][month - 1] ?? '',
  };
}

export function getNews(lang: Lang) {
  return [...newsItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => ({
      ...localizeEntry(item, lang),
      ...getDateParts(item.date, lang),
      href: `/vijesti/${item.slug}`,
    }));
}

export function getFeaturedNews(lang: Lang, limit = 3) {
  return getNews(lang)
    .filter((item) => item.featured)
    .slice(0, limit);
}

export function getResults(lang: Lang) {
  return [...resultItems]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...localizeEntry(item, lang),
      href: `/rezultati/${item.slug}`,
      metrics: item.metrics.map((metric) => ({
        value: metric.value,
        label: metric.label[lang],
      })),
    }));
}

export function getFeaturedResults(lang: Lang, limit = 4) {
  return getResults(lang)
    .filter((item) => item.featured)
    .slice(0, limit);
}

export function getProgramSections(lang: Lang) {
  return [...programSections].sort((a, b) => a.order - b.order).map((item) => localizeEntry(item, lang));
}

export function getDocuments(lang: Lang) {
  return [...documentItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => ({
      ...localizeEntry(item, lang),
      href: `/dokumenti/${item.slug}`,
    }));
}

export function getOrganization(lang: Lang) {
  const people = organization.people.map((person) => localizeEntry(person, lang));
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const bodies = [...organization.bodies]
    .sort((a, b) => a.order - b.order)
    .map((body) => ({
      ...localizeEntry(body, lang),
      members: [...body.members].sort((a, b) => a.order - b.order).map((member) => ({
        personId: member.personId,
        order: member.order,
        role: member.role[lang],
        responsibility: member.responsibility?.[lang] ?? '',
        bioUrl: member.bioUrl,
        email: member.email,
        socials: member.socials ?? [],
        person: peopleById.get(member.personId),
      })),
    }));
  const localBoards = organization.localBoards.map((board) => ({
    ...localizeEntry(board, lang),
    members: [...(board.members ?? [])].sort((a, b) => a.order - b.order).map((member) => ({
      personId: member.personId,
      order: member.order,
      role: member.role[lang],
      responsibility: member.responsibility?.[lang] ?? '',
      bioUrl: member.bioUrl,
      email: member.email,
      socials: member.socials ?? [],
      person: peopleById.get(member.personId),
    })),
  }));

  return {
    summary: localizeEntry(organization.summary, lang),
    people,
    bodies,
    localBoards,
  };
}

export function getContentRoutes(lang: Lang): ContentRoute[] {
  return [
    ...getNews(lang).map((item) => ({ path: item.href, title: item.title })),
    ...getResults(lang).map((item) => ({ path: item.href, title: item.title })),
    ...getProgramSections(lang).map((item) => ({ path: `/program/${item.slug}`, title: item.title })),
    ...getDocuments(lang).map((item) => ({ path: item.href, title: item.title })),
  ];
}
