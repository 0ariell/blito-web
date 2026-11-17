// Variables de entorno de runtime (Render). Nunca se exponen al navegador.
const get = (k: string) => process.env[k]?.trim() || undefined;

export const env = {
  site: () => get('SITE_URL') ?? 'https://blito-producciones.onrender.com',
  databaseUrl: () => get('DATABASE_URL'),
  mpAccessToken: () => get('MP_ACCESS_TOKEN'),
  mpWebhookSecret: () => get('MP_WEBHOOK_SECRET'),
  tokenSecret: () => get('DOWNLOAD_TOKEN_SECRET'),
  resendKey: () => get('RESEND_API_KEY'),
  mailFrom: () => get('MAIL_FROM') ?? 'Blito Producciones <onboarding@resend.dev>',
  notifyEmail: () => get('NOTIFY_EMAIL'),
  /** JSON {"slug-del-kit": "https://url-privada-del-zip"} */
  kitArchivos: (): Record<string, string> => {
    try { return JSON.parse(get('KIT_ARCHIVOS') ?? '{}'); } catch { return {}; }
  },
};

/** Un kit se puede comprar online solo si hay cobro, firma de descargas y archivo cargado. */
export function ventaHabilitada(slug: string) {
  return Boolean(env.mpAccessToken() && env.tokenSecret() && env.kitArchivos()[slug]);
}
