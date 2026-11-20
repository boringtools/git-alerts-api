const DOCS_COOKIE = 'gitalerts_docs_token';
const MAX_AGE_SECONDS = 24 * 60 * 60;

/**
 * The API reference (/api/docs/) and its OpenAPI schema are Django views guarded by
 * IsAuthenticated. A plain browser navigation to those URLs cannot carry the Bearer
 * header the SPA uses, so the access token is mirrored into a first-party cookie that
 * the API accepts for those two views only (see api/api/auth.py).
 */
export const setDocsTokenCookie = (token: string): void => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${DOCS_COOKIE}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
};

export const clearDocsTokenCookie = (): void => {
  document.cookie = `${DOCS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
};
