// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';
// import mysql from 'mysql2/promise';
// import axios from 'axios';
// import FormData from 'form-data';

// export const config = {
//   api: {
//     bodyParser: false, // ⛔ обязательно — иначе formidable не сработает
//   },
// };

// const allowedOrigins = [
//   'https://ce03510-wordpress-og5g7.tw1.ru',
//   'http://127.0.0.1:5500',
//   'https://testserver-eight-olive.vercel.app'
// ];

// const DATA = {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// };

// export default async function handler(req, res) {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }

//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Метод не поддерживается' });
//   }

//   const form = formidable({ multiples: true });

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       console.error('Ошибка парсинга формы:', err);
//       return res.status(500).json({ error: 'Ошибка обработки формы' });
//     }

//     try {
//       const getField = (field) => Array.isArray(field) ? field[0] : field;

//       const Name = getField(fields.Name || '');
//       const telephone = getField(fields.telephone || '');
//       const speciality = getField(fields.speciality || '');
//       const rawProfessionId = getField(fields.profession_id || '9');
//       const profession_id = parseInt(rawProfessionId, 10);

//       const photo = files.photo?.[0] || files.photo;
//       const portfolioFiles = Array.isArray(files.portfolio)
//         ? files.portfolio
//         : files.portfolio ? [files.portfolio] : [];

//       if (!photo) {
//         return res.status(400).json({ error: 'Файл photo обязателен' });
//       }

//       // 1. Загрузка визитки
//       const photoForm = new FormData();
//       photoForm.append('file', fs.createReadStream(photo.filepath), photo.originalFilename);

//       const photoUploadResp = await axios.post(
//         'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
//         photoForm,
//         { headers: photoForm.getHeaders() }
//       );

//       const photoFileName = photoUploadResp.data?.fileUrl?.split('/').pop();
//       if (!photoFileName) {
//         return res.status(500).json({ error: 'Ошибка при загрузке визитки' });
//       }

//       // 2. Загрузка портфолио
//       const portfolioImgs = [];
//       for (const file of portfolioFiles) {
//         const pfForm = new FormData();
//         pfForm.append('file', fs.createReadStream(file.filepath), file.originalFilename);

//         const response = await axios.post(
//           'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
//           pfForm,
//           { headers: pfForm.getHeaders() }
//         );

//         const relativeUrl = response.data?.fileUrl?.split('/').slice(-2).join('/');
//         if (!relativeUrl) continue;

//         const imgTag = `<img alt="" src="https://ce03510-wordpress-og5g7.tw1.ru/api/${relativeUrl}" style="height:380px; width:285px">`;
//         portfolioImgs.push(imgTag);
//       }

//       const portfolioHTML = portfolioImgs.join(' ');

//       // 3. Сохранение в базу данных
//       const connection = await mysql.createConnection(DATA);

//       const query = `
//         INSERT INTO homework_human (Name, photo, telephone, profession_id, speciality, portfolio, is_published)
//         VALUES (?, ?, ?, ?, ?, ?, true)
//       `;

//       const [result] = await connection.execute(query, [
//         Name,
//         photoFileName,
//         telephone,
//         profession_id,
//         speciality,
//         portfolioHTML,
//       ]);

//       await connection.end();

//       res.status(200).json({
//         success: true,
//         message: 'Данные успешно сохранены',
//         insertedId: result.insertId,
//         photo: photoFileName,
//         portfolioCount: portfolioImgs.length
//       });

//     } catch (error) {
//       console.error('Ошибка:', error);
//       res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
//     }
//   });
// }


// БД: PostgreSQL (pg):
import formidable from 'formidable';
import fs from 'fs';
import pkg from 'pg';
import axios from 'axios';
import FormData from 'form-data';
import cloudinary from '../lib/cloudinary';

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

export default async function handler(req, res) {

  // const origin = req.headers.origin;

  // if (allowedOrigins.includes(origin)) {
  //   res.setHeader('Access-Control-Allow-Origin', origin);
  // }


  const origin = req.headers.origin;
  res.setHeader(
    'Access-Control-Allow-Origin',
    allowedOrigins.includes(origin) ? origin : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
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

      // 🔻 1. загрузка визитки
      // const photoForm = new FormData();
      // photoForm.append('file', fs.createReadStream(photo.filepath), photo.originalFilename);

      // const photoUploadResp = await axios.post(
      //   'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
      //   photoForm,
      //   { headers: photoForm.getHeaders() }
      // );

      // const photoFileName = photoUploadResp.data?.fileUrl?.split('/').pop();
      // if (!photoFileName) {
      //   return res.status(500).json({ error: 'Ошибка при загрузке визитки' });
      // }

      // 🔻 1. загрузка визитки в Cloudinary
      const photoForm = new FormData();
      photoForm.append('file', fs.createReadStream(photo.filepath), photo.originalFilename);

      const photoUploadResp = await cloudinary.uploader.upload(photo.filepath, {
        folder: 'servExpress',
        resource_type: 'image'
      });

      const photoPublicId = photoUploadResp.public_id;
      const photoUrl = photoUploadResp.secure_url;

      if (!photoPublicId) {
        return res.status(500).json({ error: 'Ошибка при загрузке визитки' });
      }

      const photoFileName = photoUploadResp.data?.fileUrl?.split('/').pop();
      if (!photoFileName) {
        return res.status(500).json({ error: 'Ошибка при загрузке визитки' });
      }

      // 🔻 2. загрузка портфолио
      // const portfolioImgs = [];
      // for (const file of portfolioFiles) {
      //   const pfForm = new FormData();
      //   pfForm.append('file', fs.createReadStream(file.filepath), file.originalFilename);

      //   const response = await axios.post(
      //     'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
      //     pfForm,
      //     { headers: pfForm.getHeaders() }
      //   );

      //   const relativeUrl = response.data?.fileUrl?.split('/').slice(-2).join('/');
      //   if (!relativeUrl) continue;

      //   const imgTag = `<img alt="" src="https://ce03510-wordpress-og5g7.tw1.ru/api/${relativeUrl}" style="height:380px; width:285px">`;
      //   portfolioImgs.push(imgTag);
      // }

      // const portfolioHTML = portfolioImgs.join(' ');

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
      // const result = await pool.query(
      //   `INSERT INTO homework_human 
      //   ("Name", photo, telephone, profession_id, speciality, portfolio, is_published)
      //   VALUES ($1, $2, $3, $4, $5, $6, true)
      //   RETURNING id`,
      //   [
      //     Name,
      //     photoFileName,
      //     telephone,
      //     profession_id,
      //     speciality,
      //     portfolioHTML
      //   ]
      // );


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
        // photo: photoFileName,
        photo: photoUrl,
        portfolioCount: portfolioImgs.length
      });

    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
    }
  });
}