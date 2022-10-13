const express = require('express');
const router = express.Router();

router.get('/aaa/:action?/:id?', (req, res) => {
    const {params, url, baseUrl, originalUrl} = req;

    res.json({params, url, baseUrl, originalUrl});
})

module.exports = router;