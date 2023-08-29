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

module.exports = {
  forEmail_ReturnUser
}