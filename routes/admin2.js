const express = require('express');
const router = express.Router();

// 在這裡一樣吃得到index.js設定的變數
// console.log(express.yuan);

router.get('/aaa/:action?/:id?', (req, res) => {
    const {params, url, baseUrl, originalUrl} = req;

    res.json({params, url, baseUrl, originalUrl});
})

module.exports = router;