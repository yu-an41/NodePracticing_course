const e = require('express');
const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect2');
const upload = require(__dirname + '/../modules/upload-img');

router.use((req, res, next) => {
    if(req.session.admin && req.session.admin.account) {
        next();
    } else {
        res.status(403).send('沒有權限喔！');
    }
})

async function getListData(req, res) {
    const perPage = 20;
    let page = +req.query.page || 1;
    if(page < 0) {
        return res.redirect(req.baseUrl);
        // api 時不應該轉向
    }

    let search = req.query.search? req.query.search.trim(): ''; 
    let where = ` WHERE 1 `;
    if(search) {
        where += 
        ` AND (
        \`name\` LIKE ${db.escape('%'+search+'%')}
        OR
        \`address\` LIKE ${db.escape('%'+search+'%')}
        )`;
    }

    // res.type('text/plain; charset=utf-8');
    // return res.end(where);

    const t_sql = `SELECT COUNT(1) totalRows FROM address_book ${where}`;
    const [[{totalRows}]] = await db.query(t_sql);

    let totalPages = 0;
    let rows = [];

    if(totalRows>0) {
        totalPages = Math.ceil(totalRows/perPage);
        if(page > totalPages) {
            return res.redirect(`?page=${totalPages}`);
        }
        const sql = `SELECT * FROM address_book ${where} ORDER BY sid DESC LIMIT ${(page - 1) * perPage}, ${perPage}`;

        [rows] = await db.query(sql);
        //因為rows已經在外面宣告過，可以用[]的方式找到並重新給值
    }

    return {totalRows, totalPages, perPage, page, rows, search, query: req.query}
}

// 新增資料
router.get('/add', async (req, res) => {    
    res.locals.title = '新增 | ' +res.locals.title;
    res.render('address-book/add');
})

router.post('/add', upload.none(), async (req, res) => {    
    // res.json(req.body);
    const output = {
        success: false,
        code: 0,
        errer: {},
        postData: req.body,
    };

    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())";


    const [result] = await db.query(sql, [
        req.body.name,
        req.body.email,
        req.body.mobile,
        req.body.birthday || null, //如果沒舔生日就會送空值而非空字串
        req.body.address,
    ]);

    if(result.affectedRows) output.success = true;

    res.json(output); 
})

//編輯資料
router.get('/edit/:sid', async (req, res) => {
    res.locals.title = '修改 | ' +res.locals.title;
    const sql = "SELECT * FROM `address_book` WHERE sid = ?";
    const [rows] = await db.query(sql, [req.params.sid]);

    if(!rows || !rows.length) {
        return res.redirect(req.baseUrl);
    }
    //res.json(rows[0]);
    res.render('address-book/edit', rows[0]);
});

router.put('/edit/:sid', async (req, res) => {
    const output = {
        success: false,
        code: 0,
        errer: {},
        postData: req.body,
    };

    const sql = "UPDATE `address_book` SET `name`=?, `email`=?, `mobile`=?,`birthday`=?, `address`=? WHERE sid=?";


    const [result] = await db.query(sql, [
        req.body.name,
        req.body.email,
        req.body.mobile,
        req.body.birthday || null,
        req.body.address,
        req.params.sid
    ]);

    if(result.changedRows) output.success = true;

    res.json(output); 
})

router.delete('/del/:sid', async (req, res) => {
    const sql = "DELETE FROM `address_book` WHERE sid = ?";
    const [result] = await db.query(sql, [req.params.sid]);

    res.json({success: !!result.affectedRows});
    // !!轉成布林值

})

router.get(['/', '/list'], async (req, res) => {
    const data = await getListData(req, res);
    
    res.render('address-book/list', data);
});

router.get(['/api', '/api/list'], async (req, res) => {    
    res.json(await getListData(req, res));
})



module.exports = router;