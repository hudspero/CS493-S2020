const router = require('express').Router();
const {getCourses, courseSchema, insertCourse, getCourseById, deleteCourseById, updateCrouseById} = require('../models/courses')
const {getInstructorById} = require('../models/users')
const {validateAgainstSchema, extractValidFields, UpdateValidFields} = require('../lib/validation')




router.get('/', async (req, res, next) =>{
    let query = {};
    if(req.query.subject != undefined)
        query.subject = req.query.subject;

    if(req.query.number != undefined)
        query.number = req.query.number;

    if(req.query.term != undefined)
        query.term = req.query.term;
    res.send(await getCourses(query,req.query.page || 1))
})

router.post('/', async (req, res, next) =>{
    if(!validateAgainstSchema(req.body, courseSchema))
    {
        res.status(400).send({error:"invalid course object"})
        return;
    }
    let newCourse = extractValidFields(req.body, courseSchema);
    if(await getInstructorById(newCourse.instructorId) == undefined)
    {
        res.status(400).send({error:"invalid instructor"})
        return;
    }
    let id = await insertCourse(newCourse);
    res.send({id:id});
})

router.get('/:id', async (req, res, next) =>{

    let id = parseInt(req.params.id);
    if(id == NaN)
    {
        next();
        return;
    }
    let course = await getCourseById(id)
    if(course == undefined)
    {
        next();
        return;
    }
    res.send(course)
})

router.patch('/:id', async (req, res, next) =>{
    let id = parseInt(req.params.id);
    if(id == NaN)
    {
        next();
        return;
    }
    let course = await getCourseById(id)
    if(course == undefined)
    {
        next();
        return;
    }
    let newCourse = UpdateValidFields(req.body, course, courseSchema)
    if(await getInstructorById(newCourse.instructorId) == undefined)
    {
        res.status(400).send({error:"invalid instructor"})
        return;
    }
    course.id = id;
    if(updateCrouseById(id,course))
    {
        res.send();
    }
    else
    {
        res.status(500).send()
    }
})

router.delete('/:id', async (req, res, next) =>{
    let id = parseInt(req.params.id);
    if(id == NaN)
    {
        next();
        return;
    }
    let course = await getCourseById(id)
    if(course == undefined)
    {
        next();
        return;
    }
    if(deleteCourseById(id))
    {
        res.status(204).send();
        return;
    }
    next();
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