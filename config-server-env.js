module.exports = {
  env: {
    //######### General section
    NODE_ENV: "developmentB",
    APP_API_BASE_URL: "localhost:3000",

    //######### KnexJS Section, for connecting nodejs app to Postgres DB
    // for local dev on mac laptop.  dont delete.  needed for local knex
    DB_CONNECTION_LOCAL_LAPTOP_DEV: "postgres://root:root@localhost:5432/root",

    // for remote deployment
    DEV_DOCKER_POSTGRES_CONTAINER_NAME: "postgres-proj-postgres-1",
    DEV_POSTGRES_USER: "root",
    DEV_POSTGRES_PASSWORD: "root",
    DEV_POSTGRES_DATABASE_NAME: "root",
    DEV_DB_MIGRATIONS_DIR: "./db/migrations",
    DEV_DB_SEEDS_DIR: "./db/seeds",

    //####### Social Login OAuth section
    DEV_GOOGLE_OAUTH_CLIENTID: "keyHere",
    DEV_GOOGLE_OAUTH_CLIENTSECRET: "keyHere",
    DEV_GOOGLE_OAUTH_CALLBACKURL: "http://localhost:3000/auth/google/callback",
    DEV_FACEBOOK_OAUTH_APPID: "keyHere",
    DEV_FACEBOOK_OAUTH_APPSECRET: "keyHere",
    DEV_FACEBOOK_OAUTH_CALLBACKURL:
      "http://localhost:3000/auth/facebook/callback",
  },
};
