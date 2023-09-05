exports.seed = async function (knex) {
  try {
    await knex("users").insert(
      [
      //   {
      //   oauth_provider_user_id: '111244555435771716184',
      //   oauth_provider: 'google',
      //   email: 'patrick.wm.meaney@gmail.com',
      //   isSeedData: true,
      // },
        {
        oauth_provider_user_id: '1234',
        oauth_provider: 'google',
        email: 'blah123@gmail.com',
        isSeedData: true,
      },
        {
        oauth_provider_user_id: '3412',
        oauth_provider: 'facebook',
        email: 'johndoe@gmail.com',
        isSeedData: true,
      },
        {
        oauth_provider_user_id: '3124',
        oauth_provider: 'facebook',
        email: 'johndoe@gmail.com',
        isSeedData: true,
      },
        {
        oauth_provider_user_id: '2431',
        oauth_provider: 'google',
        email: 'jimdoe@gmail.com',
        isSeedData: true,
      },
    ]);
    
  } catch (err) {
    console.error(err);
  }
};