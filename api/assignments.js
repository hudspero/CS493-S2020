const router = require('express').Router();


router.post('/', (req, res, next) =>{
    res.send({"name":"post:assignments/"})
})

router.get('/:id', (req, res, next) =>{
    res.send({"name":"get:assignments/:id"})
})

router.patch('/:id', (req, res, next) =>{
    res.send({"name":"patch:assignments/:id"})
})

router.delete('/:id', (req, res, next) =>{
    res.send({"name":"delete:assignments/:id"})
})

router.get('/:id/submissions', (req, res, next) =>{
    res.send({"name":"get:assignments/:id/submissions"})
})

router.post('/:id/submissions', (req, res, next) =>{
    res.send({"name":"post:assignments/:id/submissions"})
})


module.exports = router;