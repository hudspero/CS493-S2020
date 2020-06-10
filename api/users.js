const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuth } = require('../lib/auth');
const { UserSchema, insertNewUser, validateUser, getUserById, getUserByEmail, getCoursesById } = require('../models/users');

router.post('/', requireAuth, async (req, res) =>{
    console.log("Payload info for debugging:", req.role);
    console.log("User Provided:", req.body);
    if (validateAgainstSchema(req.body, UserSchema)) {
      if ((req.body.role === 'admin' || req.body.role === 'instructor') && req.role !== 'admin') {
        res.status(403).send({
          error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
        });
      } else {
        try {
          const id = await insertNewUser(req.body);
          res.status(201).send({
            _id: id
          });
        } catch (err) {
          console.error(" --Error:", err);
          res.status(500).send({
            error: "Error inserting new user into the Database. Please confirm your connection and try again."
          });
        }
      }
    } else {
      res.status(400).send({
        error: "The request body was either not present or did not contain all of the required fields."
      });
    }
});

router.post('/login', async (req, res) =>{
    //res.send({"name":"post:users/login"})
    if(req.body && req.body.email && req.body.password) {
      try {
        const authenticated = await validateUser(
          req.body.email,
          req.body.password
        );

        const user = await getUserByEmail(req.body.email);
        console.log("Finished getting user:", user);

        if (authenticated) {
          const token = await generateAuthToken(user.id);
          res.status(200).send({
            token: token
          });
        } else {
          res.status(401).send({
            error: "The specified credentials were invalid."
          });
        }
      } catch (err) {
        console.error(" -- error:", err);
        res.status(500).send({
          error: "An internal server error occurred."
        });
      }
    } else {
      res.status(400).send({
        error: "The request body was either not present or did not contain all of the required fields."
      });
    }
});

router.get('/:id', requireAuth, async (req, res, next) =>{
    //res.send({"name":"get:users/:id"})
    //Alternative Check: req.user !== parseInt(req.params.id) && req.role !== 'admin'
    if (req.user !== parseInt(req.params.id)) {
      res.status(403).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    } else {
      try {
        const user = await getUserById(parseInt(req.params.id));
        var fetchedCourses;
        if (req.role === 'student')
          fetchedCourses = await getCoursesById(parseInt(req.params.id), 'student');
        else if (req.role === 'instructor')
          fetchedCourses = await getCoursesById(parseInt(req.params.id), 'instructor');
        else {
          next();
        }

        if (user) {
          delete user.password;
          res.status(200).send({
            user,
            courses: fetchedCourses
          });
        } else {
          next();
        }

      } catch (err) {
        res.status(500).send({
          error: "An internal server error occurred."
        });
      }
    }
});

module.exports = router;
