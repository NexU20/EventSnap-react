export default async function handler(req: any, res: any) {
  const pathParam = req.query?.path;
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || '';
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'path') continue;

    if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
    } else if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  }

  const queryString = query.toString();
  req.url = `/api/${path}${queryString ? `?${queryString}` : ''}`;

  if (path === 'health') {
    return res.status(200).json({ success: true, message: 'API function is running' });
  }

  try {
    const serverModule = await import('../dist/server.cjs');
    const app = serverModule.default || serverModule;
    return app(req, res);
  } catch (error) {
    console.error('Failed to load Express app:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat aplikasi API.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
