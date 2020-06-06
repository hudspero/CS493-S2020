const {mysqlPool, GenerateWhere} = require('../lib/mysqlPool');


exports.getInstructorById = async function(id)
{
    const [result] = await mysqlPool.query(
        'SELECT * FROM users WHERE id = ? AND role = \'instructor\'', [id]);
    return result.length == 1 ? result[0] : undefined;
}