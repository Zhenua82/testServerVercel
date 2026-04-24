import jwt from 'jsonwebtoken';

function checkAuth(req) {
  const cookie = req.headers.cookie || '';
  const token = cookie.split('auth=')[1]?.split(';')[0];

  if (!token) return false;

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

const allowedOrigins = [
  'https://ce03510-wordpress-og5g7.tw1.ru',
  'http://127.0.0.1:5500',
  'https://testserver-eight-olive.vercel.app',
  'https://testserverrender.onrender.com'
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // ВАЖНО: теперь GET вместо POST
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // проверка метода
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  // Проверка авторизации (можно удалить, если не нужна):
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    // для GET данные обычно из query
    const query = req.query;

    res.status(200).json({
      message: 'OK',
      query // чтобы видеть, что пришло
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}