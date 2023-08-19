var express = require('express');
var router = express.Router();

const process = require('../config-server-env.json')
const environment = process.env.NODE_ENV
const knex_config = require('../knexfile')
const database = require('knex')(knex_config[environment])


var passport = require('passport');
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
const FacebookStrategy = require('passport-facebook').Strategy;
const FACEBOOK_OAUTH_CLIENT_ID = process.env.DEV_FACEBOOK_OAUTH_APPID
const FACEBOOK_OAUTH_CLIENT_SECRET = process.env.DEV_FACEBOOK_OAUTH_APPSECRET
const FACEBOOK_OAUTH_BACLLBACK_URL = process.env.DEV_FACEBOOK_OAUTH_CALLBACKURL

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_OAUTH_CLIENT_ID = process.env.DEV_GOOGLE_OAUTH_CLIENTID
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.DEV_GOOGLE_OAUTH_CLIENTSECRET;
const GOOGLE_OAUTH_CALLBACK_URL = process.env.DEV_GOOGLE_OAUTH_CALLBACKURL;

passport.use(new GoogleStrategy({
  clientID: GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
  callbackURL: GOOGLE_OAUTH_CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_OAUTH_CLIENT_ID,
  clientSecret: FACEBOOK_OAUTH_CLIENT_SECRET,
  callbackURL: FACEBOOK_OAUTH_BACLLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));


/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.render('pages/auth');
});

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
router.get('/loggedin_profile', isLoggedIn, (req, res) => {
  console.log("req.isAuthenticated()?", req.isAuthenticated())
  res.render('pages/success', { user: req.user});
});

router.get('/error', (req, res) => res.send("error logging in"));
 
// ########### PassportJS Google Auth 

router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google',
  { failureRedirect: '/error',
    successRedirect: '/loggedin_profile' }),
  /* The above is shorthand. Here's another option-- For either (i assume)
    failure or success, we can run a fn.  In the shorthand, we just specify the redirect url

    E.g. Authenticate via google strat.
    if it fails (can probably optionally replace w/ fn), redirect to failure page.
    otherwise, run this fn (redirect to success page) 
    passport.authenticate('google',
    { failureRedirect: '/error' }),
    function(req, res) {
    Successful authentication, redirect success.
    res.redirect('/success');
    }
  */
  );

// ############# PassportJS Facebook Auth

router.get('/auth/facebook', 
  passport.authenticate('facebook', {
    scope:['public_profile', 'email']
  })
);

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/loggedin_profile',
    failureRedirect: '/error'
  })
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    // if user is authenticated, next (i.e. proceed to req/res fn)
    return next();
  // otherwise, direct to main page.
  res.redirect('/');
}


module.exports = router;

