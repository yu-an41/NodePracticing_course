require('dotenv').config();
// dotenv會自動找到專案中最外層.env設定檔

const express = require('express');

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
// 也可以這樣寫 app.use(express.static(__dirname + '/public'));
app.use(express.static('node_modules/bootstrap/dist'));

app.get('/', (req, res) => {
    // res.send('Hello world');
    res.render('main', { name: 'Yu An' });
});

const port = process.env.SERVER_PORT || 3002;
// 若是沒有找到就會用3002當作通訊埠

app.get('/abc', (req, res) => {
    res.send(`<h2>倪好~~</h2>`);
})

app.get('/send-test', (req, res) => {
    // res.send(`name: 'Bambi', age: 6`);
})

app.get('/try-qs', (req, res) => {
    // res.json(req.query);
    res.json(req.query.a);
    // res.json(req.query.a[0]);
    // res.json(req.query.a.age);
})

app.get('/sales-json', (req, res) => {
    // 同一個條件中 end/send/render/json只能用其中一個
    // res.send({name: 'Bambi', age: 6});
    // res.json({name: 'Bambi', age: 6});
    const sales = require(__dirname + '/data/sales');
    console.log(sales);
    res.render('sales-json', { sales });
})

app.get('/try-post-form', (req, res) => {
    res.render('try-post-form');
})

app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);
})

app.post('/try-post', (req, res) => {
    res.json(req.body);
})

app.use((req, res) => {
    res.type('text/html');
    res.status(404).render('404');
})

app.listen(port, () => {
    console.log(`server start, port: ${port}`);
})