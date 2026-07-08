import app from '../server';

export default function handler(req: any, res: any) {
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
  return app(req, res);
}
