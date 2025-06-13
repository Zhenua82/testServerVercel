import mysql from 'mysql2/promise';
import formidable from 'formidable';
import axios from 'axios';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Отключаем встроенный парсер, т.к. используем formidable
  },
};

const DATA = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при обработке формы' });
    }

    try {
      const photoFile = files.photo?.[0] || files.photo;
      const portfolioFiles = Array.isArray(files.portfolio) ? files.portfolio : [files.portfolio].filter(Boolean);

      if (!photoFile) {
        return res.status(400).json({ error: 'Поле photo обязательно' });
      }

      const uploadFile = async (file) => {
        const buffer = fs.readFileSync(file.filepath);
        const formData = new FormData();
        formData.append('file', buffer, file.originalFilename);

        const response = await axios.post(
          'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
          formData,
          { headers: formData.getHeaders() }
        );

        return response.data?.fileUrl || '';
      };

      const photoUrlFull = await uploadFile(photoFile);
      const photoUrl = photoUrlFull.split('/').pop();

      const uploadedPortfolioUrls = [];

      for (const file of portfolioFiles) {
        const fileUrl = await uploadFile(file);
        const relativeUrl = fileUrl.split('/').slice(-2).join('/');
        const imgTag = `<img alt="" src="https://ce03510-wordpress-og5g7.tw1.ru/api/${relativeUrl}" style="height:380px; width:285px">`;
        uploadedPortfolioUrls.push(imgTag);
      }

      const portfolioString = uploadedPortfolioUrls.join(' ');
      const name = fields.Name || 'Без имени';
      const telephone = fields.telephone || '';
      const professionId = fields.profession_id || 9;
      const speciality = fields.speciality || '';

      const connection = await mysql.createConnection(DATA);

      const [result] = await connection.execute(
        `INSERT INTO homework_human (Name, photo, telephone, profession_id, speciality, portfolio, is_published)
         VALUES (?, ?, ?, ?, ?, ?, true)`,
        [name, photoUrl, telephone, professionId, speciality, portfolioString]
      );

      await connection.end();

      res.status(200).json({
        success: true,
        insertedId: result.insertId,
        photo: photoUrl,
        portfolio: uploadedPortfolioUrls
      });
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка при загрузке изображений или записи в БД' });
    }
  });
}
