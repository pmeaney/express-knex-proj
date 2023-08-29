exports.seed = async function (knex) {
  try {
    await knex('roles').del();
    await knex('user_status').del();
    await knex('users').del();
  } catch (err) {
    console.error(err);
  }
};