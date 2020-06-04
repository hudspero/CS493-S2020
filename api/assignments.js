const router = require('express').Router();
const {
    AssignmentSchema,
    getAssignmentById,
    insertNewAssignment,
    changeAssignment,
    deleteAssignmentById,
    getAssignmentSubmissionByAssignmentId
    } = require('../models/assignments');

router.post('/', (req, res, next) =>{

    res.send({"name":"post:assignments/"})
})

router.get('/:id', (req, res, next) =>{
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