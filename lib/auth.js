const jwt = require('jsonwebtoken');

const secretKey = 'ItsASecretToEveryone';

const { getUserById } = require('../models/users');

async function generateAuthToken(userID) {
  const uQuery = await getUserById(userID);
  console.log("Role Check:", uQuery);
  const payload = { sub: userID, role: uQuery.role };
  console.log("Generated Payload:", payload);
  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
};
exports.generateAuthToken = generateAuthToken;

function requireAuth(req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ?
    authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    req.role = payload.role;
    next();
  } catch (err) {
    console.error(" -- error:", err);
    res.status(401).send({
      error: "Invalid Authentication Token"
    });
  }
};
exports.requireAuth = requireAuth;



function requireAdmin (req, res, nextOuter)
{
  requireAuth(req, res, () =>{
    console.log(`role:${req.role} id:${req.user} requested an admin only endpoint`)
      if(req.role != 'admin')
      {
        res.status(403).send({
          error: "Unathorized for action"
        });
        return;
      }
      else
      {
        nextOuter();
      }
  })
}

exports.requireAdmin = requireAdmin