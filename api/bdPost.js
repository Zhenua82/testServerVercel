// БД: PostgreSQL (pg):
import formidable from 'formidable';
import fs from 'fs';
import pkg from 'pg';
import cloudinary from '../lib/cloudinary.js';

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

const { Pool } = pkg;

export const config = {
  api: {
    bodyParser: false,
  },
};

const allowedOrigins = [
  'https://ce03510-wordpress-og5g7.tw1.ru',
  'http://127.0.0.1:5500',
  'https://testserver-eight-olive.vercel.app'
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('Cloudinary config check:', process.env.CLOUDINARY_CLOUD_NAME);

export default async function handler(req, res) {
  // const origin = req.headers.origin;
  // res.setHeader(
  //   'Access-Control-Allow-Origin',
  //   allowedOrigins.includes(origin) ? origin : '*'
  // );
  // res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // if (req.method === 'OPTIONS') {
  //   return res.status(200).end();
  // }
  // if (req.method === 'OPTIONS') {
  //   return res.status(200).end();
  // }

  const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  // Проверка авторизации (можно удалить, если не нужна):
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Ошибка парсинга формы:', err);
      return res.status(500).json({ error: 'Ошибка обработки формы' });
    }

    try {
      const getField = (field) => Array.isArray(field) ? field[0] : field;

      const Name = getField(fields.Name || '');
      const telephone = getField(fields.telephone || '');
      const speciality = getField(fields.speciality || '');
      const rawProfessionId = getField(fields.profession_id || '9');
      const profession_id = parseInt(rawProfessionId, 10);

      const photo = files.photo?.[0] || files.photo;
      const portfolioFiles = Array.isArray(files.portfolio)
        ? files.portfolio
        : files.portfolio ? [files.portfolio] : [];

      if (!photo) {
        return res.status(400).json({ error: 'Файл photo обязателен' });
      }

      // 🔻 1. загрузка визитки в Cloudinary
      const photoUploadResp = await cloudinary.uploader.upload(photo.filepath, {
        folder: 'servExpress',
        resource_type: 'image'
      });

      const photoPublicId = photoUploadResp.public_id;
      const photoUrl = photoUploadResp.secure_url;

      if (!photoPublicId) {
        return res.status(500).json({ error: 'Ошибка при загрузке визитки' });
      }

      // 🔻 2. загрузка портфолио в Cloudinary
      const portfolioImgs = [];
      for (const file of portfolioFiles) {
        const uploadResp = await cloudinary.uploader.upload(file.filepath, {
          folder: 'servExpress',
          resource_type: 'image'
        });

        const imgTag = `<img alt="" src="${uploadResp.secure_url}" style="height:380px; width:285px">`;

        portfolioImgs.push(imgTag);
      }
      const portfolioHTML = portfolioImgs.join(' ');


      // 🔻 3. запись в PostgreSQL
          const result = await pool.query(
        `INSERT INTO homework_human 
        ("Name", photo, telephone, profession_id, speciality, portfolio, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING id`,
        [
          Name,
          photoPublicId,
          telephone,
          profession_id,
          speciality,
          portfolioHTML
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Данные успешно сохранены',
        insertedId: result.rows[0].id,
        photo: photoUrl,
        portfolioCount: portfolioImgs.length
      });

    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
    }
  });
}