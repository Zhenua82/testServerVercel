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


// 

// server.js

const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();

const app = express();
app.use(express.json());

// Настройка CORS
const allowedOrigins = [
  'https://ce03510-wordpress-og5g7.tw1.ru',
  'http://127.0.0.1:5500',
  'https://testserver-eight-olive.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Разрешаем, если origin есть в списке или если origin отсутствует (например, при локальных запросах)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const DATA = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

app.post('/bd', (req, res) => {
  const connection = mysql.createConnection(DATA);
  connection.connect();
  // const query = 'ALTER TABLE homework_human CHANGE COLUMN age telephone VARCHAR(81)';
  // let query = 'SELECT Name, photo, telephone FROM homework_human WHERE is_published = true';
  // let query = 'SELECT Name, photo, telephone, profession_id, portfolio FROM homework_human WHERE is_published = true';
  let query = `
    SELECT 
      hh.Name, 
      hh.photo, 
      hh.telephone, 
      hp.title AS profession_title,
      hh.portfolio
    FROM homework_human AS hh
    JOIN homework_profession AS hp ON hh.profession_id = hp.id
    WHERE hh.is_published = true;
    `;
  connection.query(query, (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ message: 'Взаимодействие с бд состоялось', result });
    }
    connection.end();
  });
});



// // Обеспечьте вызов cors() перед маршрутами
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// // Обработка формы с файлами
// app.post('/bdPost', upload.fields([
//    {name:'photo', maxCount :1},
//    {name:'portfolio', maxCount :10}
// ]), async (req, res) => {
//    const formData= req.body;

//    // Функция для загрузки файла на внешний сервер
//    async function uploadFileToExternalServer(file) {
//      const formData = new FormData();
//      formData.append('file', fs.createReadStream(file.path), file.originalname);

//      try {
//        const response = await axios.post(
//          'https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php',
//          formData,
//          {
//            headers: {
//              ...formData.getHeaders()
//            }
//          }
//        );
//        if (response.data.success) {
//          return response.data.fileUrl; // URL файла
//        } else {
//          throw new Error(response.data.error || 'Ошибка загрузки файла');
//        }
//      } catch (err) {
//        throw err;
//      }
//    }

//    // Загрузка фото
//    let photoUrl = null;
//    if (req.files['photo'] && req.files['photo'][0]) {
//      try {
//        photoUrl = await uploadFileToExternalServer(req.files['photo'][0]);
//      } catch (err) {
//        return res.status(500).json({ error: 'Ошибка загрузки фото: ' + err.message });
//      }
//    }

//    // Загрузка портфолио
//    const portfolioUrls = [];
//    if (req.files['portfolio']) {
//      for (const file of req.files['portfolio']) {
//        try {
//          const url = await uploadFileToExternalServer(file);
//          portfolioUrls.push(url);
//        } catch (err) {
//          return res.status(500).json({ error: 'Ошибка загрузки портфолио: ' + err.message });
//        }
//      }
//    }

//    // В ответе возвращаем относительные пути (без домена)
//    res.json({
//      message:'Данные успешно получены',
//      data:{
//        formData,
//        photoPath: photoUrl,
//        portfolioPaths: portfolioUrls
//      }
//    });
// });

app.get('/', (req, res) => {
  res.end('<h1>Answer from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>')
})
// Обработка всех остальных маршрутов — вывод 404
app.use((req, res) => {
  res.status(404).send('<h1>404!!!</h1>');
});

app.listen(5000, () => console.log('Server running on port 5000'));