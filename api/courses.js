const router = require('express').Router();


router.get('/', (req, res, next) =>{
    res.send({"name":"get:courses/"})
})

router.post('/', (req, res, next) =>{
    res.send({"name":"post:courses/"})
})

router.get('/:id', (req, res, next) =>{
    res.send({"name":"get:courses/:id"})
})

router.patch('/:id', (req, res, next) =>{
    res.send({"name":"patch:courses/:id"})
})

router.delete('/:id', (req, res, next) =>{
    res.send({"name":"delete:courses/:id"})
})

router.get('/:id/submissions', (req, res, next) =>{
    res.send({"name":"get:courses/:id/students"})
})

router.post('/:id/submissions', (req, res, next) =>{
    res.send({"name":"post:courses/:id/students"})
})

router.get('/:id/roster', (req, res, next) =>{
    res.send({"name":"get:courses/:id/roster"})
})

router.get('/:id/assignments', (req, res, next) =>{
    res.send({"name":"get:courses/:id/assignments"})
})

module.exports = router;