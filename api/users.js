const router = require('express').Router();

router.post('/', (req, res, next) =>{
    res.send({"name":"post:users/"})
})

router.post('/login', (req, res, next) =>{
    res.send({"name":"post:users/login"})
})

router.get('/:id', (req, res, next) =>{
    res.send({"name":"get:users/:id"})
})

module.exports = router;