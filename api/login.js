import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
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
  res.setHeader('Set-Cookie', `auth=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure`);

  res.status(200).json({ success: true });
}