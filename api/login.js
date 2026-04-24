import jwt from 'jsonwebtoken';

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
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Метод не поддерживается' });
        }
  
  const { login, password } = req.body;

  if (
    login !== process.env.ADMIN_LOGIN ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Неверные данные' });
  }

  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // HttpOnly cookie (нельзя украсть через JS)
//   res.setHeader('Set-Cookie', `auth=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure`);
  res.setHeader(
  'Set-Cookie',
  `auth=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=None; Secure`
);

  res.status(200).json({ success: true });
}