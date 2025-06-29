// const http = require('http');

// const allowedOrigins = [
//   'https://ce03510-wordpress-og5g7.tw1.ru',
//   'http://127.0.0.1:5500',
//   'https://testserver-eight-olive.vercel.app'
// ];

// const server = http.createServer((req, res) => {
//   const origin = req.headers.origin;

//   // Проверяем, соответствует ли Origin разрешенным
//   if (allowedOrigins.includes(origin)) {
//     res.writeHead(200, {
//       'Access-Control-Allow-Origin': origin,
//       'Content-Type': 'text/html',
//     });
//   } else {
//     res.writeHead(403, {
//       'Content-Type': 'text/html',
//     });
//     res.end('<h1>403 Forbidden: Access is denied</h1>');
//     return;
//   }

//   console.log('+++OK');
//   res.end('<h1>Answer from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>');
// });

// server.listen(5000, () => {
//   console.log('Сервер запущен на порту 5000');
// });


// server.js

// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(express.json());

// // Настройка CORS
// const allowedOrigins = [
//   'https://ce03510-wordpress-og5g7.tw1.ru',
//   'http://127.0.0.1:5500',
//   'https://testserver-eight-olive.vercel.app'
// ];

// app.use(cors({
//   origin: function(origin, callback) {
//     // Разрешаем, если origin есть в списке или если origin отсутствует (например, при локальных запросах)
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// const DATA = {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE
// };

// app.post('/bd', (req, res) => {
//   const connection = mysql.createConnection(DATA);
//   connection.connect();

//   // const query = 'ALTER TABLE homework_human CHANGE COLUMN age telephone VARCHAR(81)';
//   // let query = 'SELECT Name, photo, telephone FROM homework_human WHERE is_published = true';
//   // let query = 'SELECT Name, photo, telephone, profession_id, portfolio FROM homework_human WHERE is_published = true';

//   let query = `
//     SELECT 
//       hh.Name, 
//       hh.photo, 
//       hh.telephone, 
//       hp.title AS profession_title,
//       hh.portfolio
//     FROM homework_human AS hh
//     JOIN homework_profession AS hp ON hh.profession_id = hp.id
//     WHERE hh.is_published = true;
//     `;
  
//   connection.query(query, (error, result) => {
//     if (error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.json({ message: 'Взаимодействие с бд состоялось', result });
//     }
//     connection.end();
//   });
// });
// app.get('/', (req, res) => {
//   res.end('<h1>Answer from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>')
// })
// // Обработка всех остальных маршрутов — вывод 404
// app.use((req, res) => {
//   res.status(404).send('<h1>404!!!</h1>');
// });

// app.listen(5000, () => console.log('Server running on port 5000'));


// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// const multer = require('multer');
// const axios = require('axios');
// const FormData = require('form-data');
// require('dotenv').config();

// const app = express();
// app.use(express.json());

// // CORS
// const allowedOrigins = [
//   'https://ce03510-wordpress-og5g7.tw1.ru',
//   'http://127.0.0.1:5500',
//   'https://testserver-eight-olive.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// // MySQL config
// const DATA = {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE
// };

// // ==============================
// // 📌 POST /bd — получить список
// // ==============================
// app.post('/bd', (req, res) => {
//   const connection = mysql.createConnection(DATA);
//   connection.connect();

//   const query = `
//     SELECT 
//       hh.Name, 
//       hh.photo, 
//       hh.telephone, 
//       hp.title AS profession_title,
//       hh.portfolio
//     FROM homework_human AS hh
//     JOIN homework_profession AS hp ON hh.profession_id = hp.id
//     WHERE hh.is_published = true;
//   `;

//   connection.query(query, (error, result) => {
//     connection.end();
//     if (error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.json({ message: 'Взаимодействие с бд состоялось', result });
//     }
//   });
// });

// // ==============================
// // 📌 POST /bdPost — приём формы
// // ==============================

