const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect2');

router.use((req, res, next) => {
    next();
})

router.get('/', async (req, res) => {
    const perPage = 10;
    let page = req.query.page || 1;
    if(page < 0) {
        return res.redirect(req.baseUrl);
    }

    const t_sql = "SELECT COUNT(1) totalRows FROM address_book";
    const [[{totalRows}]] = await db.query(t_sql);

    let totalPages = 0;
    if(totalRows>0) {
        totalPages = Math.ceil(totalRows/perPage);
        if(page > totalPages) {
            return res.redirect(`?page=${totalPages}`);
        }

    }

    res.json({totalRows, totalPages, perPage, page});
})

module.exports = router;