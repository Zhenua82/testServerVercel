import mysql from 'mysql2/promise';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: true,
  },
};

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
  database: process.env.DB_DATABASE,
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
    const { photo, portfolio } = req.body;

    if (!photo) {
      return res.status(400).json({ error: 'Не указано обязательное поле photo' });
    }

    const connection = await mysql.createConnection(DATA);

    // Удаление из базы данных
    const [result] = await connection.execute(
      'DELETE FROM homework_human WHERE photo = ?',
      [photo]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Запись с таким photo не найдена' });
    }

    // Удаление визитки
    await axios.post('https://ce03510-wordpress-og5g7.tw1.ru/api/delete.php', {
      file: `media/${photo}`
    });

    // Удаление изображений портфолио (если есть)
    if (portfolio) {
      const imgUrls = [...portfolio.matchAll(/src="([^"]+)"/g)].map(match => match[1]);

      for (const fullUrl of imgUrls) {
        const relPath = fullUrl.split('/api/')[1]; // например: media/image123.jpg
        if (relPath) {
          await axios.post('https://ce03510-wordpress-og5g7.tw1.ru/api/delete.php', {
            file: relPath
          });
        }
      }
    }

    res.status(200).json({ success: true, message: 'Удалено успешно' });
  } catch (error) {
    console.error('Ошибка удаления:', error);
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
}
