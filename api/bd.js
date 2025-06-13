import mysql from 'mysql2/promise';

const allowedOrigins = [
  'https://ce03510-wordpress-og5g7.tw1.ru',
  'http://127.0.0.1:5500',
  'https://testserver-eight-olive.vercel.app'
];

const DATA = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const connection = await mysql.createConnection(DATA);

    const [rows] = await connection.execute(`
      SELECT 
        hh.Name, 
        hh.photo, 
        hh.telephone, 
        hp.title AS profession_title,
        hh.portfolio
      FROM homework_human AS hh
      JOIN homework_profession AS hp ON hh.profession_id = hp.id
      WHERE hh.is_published = true;
    `);

    await connection.end();

    res.status(200).json({ message: 'Взаимодействие с БД состоялось', result: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
