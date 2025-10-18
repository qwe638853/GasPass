import { createVincentUserMiddleware } from '@lit-protocol/vincent-app-sdk/expressMiddleware';

export function normalizeAudience(aud) {
  if (!aud) return aud;
  return aud.endsWith('/') ? aud : aud + '/';
}

export function getAuthenticateUserExpressHandler({
  allowedAudience,
  requiredAppId,
  userKey,
}) {
  const { middleware } = createVincentUserMiddleware({
    allowedAudience,
    requiredAppId,
    userKey,
  });
  return middleware;
}

export function createVincentAuth({
  allowedAudience,
  requiredAppId,
  userKey,
}) {
  return createVincentUserMiddleware({
    allowedAudience,
    requiredAppId,
    userKey,
  });
}


