require('dotenv').config();
// dotenv會自動找到專案中最外層.env設定檔

const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res)  => {
    res.send('Hello world');
});

const port = process.env.SERVER_PORT || 3002;
// 若是沒有找到就會用3002當作通訊埠

app.get('/abc', function(req, res){
    res.send(`<h2>倪好~~</h2>`);
})

app.use((req, res) => {
    res.type('text/html');
    res.status(404);
    res.send(`<h4  >There's nothing here!</h4>`);
})

app.listen(port, () => {
    console.log(`server start, port: ${port}`);
})