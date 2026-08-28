import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { initializeApiConfig } from './api.config';

const CONFIG_URL = '/assets/config/config.json';

export type AppLocale = 'fr' | 'ar' | 'en';

export interface AppRuntimeConfig {
  apiBaseUrl: string;
  locale: AppLocale;
  rtl: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private config!: AppRuntimeConfig;

  async load(): Promise<void> {
    let raw: unknown;
    try {
      raw = await firstValueFrom(this.http.get<unknown>(CONFIG_URL));
    } catch {
      throw new Error(
        `Impossible de charger ${CONFIG_URL}. Verifiez que le fichier existe et est accessible.`
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
