// This is a template for a user login.
// Typically you might have additional fields such as:
// table.string('first_name');
// table.string('last_name');
// table.string('username');
// table.integer('account_type');
// table.integer('account_id'); 

// But for this template, we will keep it simple.
// We're working with:
// - OAuth Social Login process vs. Our default sign up process
// - the email address is considered the username or user's primary login ID
//   - Their email is used for oauth social login, or their email 
//     is used with a password for our default sign up & login process. 

exports.up = function(knex) {
  return knex.schema
  .createTable('users', function (table) {
    table.increments('user_id').primary()
    table.string('oauth_provider_user_id')
    table.string('oauth_provider');
    table.string('email');
    table.string('argon2_hashed_password');
    table.boolean('isSeedData');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable("users")
};