// // Настройка multer для загрузки файлов
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Модифицируем существующий upload, чтобы обрабатывать и одиночное, и множественные файлы
// const uploadFields = upload.fields([
//   { name: 'photo', maxCount: 1 },
//   { name: 'portfolio', maxCount: 10 }
// ]);

// app.post('/bdPost', uploadFields, async (req, res) => {
//   const photoFile = req.files['photo']?.[0];       // Визитка
//   const portfolioFiles = req.files['portfolio'] || []; // Портфолио

//   if (!photoFile) {
//     return res.status(400).json({ error: 'Поле photo обязательно' });
//   }

//   try {
//     // 🔻 Загружаем визитку
//     const photoForm = new FormData();
//     photoForm.append('file', photoFile.buffer, photoFile.originalname);

//     const photoUploadResponse = await axios.post(
//       'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
//       photoForm,
//       { headers: photoForm.getHeaders() }
//     );

//     // const photoUrl = photoUploadResponse.data?.fileUrl;// дает полный URL
//     const photoFullUrl = photoUploadResponse.data?.fileUrl;
//     const photoUrl = photoFullUrl?.split('/').slice(-1).join('/'); // '/файл'
//     if (!photoUrl) {
//       return res.status(500).json({ error: 'Ошибка загрузки визитки (photo)' });
//     }

//     // 🔻 Загружаем все портфолио
//     const uploadedPortfolioUrls = [];

//     for (const file of portfolioFiles) {
//       const form = new FormData();
//       form.append('file', file.buffer, file.originalname);

//       const response = await axios.post(
//         'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
//         form,
//         { headers: form.getHeaders() }
//       );

//       if (response.data && response.data.fileUrl) {
//         // uploadedPortfolioUrls.push(response.data.fileUrl);// дает полный URL
//         const relativeUrl = response.data.fileUrl.split('/').slice(-2).join('/');// 'media/файл'
//         // uploadedPortfolioUrls.push(relativeUrl);
//         const imgTag = `<img alt="" src="https://ce03510-wordpress-og5g7.tw1.ru/api/${relativeUrl}" style="height:380px; width:285px">`;
//         uploadedPortfolioUrls.push(imgTag);
//       } else {
//         return res.status(500).json({ error: 'Ошибка загрузки файла портфолио' });
//       }
//     }

//     // 🔻 Сохраняем в базу данных
//     const connection = mysql.createConnection(DATA);
//     connection.connect();

//     const portfolioString = uploadedPortfolioUrls.join(' ');

//     const name = req.body.Name || 'Без имени';
//     const telephone = req.body.telephone || '';
//     const professionId = req.body.profession_id || 9;
//     const speciality = req.body.speciality || '';

//     const insertQuery = `
//       INSERT INTO homework_human (Name, photo, telephone, profession_id, speciality, portfolio, is_published)
//       VALUES (?, ?, ?, ?, ?, ?, true)
//     `;

//     connection.query(insertQuery, [name, photoUrl, telephone, professionId, speciality, portfolioString], (error, result) => {
//       connection.end();
//       if (error) {
//         return res.status(500).json({ error: error.message });
//       } else {
//         return res.json({
//           success: true,
//           insertedId: result.insertId,
//           photo: photoUrl,
//           portfolio: uploadedPortfolioUrls
//         });
//       }
//     });

//   } catch (err) {
//     console.error('Ошибка:', err);
//     return res.status(500).json({ error: 'Ошибка при загрузке изображений или записи в БД' });
//   }
// });



// // ==============================
// // 📌 Заглушка корневой страницы
// // ==============================
// app.get('/', (req, res) => {
//   res.end('<h1>Answer from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>');
// });

// // ==============================
// // 📌 Обработка всех прочих маршрутов
// // ==============================
// app.use((req, res) => {
//   res.status(404).send('<h1>404!!!</h1>');
// });

// // ==============================
// // 📌 Запуск сервера
// // ==============================
// app.listen(5000, () => console.log('Server running on port 5000'));

export default function handler(req, res) {
  res.status(200).json({ message: 'API работает!' });
}

