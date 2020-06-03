const {mysqlPool, GenerateWhere} = require('../lib/mysqlPool');

async function getCoursesCount()
{
    const [result] = await mysqlPool.query(
        'SELECT COUNT(*) AS count FROM course');
    return result[0].count;
}

async function getCourses(query, page)
{
    const count = await getCoursesCount();

    const pageSize = 10;
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;
    sqlQuery = 'SELECT * FROM course ' + GenerateWhere(query) +'ORDER BY id LIMIT ? , ?';
    const [ results ] = await mysqlPool.query(sqlQuery,[offset, pageSize]);
    return {
        page: page,
        pageSize:pageSize,
        lastPage:lastPage,
        courses:results
    }
}

exports.getCourses = getCourses;

exports.courseSchema = {
    subject :{required:true},
    number: {required:true},
    title: {required:true},
    term:{required:true},
    instructorId:{required:true}
}

exports.insertCourse = async function(course)
{
    const [result] = await mysqlPool.query(
        'INSERT INTO course SET ?', course);
    return  result.insertId;
}

exports.getCourseById = async function(id)
{
    const [result] = await mysqlPool.query(
        'SELECT * FROM course WHERE id = ?',[id]
    );
    return result.count = 1 ? result[0] : undefined;
}

exports.deleteCourseById = async function(id)
{
    const [result] = await mysqlPool.query(
        'DELETE FROM course WHERE id = ?', [id]);
        return result.affectedRows == 1;
}

exports.updateCrouseById = async function(id, course)
{
    const [result] = await mysqlPool.query(
        'UPDATE course SET ? WHERE id = ?', [course, id]);
        return result.affectedRows == 1;
}