import pkg from '@lit-protocol/vincent-app-sdk/expressMiddleware';
const { createVincentUserMiddleware, verifyVincentAppUserJWT, verifyVincentPlatformJWT } = pkg;

export function normalizeAudience(aud) {
  if (!aud) return aud;
  return aud.endsWith('/') ? aud : aud + '/';
}

export function getAuthenticateUserExpressHandler({
  allowedAudience,
  requiredAppId,
  userKey,
}) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      res.status(401).json({ error: `Invalid authorization header - expected "Bearer <token>"` });
      return;
    }

    const [scheme, rawJWT] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json({ error: `Expected "Bearer" scheme, got "${scheme}"` });
      return;
    }

    try {
      const decodedJWT = requiredAppId != null
        ? await verifyVincentAppUserJWT({
            jwt: rawJWT,
            expectedAudience: allowedAudience,
            requiredAppId,
          })
        : await verifyVincentPlatformJWT({
            jwt: rawJWT,
            expectedAudience: allowedAudience,
          });

      if (!decodedJWT) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // 將驗證後的 JWT 資料附加到 request 物件
      req[userKey] = {
        decodedJWT,
        rawJWT,
      };

      next();
    } catch (e) {
      res.status(401).json({ error: `Invalid token: ${e.message}` });
    }
  };
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

