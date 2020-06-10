const router = require('express').Router();
const {getCourses, courseSchema, insertCourse, getCourseById, deleteCourseById, updateCrouseById
, getEnrollmentByID, enrollStudents, removeStudentsFromCourse, getDetailedEnrollmentByID
,getCourseAssignments } = require('../models/courses')
const {getInstructorById} = require('../models/users')
const {validateAgainstSchema, extractValidFields, UpdateValidFields} = require('../lib/validation')
const {requireAuth, requireAdmin} = require('../lib/auth')

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

router.post('/', requireAdmin, async (req, res, next) =>{
    if(!validateAgainstSchema(req.body, courseSchema))
    {
        res.status(400).send({error:"invalid course object"})
        return;
    }
    if( req.role != 'admin')
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
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

router.patch('/:id',requireAuth, isValidCourseId, async (req, res, next) =>{
    let newCourse = UpdateValidFields(req.body, req.course, courseSchema)
    if(await getInstructorById(newCourse.instructorId) == undefined)
    {
        res.status(400).send({error:"invalid instructor"})
        return;
    }
    newCourse.id = req.course.id;
    
    if(req.role != 'admin')
    {
        newCourse.instructorId = req.course.instructorId;
    }

    if( req.role != 'admin' && req.user != req.course.instructorId)
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
          return;
    }

    if(updateCrouseById(req.course.id,newCourse))
    {
        res.send();
    }
    else
    {
        res.status(500).send()
    }
})

router.delete('/:id',requireAdmin, isValidCourseId,  async (req, res, next) =>{
    if(deleteCourseById(req.course.id))
    {
        res.status(204).send();
        return;
    }
    next();
})

router.get('/:id/students',requireAuth, isValidCourseId, async (req, res, next) =>{
    if( req.role != 'admin' && req.user != req.course.instructorId)
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
        return;
    }
    let students = (await getEnrollmentByID(req.course.id)).map(item => item.userId);
    res.send({course:req.course.id, students:students});
})

router.post('/:id/students',requireAuth, isValidCourseId, async (req, res, next) =>{
    if( req.role != 'admin' && req.user != req.course.instructorId)
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
          return;
    }

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

router.get('/:id/roster',requireAuth, isValidCourseId, async (req, res, next) =>{
    
    if( req.role != 'admin' && req.user != req.course.instructorId)
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
          return;
    }

    let students = await getDetailedEnrollmentByID(req.course.id);
    
    let filename = `${req.course.number}_${req.course.term}_roster.csv`.replace(/\s/g,'')
    console.log(filename)
    res.setHeader('Content-type', "application/octet-stream");
    res.setHeader(`Content-disposition`, `attachment; filename=${filename}`);

    var text = students.map(student => `${student.userId},${student.name},${student.email}`).join('\n')
    text = 'id,name,email\n' +text
    res.send(text)
})

router.get('/:id/assignments', isValidCourseId, async (req, res, next) =>{
    let assignments = (await getCourseAssignments(req.course.id)).map(item => item.id);
    res.send({"assignments":assignments})
})

module.exports = router;