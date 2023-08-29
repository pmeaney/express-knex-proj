module.exports = {
  "env": {
    //######### General section
    "NODE_ENV": "developmentB",
    "APP_API_BASE_URL": "localhost:3000",
    
    //######### KnexJS Section, for connecting nodejs app to Postgres DB
    // for local dev on mac laptop.  dont delete.  needed for local knex
    "DB_CONNECTION_LOCAL_LAPTOP_DEV": "postgres://root:root@localhost:5432/root",

    // for remote deployment
    "DEV_DOCKER_POSTGRES_CONTAINER_NAME": "postgres-proj-postgres-1",
    "DEV_POSTGRES_USER": "root",
    "DEV_POSTGRES_PASSWORD": "root",
    "DEV_POSTGRES_DATABASE_NAME": "root",
    "DEV_DB_MIGRATIONS_DIR": "./db/migrations",
    "DEV_DB_SEEDS_DIR": "./db/seeds",

    //####### Social Login OAuth section
    "DEV_GOOGLE_OAUTH_CLIENTID": "64137204712-cua6rig9qv2omf3jeibm94i4pfc3hha1.apps.googleusercontent.com",
    "DEV_GOOGLE_OAUTH_CLIENTSECRET": "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",
    "DEV_GOOGLE_OAUTH_CALLBACKURL": "http://localhost:3000/auth/google/callback",
    "DEV_FACEBOOK_OAUTH_APPID": "558790309650216",
    "DEV_FACEBOOK_OAUTH_APPSECRET": "e3b880b0829b9b4aa2403faeae55a6ba",
    "DEV_FACEBOOK_OAUTH_CALLBACKURL": "http://localhost:3000/auth/facebook/callback"
  }
}