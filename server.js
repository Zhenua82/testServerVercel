const http = require('http');

const server = http.createServer((req, res) => {
  console.log('+++OK')
  res.writeHead(200, {
    // 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Origin': 'https://ce03510-wordpress-og5g7.tw1.ru',
    'Content-Type': 'text/html',
  });

  res.end('<h1>Anse from server on port 5000!!!!!!!!!!!!</h1> <a href="#">Link</a>');
});

server.listen(5000, () => {
  console.log('Сервер запущен на порту 5000');
});

