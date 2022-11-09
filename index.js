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
const { format } = require('path');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();

app.set('view engine', 'ejs');



// top-level middleware
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        callback(null, true)
        //沒限制拜訪對象
    }

}
app.use(cors());

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "efk1234er4uiydsylerug",
    store: sessionStore,
    cookie: {
        maxAge: 1_200_000,
    }
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(express.static('public'));
// 也可以這樣寫 app.use(express.static(__dirname + '/public'));
app.use(express.static('node_modules/bootstrap/dist'));

app.use(async (req, res, next) => {
    // 自己定義的 template helper functions
    res.locals.toDateString = (d) => moment(d).format('YYYY-MM-DD');
    res.locals.toDateTimeString = (d) => moment(d).format('YYYY-MM-DD HH:mm:ss');
    res.locals.title = 'Bambi\'s Home';
    res.locals.session = req.session;

    res.locals.auth = {}; // 預設值
    let auth = req.get('Authorization');

    if(auth && auth.indexOf('Bearer ') === 0) {
        auth = auth.slice(7);
        try {
            const payload = await jwt.verify(auth, process.env.JWT_SECRET);
            res.locals.auth = payload;
        } catch(ex) {}
    }

    next();
})

app.get('/', (req, res) => {
    // res.send('Hello world');
    res.render('main', { name: 'Yu An' });
});

const port = process.env.SERVER_PORT || 3002;
// 若是沒有找到就會用3002當作通訊埠

app.use('/ab', require(__dirname + '/routes/address-book'));

app.get('/fake-login', (req, res) => {
    req.session.admin = {
        id: 613,
        account: 'yuan',
        nickname: '鄭斑比'
    };
    res.redirect('/');
})

app.get('/logout', (req, res) => {
    delete req.session.admin;
    res.redirect('/');

})

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

app.post('/try-upload', upload.single('avatar'), async (req, res) => {
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

app.post('/try-upload2', upload.array('photos'), async (req, res) => {
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
    res.json({ mobile: u });
})

app.use('/admins', require(__dirname + '/routes/admin2'));

const myMiddle = (req, res, next) => {
    res.locals = { ...res.locals, yuna: 'hi' };
    res.locals.feelLike = 'sleepy';
    next();
};

app.get('/try-middle', [myMiddle], (req, res) => {
    res.json(res.locals);
})


app.use('/try-session', (req, res) => {
    req.session.aaa ||= 0;
    req.session.aaa++;
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

app.get('/try-db-add', async (req, res) => {
    const name = '郝美麗';
    const email = 'mayli@gmail.com';
    const mobile = '0945678123';
    const birthday = '1999-07-13';
    const address = '台北市';

    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())";

    // const [{insertId, affectedRows}] = await db.query(sql, [name, email, mobile, birthday, address]);
    // res.json({insertId, affectedRows});

    const [result] = await db.query(sql, [name, email, mobile, birthday, address]);
    res.json(result);
})

app.get('/try-db-add2', async (req, res) => {
    const name = '郝帥氣';
    const email = 'shuai777@gmail.com';
    const mobile = '0945678123';
    const birthday = '1999-07-13';
    const address = '金門縣';

    const sql = "INSERT INTO `address_book` set ?";

    const [result] = await db.query(sql, [{ name, email, mobile, birthday, address, created_at: new Date() }]);
    res.json(result);
})

app.get('/yahoo', async (req, res) => {
    const response = await axios.get('https://tw.yahoo.com/');
    res.send(response.data);
})

app.get('/cate', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY sid");
    // res.json(rows);


    // 找出第一層
    const firsts = [];
    for (let i of rows) {
        if (i.parent_sid === 0) {
            firsts.push(i);
        }
    }

    // 將第二層放在第一層children裡面
    for (let f of firsts) {
        for (let i of rows) {
            if (i.parent_sid === f.sid) {
                f.children ||= [];
                f.children.push(i);
            }
        }
    }
    res.json(firsts);
})

app.get('/cate2', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY sid");

    const dict = {};
    for(let i of rows) {
        dict[i.sid] = i;
    }

    for(let i of rows) {
        if(i.parent_sid !== 0) {
            const p = dict[i.parent_sid];
            p.children ||= [];
            p.children.push(i);
        }
    }
    const firsts = [];
    for (let i of rows) {
        if (i.parent_sid === 0) {
            firsts.push(i);
        }
    }

    res.json(firsts);
})

app.post('/login-api', async (req, res) => {
    const output = {
        success: false,
        error: '帳密錯誤',
        postData: req.body,
        auth: {},
    };

    const sql = "SELECT * FROM admins WHERE account = ?";
    const [rows] = await db.query(sql, [req.body.account]);

    if (! rows.length) {
        return res.json(output);
    }

    const row = rows[0];

    output.success = await bcrypt.compare(req.body.password, row['password_hash']);
    if(output.success) {
        output.error='';
        const {sid, account, admin_group} = row;
        const token = jwt.sign({sid, account, admin_group}, process.env.JWT_SECRET);
        output.auth= {
            sid,
            account,
            token
        }

    }
    res.json(output);

})

app.use((req, res) => {
    res.type('text/html');
    res.status(404).render('404');
})

app.listen(port, () => {
    console.log(`server start, port: ${port}`);
})