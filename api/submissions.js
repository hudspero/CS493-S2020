const fs = require('fs')
const {requireAuth} = require('../lib/auth')

const router = require('express').Router();
const {getSubmissionById} = require('../models/submissions')
const {getAssignmentById} = require('../models/assignments')
const {getCourseById} = require('../models/courses')


router.get('/:id',requireAuth, async (req, res, next)=>{
    
    let id = parseInt(req.params.id);
    if(id == NaN)
    {
        res.status(404).json({
            error: "Requested resource " + req.originalUrl + " does not exist"
          });
    }
    const submission = await getSubmissionById(id);
    const assignment = await getAssignmentById(submission.assignmentid);
    const course = await getCourseById(assignment.courseid);

    console.log(id,submission.id, assignment.id, course.id)
    if(req.user != course.instructorId && req.role != 'admin')
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
          return;
    }
    console.log(submission.filename)
    res.download(`${__dirname}/uploads/` + submission.filename)

})

module.exports = router;