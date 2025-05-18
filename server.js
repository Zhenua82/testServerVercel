const http = require('http');

const allowedOrigins = [
  'https://ce03510-wordpress-og5g7.tw1.ru',
  'http://127.0.0.1:5500',
  'https://testserver-eight-olive.vercel.app'
];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;

  // Проверяем, соответствует ли Origin разрешенным
  if (allowedOrigins.includes(origin)) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': origin,
      'Content-Type': 'text/html',
    });
  } else {
    res.writeHead(403, {
      'Content-Type': 'text/html',
    });
    res.end('<h1>403 Forbidden: Access is denied</h1>');
    return;
  }

  console.log('+++OK');
  res.end('<h1>Answer from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>');
});

server.listen(5000, () => {
  console.log('Сервер запущен на порту 5000');
});
