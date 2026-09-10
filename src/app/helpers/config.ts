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
    // return 'http://10.0.2.2:8080';
     return 'http://localhost:8082';
  }
}
