const router = require('express').Router();
const {
    AssignmentSchema,
    getAssignmentById,
    insertNewAssignment,
    changeAssignment,
    deleteAssignmentById,
    getAssignmentSubmissionByAssignmentId,
    getEnrollmentByCourseIdUserId,
    getCoursrByAssignmentId
    } = require('../models/assignments');

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
    res.send({"name":"post:assignments/"})
})

router.get('/:id', async(req, res, next) =>{
    id = parseInt(req.params.businessid);
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
    res.send({"name":"get:assignments/:id"})
});

router.patch('/:id', async(req, res, next) =>{
    const assignment = getAssignmentById(req.param.id);
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
    res.send({"name":"patch:assignments/:id"})
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
    res.send({"name":"delete:assignments/:id"})
})

router.get('/:id/submissions', async(req, res, next) =>{
    const assi_id = parseInt(req.param.id);
    const assignment = await getAssignmentById(req.param.id);
    if (assignment){
        const submissions = await getAssignmentSubmissionByAssignmentId(assi_id);
        res.status(200).send(submissions);
    }else{
        res.status(404).send({
            error: "Can't find Specified Assignment"
        });
    }
    res.send({"name":"get:assignments/:id/submissions"})
})

router.post('/:id/submissions', (req, res, next) =>{
    res.send({"name":"post:assignments/:id/submissions"})
})


module.exports = router;