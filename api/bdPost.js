import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import mysql from 'mysql2/promise';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false
  }
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
    const form = new IncomingForm({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка парсинга формы' });
      }

      const photoFile = files.photo?.[0] || files.photo;
      const portfolioFiles = Array.isArray(files.portfolio)
        ? files.portfolio
        : files.portfolio ? [files.portfolio] : [];

      if (!photoFile) {
        return res.status(400).json({ error: 'Поле photo обязательно' });
      }

      const photoForm = new FormData();
      photoForm.append('file', fs.createReadStream(photoFile.filepath), photoFile.originalFilename);

      const photoUploadResponse = await axios.post(
        'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
        photoForm,
        { headers: photoForm.getHeaders() }
      );

      const photoFullUrl = photoUploadResponse.data?.fileUrl;
      const photoUrl = photoFullUrl?.split('/').pop();

      const uploadedPortfolioUrls = [];

      for (const file of portfolioFiles) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);

        const response = await axios.post(
          'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
          formData,
          { headers: formData.getHeaders() }
        );

        if (response.data?.fileUrl) {
          const relativeUrl = response.data.fileUrl.split('/').slice(-2).join('/');
          const imgTag = `<img alt="" src="https://ce03510-wordpress-og5g7.tw1.ru/api/${relativeUrl}" style="height:380px; width:285px">`;
          uploadedPortfolioUrls.push(imgTag);
        }
      }

      const connection = await mysql.createConnection(DATA);

      const portfolioString = uploadedPortfolioUrls.join(' ');
      const name = fields.Name || 'Без имени';
      const telephone = fields.telephone || '';
      const professionId = fields.profession_id || 9;
      const speciality = fields.speciality || '';

      const insertQuery = `
        INSERT INTO homework_human (Name, photo, telephone, profession_id, speciality, portfolio, is_published)
        VALUES (?, ?, ?, ?, ?, ?, true)
      `;

      const [result] = await connection.execute(insertQuery, [
        name,
        photoUrl,
        telephone,
        professionId,
        speciality,
        portfolioString
      ]);

      await connection.end();

      res.status(200).json({
        success: true,
        insertedId: result.insertId,
        photo: photoUrl,
        portfolio: uploadedPortfolioUrls
      });
    });
  } catch (err) {
    console.error('Ошибка при обработке запроса:', err);
    res.status(500).json({ error: 'Ошибка при обработке запроса' });
  }
}
