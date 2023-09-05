
const db_fns = require('../lib/db_fns.js')

const LoginProcess_SocialAuth = async (req, res) => {
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
  
      /** If Provider is Google, it's possible the email address is not verified (e.g. its a brand new email address), 
      If verified is false, return them to login page with message about needing to go thru google's email verification process */
      if (req.user.provider === 'google' && req.user.emails[0]['verified'] === false ) {
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
  }

const LoginProcess_LocalAuth = async (req, res) => {
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
}



module.exports = {
  LoginProcess_SocialAuth,
  LoginProcess_LocalAuth
}