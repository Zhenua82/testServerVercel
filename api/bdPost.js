// import formidable from 'formidable';
// import fs from 'fs';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   // CORS-заголовки
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   // Обработка preflight-запросов
//   if (req.method === 'OPTIONS') {
//     res.status(200).end();
//     return;
//   }

//   if (req.method === 'POST') {
//     const form = formidable({ multiples: true });

//     try {
//       form.parse(req, (err, fields, files) => {
//         if (err) {
//           console.error('Ошибка при разборе формы:', err);
//           res.status(500).json({ error: 'Ошибка при разборе формы' });
//           return;
//         }

//         const file = files?.file;
//         if (!file || !file[0]) {
//           res.status(400).json({ error: 'Файл не найден' });
//           return;
//         }

//         const uploadedFile = file[0];
//         const data = fs.readFileSync(uploadedFile.filepath, 'utf-8');

//         // Пример: сохраняем как result.txt
//         fs.writeFileSync('result.txt', data);

//         res.status(200).json({ message: 'Файл успешно загружен и сохранен!' });
//       });
//     } catch (error) {
//       console.error('Ошибка на сервере:', error);
//       res.status(500).json({ error: 'Ошибка сервера' });
//     }
//   } else {
//     res.status(405).json({ error: 'Метод не поддерживается' });
//   }
// }

// pages/api/bdPost.js

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS-заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // if (req.method === 'OPTIONS') {
  //   // Предзапрос CORS
  //   return res.status(200).end();
  // }
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  // Создаем директорию для загрузок, если её нет
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: true,
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Ошибка при парсинге формы:', err);
      return res.status(500).json({ error: 'Ошибка при обработке данных формы' });
    }

    // Проверка наличия файла photo
    const photo = files.photo;
    const portfolio = files.portfolio;

    if (!photo && !portfolio) {
      return res.status(400).json({ error: 'Файл не найден' });
    }

    // Вывод в консоль — можно заменить записью в БД
    console.log('✅ Получены поля:', fields);
    console.log('📷 Получены файлы:', {
      photo: photo?.originalFilename || photo?.filepath,
      portfolio: Array.isArray(portfolio)
        ? portfolio.map(f => f.originalFilename || f.filepath)
        : portfolio?.originalFilename || portfolio?.filepath,
    });

    return res.status(200).json({ success: true, message: 'Форма успешно обработана!' });
  });
}
