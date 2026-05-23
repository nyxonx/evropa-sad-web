import { defaultLang, isLang, type Lang } from './config';

export function getLangFromUrl(url: URL): Lang {
  const [, firstSegment] = url.pathname.split('/');
  return isLang(firstSegment) ? firstSegment : defaultLang;
}

export function removeLangPrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (isLang(segments[0])) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

export function localizePath(lang: Lang, path = '/'): string {
  if (/^(https?:|mailto:|tel:)/.test(path)) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (lang === defaultLang) {
    return cleanPath;
  }

  return cleanPath === '/' ? `/${lang}/` : `/${lang}${cleanPath}`;
}

export function switchLangPath(lang: Lang, pathname: string): string {
  return localizePath(lang, removeLangPrefix(pathname));
}
