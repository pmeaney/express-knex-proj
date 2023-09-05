const express = require('express');
const router = express.Router();

const auth_ctrl = require('../routeControllers/auth_ctrl')

const process = require('../config-server-env.js')
// ####### Knex Configs

// ###### My Fn library
const db_fns = require('../lib/db_fns.js')

// ####### PassportJS Configs
const passport = require('passport');
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.DEV_GOOGLE_OAUTH_CLIENTID,
  clientSecret: process.env.DEV_GOOGLE_OAUTH_CLIENTSECRET,
  callbackURL: process.env.DEV_GOOGLE_OAUTH_CALLBACKURL
},
function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));
passport.use(new FacebookStrategy({
  clientID: process.env.DEV_FACEBOOK_OAUTH_APPID,
  clientSecret: process.env.DEV_FACEBOOK_OAUTH_APPSECRET,
  callbackURL: process.env.DEV_FACEBOOK_OAUTH_CALLBACKURL,
  profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
}, function (accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));

// ########### Auth section: PassportJS
router.get('/social_loggedin', isLoggedIn, auth_ctrl.LoginProcess_SocialAuth );

router.get('/error', (req, res) => res.send("error logging in"));
 
// ########### PassportJS Google Auth 

router.get('/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/google/callback', 
  passport.authenticate('google',
  { failureRedirect: '/auth/error',
    successRedirect: '/auth/social_loggedin' }),
  /* The above is shorthand. Here's another option-- For either (i assume)
    failure or success, we can run a fn.  In the shorthand, we just specify the redirect url

    E.g. Authenticate via google strat.
    if it fails (can probably optionally replace w/ fn), redirect to failure page.
    otherwise, run this fn (redirect to success page) 
    passport.authenticate('google',
    { failureRedirect: '/auth/error' }),
    function(req, res) {
    Successful authentication, redirect success.
    res.redirect('/success');
    }
  */
  );

// ############# PassportJS Facebook Auth

router.get('/facebook', 
  passport.authenticate('facebook', {
    scope:['public_profile', 'email']
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/auth/social_loggedin',
    failureRedirect: '/auth/error'
  })
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    // if user is authenticated, run "next" fn (i.e. proceed to req/res fn)
    return next();
  // otherwise, direct to main page.
  res.redirect('/');
}

// Posted from Default Signup Form.  Email & Password
router.post('/local_signup', auth_ctrl.LoginProcess_LocalAuth);


module.exports = router;

