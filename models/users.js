const {mysqlPool, GenerateWhere} = require('../lib/mysqlPool');
const bcrypt = require('bcryptjs');
const { extractValidFields } = require('../lib/validation');

const UserSchema = {
  id: { required: false },
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: { required: true }
};
exports.UserSchema = UserSchema;


exports.getInstructorById = async function(id)
{
    const [result] = await mysqlPool.query(
        'SELECT * FROM users WHERE id = ? AND role = \'instructor\'', [id]);
    return result.length == 1 ? result[0] : undefined;
}


async function getUserById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return results[0];
}
exports.getUserById = getUserById;


async function getUserByEmail(email) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return results[0];
}
exports.getUserByEmail = getUserByEmail;


async function validateUser(email, password) {
  //console.log("Debugging code:", email, "Provided Pass:", password);
  const user = await getUserByEmail(email);
  //console.log("Bcrypt Password:", await bcrypt.hash(password, 8));
  //console.log("Stored password:", user.password)
  return user &&
    await bcrypt.compare(password, user.password);
}
exports.validateUser = validateUser;


async function insertNewUser(user) {
  const userToInsert = extractValidFields(user, UserSchema);
  console.log(" -- userToInsert:", userToInsert);
  userToInsert.password = await bcrypt.hash(
    userToInsert.password,
    8
  );
  console.log(" -- userToInsert after hash:", userToInsert);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO users SET ?',
    userToInsert
  );

  return result.insertId;
}
exports.insertNewUser = insertNewUser;


async function getCoursesById(id, role) {
  if (role === 'student') {
    const [ results ] = await mysqlPool.query(
      'SELECT * FROM enrollment WHERE userId = ?',
      [id]
    );
    return results[0];
  } else {
    const [ results ] = await mysqlPool.query(
      'SELECT * FROM course WHERE instructorId = ?',
      [id]
    );
    return results[0];
  }
}
exports.getCoursesById = getCoursesById;
