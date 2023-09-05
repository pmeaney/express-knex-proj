const express = require('express');
const router = express.Router();
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
const FACEBOOK_OAUTH_CLIENT_ID = process.env.DEV_FACEBOOK_OAUTH_APPID
const FACEBOOK_OAUTH_CLIENT_SECRET = process.env.DEV_FACEBOOK_OAUTH_APPSECRET
const FACEBOOK_OAUTH_CALLBACKURL = process.env.DEV_FACEBOOK_OAUTH_CALLBACKURL

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
  callbackURL: FACEBOOK_OAUTH_CALLBACKURL,
  profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
}, function (accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));

// ########### Auth section: PassportJS
router.get('/social_loggedin', isLoggedIn, async (req, res) => {
  console.log("req.isAuthenticated()?", req.isAuthenticated())
  
/**
 * OAuth Social Login Process, 
 * - DB Query: Does their user account exist? 
 *  Yes: if so, return its info.  
 *     - Does the user account have a provider which is the same as the one they just used?
 *        Yes, Matching account: Ok, let them log in.
 *        No: 
 *          - is it the default login? Tell them to use default login process
 *          - is it other social oauth provider? Tell them "Sorry, please use your original social auth to login: {Provider name}"
 *  No: Create a new User data table row for them.  social oauth data (id, provider) & email
 *      Then, return that data object we just upserted for them.
 *      Then, allow them to log in.
 * OAuth is meant to be passwordless "Social login is a passwordless login option governed by the Open Authorization (OAuth 2.0) and OpenID Connect (OIDC) standards"
 * So, no need to worry about password in this case.
 * 
 * Next, need to create Default Sign Up process
 * - No HTML form, just the http test (same as postman) & nodejs test in __test__ directory
 * So, deliverable is: REST API endpoint
 * 
 * Pretend Html Form: Sign up! [ Email address ]  [ Password ] [ Password-2-Check ]
 *    We assume that a dev's frontned would use a "Validate passwords match" functionality in UX
 *    So, we assume REST API just receives:
 * 
 *    Email, Password
 *  Validate both.
 *  Then, Run checks:
 *  - Q: Does the attempted sign up process's user already exist?
*       DB Query -- Return the user object.
 *    Yes: Tell user that email address is unavailable and that they previously created it with "Provider"
 *    No:  Salt & hash pw.  Save email, pw & salt in DB.  
 *    Then redirect the user to login page.
 * 
 * Next, Default Login process.
 * - DB Query: Does their user account exist? 
 *     Yes: Check PW
 *     No: Let them now that account does not exist
 * 
 * ToDo: Add functionality where if its the Social OAuth user's first login, save their login info to db.
 *
 */

  console.log('user data: ', req.user)
  // console.log('email is:', req.user.emails[0]['value'])
  
  // Lookup email in db.
  // If it's not there, register it, then allow them to process to success page.
  var email_received = req.user.emails[0]['value'] 
  var provider_received = req.user.provider
  // ** Check: Does User Exist?  (Lookup with email)
  const dbReturned_dataObject = await db_fns.forEmail_ReturnUser(email_received);
  // console.log('in ctrl: req.user', req.user)
  // console.log('in ctrl: dbReturned_dataObject: ', dbReturned_dataObject)
  // console.log('in ctrl: provider_received: ', provider_received)
  // console.log('in ctrl: dbReturned_dataObject[0].oauth_provider: ', dbReturned_dataObject[0].oauth_provider)

  /**
  Use case:
  Initial login, user has zero experience with the project.
  Here, we intend to allow public access with social auth as one step closer to having a user account
  */
  /**
    Upon email lookup, No data was found for this user.
    -> Use social auth data to create their bare bones user account */
  if (dbReturned_dataObject.length === 0) {

    /** If Provider is Email, it's possible the email address is not verified (e.g. its a brand new email address), return them to login with relevant message */
    if (req.user.provider === 'google' && req.user.emails[0]['verified'] === false ) {
      console.log('verfified true')
      req.flash('info', 'It appears your google email address is not yet verified (it is probably a new account). Please verify and try again!')
      res.render('pages/auth', { flashMessages: req.flash('info') });
    }

    console.log(req.user)
    const dataObject_newUserCreation = {
      providerName_fromProvider: req.user.provider,
      user_id_fromProvider: req.user.id,
      user_email_fromProvider: req.user.emails[0].value
      // We could provide first name & last name, but let's assume we don't need it right now.
      // user_firstName_fromProvider: req.user.name.givenName,
      // user_lastName_fromProvider: req.user.name.familyName,
    }
    const results_userCreation = await db_fns.createUserAccount_SocialAuth(dataObject_newUserCreation)
    console.log('results_userCreation', results_userCreation)

    req.flash('info', 'Welcome!')
      res.render('pages/success', { user: req.user, flashMessages: req.flash('info')});

  }

  // If you are in the DB, but the social provider you tried isn't the one we have on file.
    if (dbReturned_dataObject.length === 1 && provider_received !== dbReturned_dataObject[0].oauth_provider) {
      // redirect to main page w/ flash msg
      console.log(`Social provider login provider tried: ${provider_received}.  Original social login provider: ${dbReturned_dataObject[0].oauth_provider}`)
      // TODO: Setup flash msg & send this to the user.
      res.json({ "AccessStatus": "Denied"})
    }
 
  // If you are in the DB, and the social provider you tried is the one we have on file: Proceed to successful login page.
    if (dbReturned_dataObject.length === 1 && provider_received === dbReturned_dataObject[0].oauth_provider) {
      // redirect to main page w/ flash msg
      console.log(`Social provider login provider tried: ${provider_received}.  Original social login provider: ${dbReturned_dataObject[0].oauth_provider}`)
      req.flash('info', 'Welcome!')
      res.render('pages/success', { user: req.user, flashMessages: req.flash('info')});
    }
});

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
router.post('/local_signup', async function(req, res, next) {

  var email_received = req.body.email
  const dbReturned_dataObject = await db_fns.forEmail_ReturnUser(email_received);

  // If user is in the DB, reject the signup
  if (dbReturned_dataObject.length === 1) {
    // redirect to main page w/ flash msg
    console.log("A user with that email address already exists.  Please try a different email address")
    // TODO: Setup flash msg & send this to the user.
    res.json({ "AccessStatus": "Denied"})
  }

  // If no data found for that email, allow Create user account
  if (dbReturned_dataObject.length === 0) {
    // redirect to main page w/ flash msg
    console.log('I queried email & that user not found. Create the account.')
    // TODO: allow Create user account
    // > salt & hash pw. store it.
  }
});


module.exports = router;

