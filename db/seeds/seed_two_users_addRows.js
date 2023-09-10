exports.seed = async function (knex) {
  try {
    await knex("users").insert(
      [
        {
        oauth_provider_user_id: '1234',
        oauth_provider: 'google',
        email: 'blah123@gmail.com',
        argon2_hashed_password: 'blah-fake-pass',
        isSeedData: true,
      },
        {
        oauth_provider_user_id: '3412',
        oauth_provider: 'facebook',
        email: 'johndoe@gmail.com',
        argon2_hashed_password: 'blah-fake-pass',
        isSeedData: true,
      },
        {
        oauth_provider_user_id: '3124',
        oauth_provider: 'facebook',
        email: 'johndoe@gmail.com',
        argon2_hashed_password: 'blah-fake-pass',
        isSeedData: true,
      },
        {
        oauth_provider_user_id: '2431',
        oauth_provider: 'google',
        email: 'jimdoe@gmail.com',
        argon2_hashed_password: 'blah-fake-pass',
        isSeedData: true,
      },
      // for testing local_auth sign in process
      // {
      //   oauth_provider_user_id: '111244555435771716184',
      //   oauth_provider: 'local_auth',
      //   email: 'patrick.wm.meaney@gmail.com',
      //   argon2_hashed_password: 'blah-fake-pass',
      //   isSeedData: true,
      // },
    ]);
    
  } catch (err) {
    console.error(err);
  }
};