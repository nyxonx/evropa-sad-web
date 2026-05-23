export const defaultLang = 'sr';

export const languages = {
  sr: {
    label: 'CG',
    name: 'Crnogorski',
    htmlLang: 'sr-Latn-ME',
  },
  en: {
    label: 'EN',
    name: 'English',
    htmlLang: 'en',
  },
} as const;

export type Lang = keyof typeof languages;

export const supportedLangs = Object.keys(languages) as Lang[];

export function isLang(value: string | undefined): value is Lang {
  return supportedLangs.includes(value as Lang);
}
