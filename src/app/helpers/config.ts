/**
 * Configuration globale de l'application admin.
 */
export class Config {
  public static get APP_TITLE(): string {
    return 'transport signalement admin';
  }

  public static get APP_VERSION(): string {
    return '1.0';
  }

  public static get API_LINK(): string {
    // Admin API Boot (migration 2 JAR) — ne plus pointer vers transport-api:8080
    return 'http://localhost:8082';
  }
}
