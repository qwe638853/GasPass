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

// JWT驗證中間件
export function jwtAuthMiddleware(req, res, next) {
  try {
    // 從 header 取得 JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    
    // JWT 驗證邏輯
    // 這裡可以加入實際的 JWT 驗證
    // 例如：驗證 JWT 是否有效、是否過期等
    
    // 暫時先通過，實際應該驗證 JWT
    req.user = { token };
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 錯誤處理中間件
export function errorHandler(err, req, res, next) {
  // Only log server-side to avoid leaking internals
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
}

// 404 處理中間件
export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}