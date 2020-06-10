const {mysqlPool} = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const AssignmentSchema = {
    courseId: { required: true },
    title: { required: true },
    points: { required: true },
    due: { required: true }
  };
exports.AssignmentSchema = AssignmentSchema;


// thisn function to get assignment by ID
async function getAssignmentById(id){
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM assignment WHERE id = ?',
        [ id ]
    );
    return results[0];
}
exports.getAssignmentById = getAssignmentById;


// this function to INSERT a new assignment
async function insertNewAssignment(new_assignment){
    new_assignment = extractValidFields(new_assignment, AssignmentSchema);
    const [ result ] = await mysqlPool.query(
        'INSERT INTO assignment SET ?',
        new_assignment
    );
    return result.insert_id;
}
exports.insertNewAssignment = insertNewAssignment;


// this function is to update assignment
async function changeAssignment(changed_assignment, id){
    changed_assignment = extractValidFields(changed_assignment, AssignmentSchema);
    const [ result ] = await mysqlPool.query(
        'UPDATE assignment SET ? WHERE id = ?',
        [changed_assignment, id]
    );
    return result.rows > 0;
}
exports.changeAssignment = changeAssignment;


// this function is to DELETE assignment
async function deleteAssignmentById(id){
    const [ results ] = await mysqlPool.query(
        'DELETE FROM assignment WHERE id = ?',
        [ id ]
    );
    return results.rows > 0;
}
exports.deleteAssignmentById = deleteAssignmentById


// this function is to get submission by assignment_id
async function getAssignmentSubmissionByAssignmentId(assignment_id){
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM submission WHERE assignmentid = ?',
        [ assignment_id ]
    );
    return results;
}
exports.getAssignmentSubmissionByAssignmentId = getAssignmentSubmissionByAssignmentId;


async function getEnrollmentByCourseIdUserId(coursed_id, user_id){
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM enrollment WHERE userId = ? AND courseId = ?',
        [ user_id, coursed_id ]
    );
    return results[0];
}
exports.getEnrollmentByCourseIdUserId = getEnrollmentByCourseIdUserId;