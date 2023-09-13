const express = require('express');
const router = express.Router();

const auth_ctrl = require('../routeControllers/auth_ctrl')

const process = require('../config-server-env.js')
// ####### Knex Configs

/** Local Signup & Login process
  Allows user to create a bare bones profile similar to the "on first login" of Social Login
  From there, they can add profile info or go to interacting w/ app   */
router.post('/local_signup', auth_ctrl.LocalAuth_CreateUserAccount);
router.post('/local_login', auth_ctrl.LocalAuth_LogIn);

/** Social Login process
  If user has social provider, they can use it to login.
  On first login, it creates their account and forwards them to a page with a profile widget
  where they can add additional user info if they choose, or go straight to interacting with the app. */
router.get('/social_loggedin', isLoggedIn, auth_ctrl.SocialAuth_LogIn);

// This is '/auth/error' which is used by Social OAuth2 as the error callback URL.
// Need to add an error page here. (note: Also need to add a general 404 page for un-found routes)
router.get('/error', (req, res) => res.send("error logging in"));

// This is a PassportJS convention.  isAuthenticated fn is part of PassportJS.
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    // if user is authenticated, run "next" fn (i.e. proceed to req/res fn)
    return next();
  // otherwise, direct to main page.
  res.redirect('/');
}

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
  }, 
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

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

module.exports = router;

