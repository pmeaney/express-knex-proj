const argon2 = require('argon2');

const db_fns = require('../lib/db_fns.js')

const SocialAuth_LogIn = async (req, res) => {
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

  /**
  Use case:
  Initial login, user has zero experience with the project.
  Here, we intend to allow public access with social auth as one step closer to having a user account
  // * Check: Does User Exist in DB?  (Lookup with email)
  // * No, User Does Not Exist: Register them &  proceed to success page     */
  // * Yes, But-- Provider doesn't match: Redirect with message to login with original provider
  // * Yes, the social auth provider requested vs. one in the db match.  Allow to proceed
  var email_received = req.user.emails[0]['value']
  var provider_received = req.user.provider
  const dbReturned_dataObject = await db_fns.forEmail_ReturnUser(email_received);

  /**
    Upon email lookup, No data was found for this user.
    -> Use social auth data to create their bare bones user account */
  if (dbReturned_dataObject.length === 0) {

    /** If Provider is Google, it's possible the email address is not verified (e.g. its a brand new email address), 
    If verified is false, return them to login page with message about needing to go thru google's email verification process */
    if (req.user.provider === 'google' && req.user.emails[0]['verified'] === false) {
      console.log('verfified true')
      req.flash('info', 'It appears your google email address is not yet verified (it is probably a new account). Please go through google\'s email verification process and try again!')
      res.render('pages/auth', { flashMessages: req.flash('info') });
    }

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
    res.render('pages/success', { user: req.user, flashMessages: req.flash('info') });
  }

  // If you are in the DB, but the social provider you tried isn't the one we have on file.
  if (dbReturned_dataObject.length === 1 && provider_received !== dbReturned_dataObject[0].oauth_provider) {
    // redirect to main login page w/ flash msg
    // console.log(`Social provider login provider tried: ${provider_received}.  Original social login provider: ${dbReturned_dataObject[0].oauth_provider}`)
    req.flash('info', `It appears you originally logged in via ${dbReturned_dataObject[0].oauth_provider}-- please use that same authentication provider. Or if you need to change providers, please contact us. Thanks!`)
    res.render('pages/auth', { flashMessages: req.flash('info') });
  }

  // If you are in the DB, and the social provider you tried is the one we have on file: Proceed to successful login page.
  if (dbReturned_dataObject.length === 1 && provider_received === dbReturned_dataObject[0].oauth_provider) {
    // redirect to main page w/ flash msg
    console.log(`Social provider login provider tried: ${provider_received}.  Original social login provider: ${dbReturned_dataObject[0].oauth_provider}`)
    req.flash('info', 'Welcome!')
    res.render('pages/success', { user: req.user, flashMessages: req.flash('info') });
  }
}

const LocalAuth_CreateUserAccount = async (req, res) => {

  /**
    // Todo:
    // Frontend validation for: Password (check 2 inputs), Email format
    // (On the backend we'll assume we did verification)
  */
  var email_received = req.body.email
  var password_received = req.body.password
  const dbReturned_dataObject = await db_fns.forEmail_ReturnUser(email_received);

  /**
  // * Check if User Account already exists.
  // * Yes, user already exists: Do not allow sign up.  Notify user that the account already exists and to try a different one..
  // * No, user does not yet exist: Allow user to create user account.
  */
  // If user is in the DB, reject the signup
  if (dbReturned_dataObject.length === 1) {
    req.flash('info', 'A user with that email address already exists.  Please try a different email address.')
    res.render('pages/auth', { flashMessages: req.flash('info') });
  }

  // If no data found for that email, allow Create user account
  if (dbReturned_dataObject.length === 0) {
    console.log('I queried users table for that email & no user was not found. I will create a user account for that user.')

    // Allow Create user account
    try {
      const hashed_pw_forDB = await argon2.hash(password_received);
      const dataObject_forDB = {
        hashed_pw_forDB,
        email_received
      }
      // store pw & other info in db
      const results_fromDB = await db_fns.createUserAccount_LocalAuth(dataObject_forDB);
      console.log('results_fromDB (db_fns.createUserAccount_LocalAuth) -- ', results_fromDB)
      // redirect user to success page


    } catch (err) {
      console.log('[error]: ', err)
    }

  }
}

const LocalAuth_LogIn = async (req, res) => {
  var email_received = req.body.email
  var password_received = req.body.password
  const dbReturned_dataObject = await db_fns.forEmail_ReturnHashedPassword(email_received);

  /**
  // * Check if User Account already exists.
  // * No, user does not yet exist: Disallow login
  // * Yes, user already exists: Allow login
  */
  // console.log('[auth_ctrl.LocalAuth_LogIn]: dbReturned_dataObject --', dbReturned_dataObject)

  // If no data found for that email, disallow login
  if (dbReturned_dataObject.length === 0) {
    console.log('I queried users table for that email & no user was not found. I will create a user account for that user.')

  }

  // If user is in the DB, Check password
  if (dbReturned_dataObject.length === 1) {
    console.log('User exists, checking pw...')
    const password_check_result = await argon2.verify(dbReturned_dataObject[0]['argon2_hashed_password'], password_received);
    console.log('[password_check_result]: Password passed in is --', password_check_result)
    if (password_check_result === false) {
      // If user is in the DB, and password does not match, disallow login
      req.flash('info', 'Your password does not appear to be correct.')
      res.render('pages/auth', { flashMessages: req.flash('info') });
    }

    if (password_check_result === true) {
      // If user is in the DB, and password matches, allow login.
    }
  }
}
module.exports = {
  SocialAuth_LogIn,
  LocalAuth_CreateUserAccount,
  LocalAuth_LogIn
}