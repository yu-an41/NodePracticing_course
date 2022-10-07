const http = require('http');
const fs = require('fs').promises;

const server = http.createServer(async(req, res) => {

    await fs.writeFile(__dirname + '/headers.text', JSON.stringify(req.headers))
        .then(data => {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(`<h1>${req.url}</h1>`);
        });
})

server.listen(5000);