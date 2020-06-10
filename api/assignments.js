const router = require('express').Router();
const {
    AssignmentSchema,
    getAssignmentById,
    insertNewAssignment,
    changeAssignment,
    deleteAssignmentById,
    getAssignmentSubmissionByAssignmentId,
    getEnrollmentByCourseIdUserId
    } = require('../models/assignments');



const {requireAuth} = require('../lib/auth')
const {getEnrollmentByID, getCourseById} = require('../models/courses')


const crypto = require('crypto');
const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: `${__dirname}/uploads`,
        filename: (req, file, callback) => {
            const randomSeed =
            crypto.pseudoRandomBytes(8).toString('hex');
            let extension = file.originalname.split('.').slice(-1)
            let name = file.originalname.split('.').slice(0,-1).join('.')
            console.log(name)
            callback(null, `${name}_${randomSeed}.${extension}`);
        }
      })
});

const {insertNewSubmission} = require('../models/submissions')

router.post('/', async(req, res, next) =>{
    if (req.body.courseId && req.body.title && req.body.points && req.body.due) {
        try{
            const id = await insertNewAssignment(req.body);
            res.status(201).send({
                id: id,
                links: {
                  assignment: `/assignments/${id}`
                }
            });
        }catch(err){
            console.error(err);
            res.status(500).send({
                error: "Error inserting assignment into DB.  Please try again later."
            });
        }
    }else{
        res.status(400).send({
            error: "Request body is not a valid assignment object"
        });
    }
})

router.get('/:id', async(req, res, next) =>{
    id = parseInt(req.params.id);
    try {
        const assignment_info = await getAssignmentById(id);
        if (assignment_info){
            res.status(200).send(assignment_info);
        }else{
            next();
        }
    }catch(err){
        console.error(err);
        res.status(500).send({
            error: "Unable to find assignment."
        });
    }
});

router.patch('/:id', async(req, res, next) =>{
    const assignment = await getAssignmentById(req.param.id);
    if (assignment){
        if (req.body.courseId || req.body.title || req.body.points || req.body.due) {
            try{
                const id = parseInt(req.params.id);
                const updatesuccessful = await changeAssignment(req.body, id);
                if (updatesuccessful){
                    res.status(200).send({
                        id: id,
                        links: {
                          assignment: `/assignments/${id}`
                        }
                    });
                    console.log("update successful");
                }else{
                    next();
                }
            }catch(err){
                console.error(err);
                res.status(500).send({
                    error: "Error updating assignment in DB.  Please try again later."
                });
            }
        }else{
            res.status(400).send({
                error: "Request body is not a valid assignment object"
            });
        }
    }else{
        res.status(404).send({
            error: "Can't find Specified assignment"
        });
    }
})

router.delete('/:id', async(req, res, next) =>{
    const assignment = getAssignmentById(req.param.id);
    if (assignment){
        try{
            const delete_successful = await deleteAssignmentById(req.param.id);
            console.log(assignment);
            res.status(204).send();
        }catch(err){
            console.error(err);
            res.status(500).send({
            error: "Unable to delete assignment."
            });
        }
    }else{
        res.status(404).send({
            error: "Can't find Specified assignment"
        });
    }
})

router.get('/:id/submissions',requireAuth, async(req, res, next) =>{
    const assi_id = parseInt(req.params.id);
    if(assi_id == NaN)
    {
        res.status(404).json({
            error: "Requested resource " + req.originalUrl + " does not exist"
          });
        return;
    }
    const assignment = await getAssignmentById(assi_id);
    const course = await getCourseById(assignment.courseid)
    if(req.user != course.instructorId && req.role != 'admin')
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
          return;
    }

    if (assignment){
        const submissions = await getAssignmentSubmissionByAssignmentId(assi_id);
        let toReturn = submissions.map(item => ({...item, fileLink:`/submissions/${item.id}`}));
        res.status(200).send(toReturn);
    }else{
        res.status(404).send({
            error: "Can't find Specified Assignment"
        });
    }
})

router.post('/:id/submissions',requireAuth, upload.single('file'), async (req, res, next) =>{
    if(req.role != 'student')
    {
        res.status(403).send({
            error: "Unathorized for action"
          });
          return;
    }
    if(req.body.studentId != req.user)
    {
        res.status(403).send({
            error: "Unathorized for action: userid and logged in user must match"
          });
          return;
    }

    let id = parseInt(req.params.id);
    if(id == NaN)
    {
        res.status(404).json({
            error: "Requested resource " + req.originalUrl + " does not exist"
          });
    }

    //check student enrolled
    assignemnt = await getAssignmentById(id)
    courseEnrollment = await getEnrollmentByID(assignemnt.courseid);
    if(!courseEnrollment.map(item => item.userId).some(item => item == req.user))
    {
        res.status(403).send({
            error: "Unathorized for action; User not enrolled in class"
          });
          return;
    }
    let newSubmission = {
        assignmentid:id,
        studentid:req.user,
        filename:req.file.filename
    }
    let newSubId = await insertNewSubmission(newSubmission)
    res.send({"id":newSubId})
})

module.exports = router;