const http = require('http');

const server = http.createServer((request, response) => {
    response.writeHead(200, { 
        //status code為避田
        'Content-Type': 'text/html'
    });
    response.end(`<h1>${request.url}</h1>`);
})

server.listen(5000);
// 不要用1024以下的port，通常用3000/5000
//用nodemon監測程式碼，只要有修改會自動重啟server