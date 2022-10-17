const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect2');

router.use((req, res, next) => {
    next();
})

router.get(['/', '/list'], async (req, res) => {
    const perPage = 10;
    let page = req.query.page || 1;
    if(page < 0) {
        return res.redirect(req.baseUrl);
    }

    let search = req.query.search? req.query.search.trim(): ''; 
    let where = ` WHERE 1 `;
    if(search) {
        where += ` AND \`name\` LIKE ${db.escape('%'+search+'%')} `;
    }

    // res.type('text/plain, charset=utf-8');
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
        const sql = `SELECT * FROM address_book ORDER BY sid DESC LIMIT ${(page - 1) * perPage}, ${perPage}`;

        [rows] = await db.query(sql);
        //因為rows已經在外面宣告過，可以用[]的方式找到並重新給值
    }

    // res.json({totalRows, totalPages, perPage, page, rows});

    res.render('address-book/list', {totalRows, totalPages, perPage, page, rows});
})

module.exports = router;