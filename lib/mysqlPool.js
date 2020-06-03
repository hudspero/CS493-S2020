const mysql = require('mysql2/promise');


const mysqlHost = process.env.MYSQL_HOST || 'localhost';
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDB = process.env.MYSQL_DB || 'finalProject';
const mysqlUser = process.env.MYSQL_USER || 'user';
const mysqlPassword = process.env.MYSQL_PASSWORD || 'hunter3';

const mysqlPool = mysql.createPool({
  connectionLimit: 10,
  host: mysqlHost,
  port: mysqlPort,
  database: mysqlDB,
  user: mysqlUser,
  password: mysqlPassword
});

function GenerateWhere(conditions)
{
  let props = Object.getOwnPropertyNames(conditions)
  if(props.length == 0)
  {
    return "";
  }
  let toReturn = "WHERE ";
  let statements = []
  props.forEach(element => {
    statements.push(`${element} = ${mysql.escape(conditions[element])} `)
  });
  toReturn += statements.join("AND ")
  return toReturn;
}

exports.mysqlPool = mysqlPool;
exports.GenerateWhere = GenerateWhere;