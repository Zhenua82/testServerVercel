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


const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios'); // Для отправки файлов на внешний сервер
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
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Настройка multer для обработки файлов
const storage = multer.memoryStorage(); // Временное хранение в памяти
const upload = multer({ storage });

// Конфигурация базы данных
const DATA = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

// Обработка GET-запроса
app.get('/', (req, res) => {
  res.end('<h1>Answer from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>');
});

// Обработка всех остальных маршрутов — вывод 404
app.use((req, res) => {
  res.status(404).send('<h1>404!!!</h1>');
});

// Обработка запроса /bd (существующий)
app.post('/bd', (req, res) => {
  const connection = mysql.createConnection(DATA);
  connection.connect();

  const query = `
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

// Новый маршрут /bdPost для обработки формы с файлами
app.post('/bdPost', upload.fields([
  { name: 'portfolio', maxCount: 10 }, // Максимум изображений в portfolio
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { Name, telephone, speciality, profession_id } = req.body;
    
    // Проверка обязательных полей
    if (!Name || !profession_id || !req.files['photo']) {
      return res.status(400).json({ error: 'Отсутствуют обязательные поля' });
    }

    // Загрузка фото визитки на внешний сервер
    const photoFileBuffer = req.files['photo'][0].buffer;
    const photoUploadResponse = await axios.post('https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php', photoFileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
    
    // Предполагается, что API возвращает имя файла или URL в ответе
    const photoFilename = photoUploadResponse.data.filename || photoUploadResponse.data.url;

    // Загрузка портфолио изображений (если есть)
    let portfolioFilenames = [];
    if (req.files['portfolio']) {
      for (let file of req.files['portfolio']) {
        const buffer = file.buffer;
        const uploadRes = await axios.post('https://ce03510-wordpress-og5g7.tw1.ru/api/upload.php', buffer, {
          headers: { 'Content-Type': 'application/octet-stream' }
        });
        // Предполагается, что API возвращает имя файла или URL
        const filenameOrUrl = uploadRes.data.filename || uploadRes.data.url;
        portfolioFilenames.push(filenameOrUrl);
      }
    }

    // Создаем строку для хранения портфолио (например, через запятую или JSON)
    const portfolioData = JSON.stringify(portfolioFilenames);

    // Вставляем данные в базу данных
    const connection = mysql.createConnection(DATA);
    connection.connect();

    const insertQuery = `
      INSERT INTO homework_human 
        (Name, photo, telephone, profession_id, speciality, portfolio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(
        insertQuery,
        [Name, photoFilename, telephone || '', profession_id, speciality || '', portfolioData],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    connection.end();

    res.json({ message: 'Данные успешно сохранены' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обработке запроса' });
  }
});

// Запуск сервера
app.listen(5000, () => console.log('Server running on port 5000'));