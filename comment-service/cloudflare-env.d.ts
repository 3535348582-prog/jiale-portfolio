declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    OWNER_OTP_SECRET?: string;
    OWNER_SEND_KEY_SHA256?: string;
    QQ_SMTP_AUTH_CODE?: string;
  }
}
