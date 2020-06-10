const {mysqlPool, GenerateWhere} = require('../lib/mysqlPool');
const mysql = require('mysql2/promise');


async function insertNewSubmission(submission)
{
    const [result] = await mysqlPool.query(
        'INSERT INTO submission SET ?', submission);
    return  result.insertId;
}
exports.insertNewSubmission = insertNewSubmission;



async function getSubmissionById(id)
{
    const [result] = await mysqlPool.query(
        'SELECT * FROM submission WHERE id = ?',[id]
    );
    return result.count = 1 ? result[0] : undefined;
}
exports.getSubmissionById = getSubmissionById;