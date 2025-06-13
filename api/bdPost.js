import formidable from 'formidable';
import fs from 'fs';

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

  // Обработка preflight-запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const form = formidable({ multiples: true });

    try {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Ошибка при разборе формы:', err);
          res.status(500).json({ error: 'Ошибка при разборе формы' });
          return;
        }

        const file = files?.file;
        if (!file || !file[0]) {
          res.status(400).json({ error: 'Файл не найден' });
          return;
        }

        const uploadedFile = file[0];
        const data = fs.readFileSync(uploadedFile.filepath, 'utf-8');

        // Пример: сохраняем как result.txt
        fs.writeFileSync('result.txt', data);

        res.status(200).json({ message: 'Файл успешно загружен и сохранен!' });
      });
    } catch (error) {
      console.error('Ошибка на сервере:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
}
