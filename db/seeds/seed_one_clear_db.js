exports.seed = async function (knex) {
  try {
    await knex('users').del();
  } catch (err) {
    console.error(err);
  }
};