export default function errorHandler(err, req, res, next) {
  // Only log server-side to avoid leaking internals
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
}


