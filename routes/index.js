var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.render('pages/auth');
});

const process = require('../config-server-env.json')
const environment = process.env.NODE_ENV
const knex_config = require('../knexfile')
const database = require('knex')(knex_config[environment])

async function selectAllEmployees() {
  const results = await database('employees').select('*')
  return results
}

router.get("/v1/employees", async (req, res) => {
  try {
    console.log('running query...')
    const dataObject = await selectAllEmployees();
    console.log('dataObject', dataObject)
    res.status(200).json(dataObject)
  } catch (err) {
    // console.log('res', res)
    console.log('err', err)
    res.status(500).json({message: "Error getting posts"})
  }
});

// ########### Auth section: PassportJS

var passport = require('passport');
var userProfile;

router.get('/success', (req, res) => {
  res.render('pages/success', {user: userProfile});
});

router.get('/error', (req, res) => res.send("error logging in"));
 
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
 
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// ########### PassportJS Google AUTH 
 
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.DEV_GOOGLE_OAUTH_CLIENTID
const GOOGLE_CLIENT_SECRET = process.env.DEV_GOOGLE_OAUTH_CLIENTSECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });


module.exports = router;
