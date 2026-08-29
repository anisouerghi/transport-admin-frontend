import { Injectable } from '@angular/core';
import { initializeApiConfig } from './api.config';

/** Chemin relatif au base href (compatible sous-repertoire ex. /admin/). */
const CONFIG_ASSET_PATH = 'assets/config/config.json';

function resolveConfigUrl(): string {
  return new URL(CONFIG_ASSET_PATH, document.baseURI).href;
}

export type AppLocale = 'fr' | 'ar' | 'en';

export interface AppRuntimeConfig {
  apiBaseUrl: string;
  locale: AppLocale;
  rtl: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config!: AppRuntimeConfig;

  async load(): Promise<void> {
    const configUrl = resolveConfigUrl();
    let raw: unknown;
    try {
      const response = await fetch(configUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
      }
      raw = await response.json();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Impossible de charger ${configUrl} (${detail}). Verifiez que le fichier existe, est un JSON valide (sans commentaires) et accessible.`
      );
    }

    this.config = this.validate(raw);
    initializeApiConfig(this.config.apiBaseUrl);
    this.applyDocumentSettings();
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get locale(): AppLocale {
    return this.config.locale;
  }

  get rtl(): boolean {
    return this.config.rtl;
  }

  private validate(raw: unknown): AppRuntimeConfig {
    if (!raw || typeof raw !== 'object') {
      throw new Error('config.json invalide : objet JSON attendu.');
    }

    const value = raw as Record<string, unknown>;

    if (typeof value['apiBaseUrl'] !== 'string') {
      throw new Error('config.json invalide : apiBaseUrl (string) est obligatoire.');
    }

    const locale = value['locale'];
    if (locale !== undefined && locale !== 'fr' && locale !== 'ar' && locale !== 'en') {
      throw new Error('config.json invalide : locale doit etre "fr", "ar" ou "en".');
    }

    const rtl = value['rtl'];
    if (rtl !== undefined && typeof rtl !== 'boolean') {
      throw new Error('config.json invalide : rtl doit etre un booleen.');
    }

    return {
      apiBaseUrl: value['apiBaseUrl'],
      locale: (locale as AppLocale | undefined) ?? 'en',
      rtl: typeof rtl === 'boolean' ? rtl : false,
    };
  }

  private applyDocumentSettings(): void {
    document.documentElement.lang = this.config.locale;
    document.documentElement.dir = this.config.rtl ? 'rtl' : 'ltr';
    document.body?.classList.toggle('rtl-layout', this.config.rtl);
  }
}

export function initAppConfig(config: ConfigService) {
  return () => config.load();
}
