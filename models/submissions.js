const {mysqlPool, GenerateWhere} = require('../lib/mysqlPool');
const mysql = require('mysql2/promise');


async function insertNewSubmission(submission)
{
    const [result] = await mysqlPool.query(
        'INSERT INTO submission SET ?', submission);
    return  result.insertId;
}
exports.insertNewSubmission = insertNewSubmission;