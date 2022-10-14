require('dotenv').config();
// dotenv會自動找到專案中最外層.env設定檔

const express = require('express');
express.yuan = '你好~';

const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const db = require(__dirname + '/modules/db_connect2');
const sessionStore = new MysqlStore({}, db);

// const multer = require('multer');
// const upload = multer({ dest: 'tmp_uploads/' });
const upload = require(__dirname + '/modules/upload-img');
const fs = require('fs').promises;
const moment = require('moment-timezone');

const app = express();

app.set('view engine', 'ejs');

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "efk1234er4uiydsylerug",
    store: sessionStore,
    cookie: {
        maxAge:1_200_000,
    }
}));

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

app.post('/try-upload', upload.single('avatar'), async (req, res)=> {
    res.json(req.file);
    /*
    if (req.file && req.file.originalname) {
        await fs.rename(req.file.path, `public/imgs/${req.file.originalname}`);
        res.json(req.file);
    }
    else {
        res.json({ msg: '沒有上傳檔案' });
    }
    */ 
})

app.post('/try-upload2', upload.array('photos'), async (req, res)=> {
    res.json(req.files);
})

app.get('/my-params1/:action?/:id?', async (req, res) => {
    res.json(req.params);
})

app.get(/^\/m\/09\d{2}\-?\d{3}\-?\d{3}$/i, (req, res) => {
    //從09開始保留
    let u = req.url.slice(3);
    // 去掉query string
    u = u.split('?')[0];
    //去掉-，把號碼串起來
    u = u.split('-').join('');
    res.json({mobile: u});
})

app.use('/admins', require(__dirname + '/routes/admin2'));

const myMiddle = (req, res, next) => {
    res.locals = {...res.locals, yuna: 'hi'};
    res.locals.feelLike = 'sleepy';
    next();
};

app.get('/try-middle', [myMiddle], (req, res) => {
    res.json(res.locals);
})


app.use('/try-session', (req, res) => {
    req.session.aaa ||= 0;
    req.session.aaa ++;
    res.json(req.session);
})

app.get('/try-date', (req, res) => {
    const now = new Date;

    res.json({
        t1: now,
        t2: now.toString(),
    })
})

app.get('/try-moment', (req, res) => {
    const m = moment('05/10/22', 'DD/MM/YY');
    const m2 = moment(req.session.cookie.expires);
    const fm = 'YYYY-MM-DD HH:mm:ss';
    res.json({
        t1: m,
        t2: m.format(fm),
        t3: m2.format(fm),
        t4: m2.tz('Europe/Berlin').format(fm)
    })
})

app.get('/try-db', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM address_book LIMIT 5,5");
    res.json(rows);
})

app.use((req, res) => {
    res.type('text/html');
    res.status(404).render('404');
})

app.listen(port, () => {
    console.log(`server start, port: ${port}`);
})