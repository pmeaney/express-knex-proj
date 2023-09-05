const process = require('../config-server-env.js')
const environment = process.env.NODE_ENV

// ####### Knex Configs
const knex_config = require('../knexfile')
const database = require('knex')(knex_config[environment])

async function forEmail_ReturnUser(param_email) {
  console.log('param_email', param_email)
  const results = await database('users')
      .select('*')
      .where({ email: param_email })
  return results
}


async function createUserAccount_SocialAuth(dataObjectProvided) {
  console.log('[createUserAccount_SocialAuth]: dataObjectProvided -- ', dataObjectProvided)
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



module.exports = {
  forEmail_ReturnUser,
  createUserAccount_SocialAuth
}