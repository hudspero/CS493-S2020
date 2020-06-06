const router = require('express').Router();
const {getCourses, courseSchema, insertCourse, getCourseById, deleteCourseById, updateCrouseById
, getEnrollmentByID, enrollStudents, removeStudentsFromCourse} = require('../models/courses')
const {getInstructorById} = require('../models/users')
const {validateAgainstSchema, extractValidFields, UpdateValidFields} = require('../lib/validation')


async function isValidCourseId(req, res, next)
{
    let id = parseInt(req.params.id);
    if(id == NaN)
    {
        res.status(404).json({
            error: "Requested resource " + req.originalUrl + " does not exist"
          });
    }
    let course = await getCourseById(id)
    if(course == undefined)
    {
        res.status(404).json({
            error: "Requested resource " + req.originalUrl + " does not exist"
          });
    }
    req.course = course;
    next();
}

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

router.patch('/:id',isValidCourseId, async (req, res, next) =>{
    let newCourse = UpdateValidFields(req.body, req.course, courseSchema)
    if(await getInstructorById(newCourse.instructorId) == undefined)
    {
        res.status(400).send({error:"invalid instructor"})
        return;
    }
    newCourse.id = req.course.id;
    if(updateCrouseById(req.course.id,newCourse))
    {
        res.send();
    }
    else
    {
        res.status(500).send()
    }
})

router.delete('/:id',isValidCourseId,  async (req, res, next) =>{
    if(deleteCourseById(req.course.id))
    {
        res.status(204).send();
        return;
    }
    next();
})

router.get('/:id/students',isValidCourseId, async (req, res, next) =>{

    let students = (await getEnrollmentByID(req.course.id)).map(item => item.userId);
    res.send({course:req.course.id, students:students});
})

router.post('/:id/students',isValidCourseId, async (req, res, next) =>{
    let toAdd = req.body.add || []
    let toRemove = req.body.remove || []
    if(!Array.isArray(toAdd) || !Array.isArray(toRemove) || (toAdd.length == 0 && toRemove.length == 0))
    {
        res.status(400).send({error:"invalid request body"});
        return;
    }
    if(toAdd.length != 0)
        await enrollStudents(req.course.id, toAdd);
    
    if(toRemove.length != 0)
        await removeStudentsFromCourse(req.course.id, toRemove);
    res.status(200).send();
})

router.get('/:id/roster', (req, res, next) =>{
    res.send({"name":"get:courses/:id/roster"})
})

router.get('/:id/assignments', (req, res, next) =>{
    res.send({"name":"get:courses/:id/assignments"})
})

module.exports = router;