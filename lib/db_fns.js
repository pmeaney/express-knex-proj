const process = require('../config-server-env.js')
const environment = process.env.NODE_ENV

// ####### Knex Configs
const knex_config = require('../knexfile')
const database = require('knex')(knex_config[environment])

const forEmail_ReturnUser = async (param_email) => {
  console.log('[db_fns.forEmail_ReturnUser]: param_email -- ', param_email)
  const results = await database('users')
      .select('*')
      .where({ email: param_email })
  return results
}
// const forEmail_ReturnHashedPassword = async (param_email) => {
//   console.log('[db_fns.forEmail_ReturnHashedPassword]: param_email -- ', param_email)
//   const results = await database('users')
//       .select('argon2_hashed_password')
//       .where({ email: param_email })
//       .returning('argon2_hashed_password')
//   return results
// }


const createUserAccount_SocialAuth = async (dataObjectProvided) => {
  console.log('[db_fns.createUserAccount_SocialAuth]: dataObjectProvided -- ', dataObjectProvided)
  const results = await database('users')
      .returning([ 'oauth_provider_user_id', 'email', 'oauth_provider' ])
      .insert({
        oauth_provider_user_id: dataObjectProvided.user_id_fromProvider,
        oauth_provider: dataObjectProvided.providerName_fromProvider,
        email: dataObjectProvided.user_email_fromProvider,
        isSeedData: false,
      })
      // console.log('results', results)
  return results
}


const createUserAccount_LocalAuth = async (dataObjectProvided) => {
  console.log('[db_fns.createUserAccount_LocalAuth]: dataObjectProvided -- ', dataObjectProvided)
  const results = await database('users')
      .returning([ 'email', 'oauth_provider' ])
      .insert({
        oauth_provider: 'local_auth',
        email: dataObjectProvided.email_received,
        argon2_hashed_password: dataObjectProvided.hashed_pw_forDB,
        isSeedData: false,
      })
      // console.log('results', results)
  return results
}



module.exports = {
  forEmail_ReturnUser,
  // forEmail_ReturnHashedPassword,
  createUserAccount_SocialAuth,
  createUserAccount_LocalAuth
}