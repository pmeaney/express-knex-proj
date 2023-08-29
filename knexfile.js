const process = require('./config-server-env')

module.exports = {
  developmentB: {
    client: 'postgres',
    // for local dev on mac laptop.  dont delete.  needed for local knex
    // be sure to comment-out this before docker publish & deployment.
    // connection: process.env.DB_CONNECTION_LOCAL_LAPTOP_DEV,

    // for remote server connection.  needed for remote knex
    // be sure to uncomment this before docker publish & deployment.
    connection: {
      // host: '172.21.0.2', // docker postgres container IP. works.  but breaks knex connection
      host:     process.env.DEV_DOCKER_POSTGRES_CONTAINER_NAME,  // docker container name. works.  but breaks knex connection
      database: process.env.DEV_POSTGRES_USER,
      user:     process.env.DEV_POSTGRES_PASSWORD,
      password: process.env.DEV_POSTGRES_DATABASE_NAME,
    },
    migrations: {
      directory: process.env.DEV_DB_MIGRATIONS_DIR,
    },
    seeds: {
      directory: process.env.DEV_DB_SEEDS_DIR,
    },
    useNullAsDefault: true
  },

  // Since KnexJS CLI commands rely on "development" setting here,
  // just note that this is just for Knex.
  // developmentB are the set for the appCode
  development: {
    client: 'postgres',
    // for local dev on mac laptop.  dont delete.  needed for local knex
    // be sure to comment-out this before docker publish & deployment.
    connection: process.env.DB_CONNECTION_LOCAL_LAPTOP_DEV,

    // for remote server connection.  needed for remote knex
    // be sure to uncomment this before docker publish & deployment.
    // connection: {
    //   // host: '172.21.0.2', // docker postgres container IP. works.  but breaks knex connection
    //   host:     process.env.DEV_DOCKER_POSTGRES_CONTAINER_NAME,  // docker container name. works.  but breaks knex connection
    //   database: process.env.DEV_POSTGRES_USER,
    //   user:     process.env.DEV_POSTGRES_PASSWORD,
    //   password: process.env.DEV_POSTGRES_DATABASE_NAME,
    // },
    migrations: {
      directory: process.env.DEV_DB_MIGRATIONS_DIR,
    },
    seeds: {
      directory: process.env.DEV_DB_SEEDS_DIR,
    },
    useNullAsDefault: true
  },

  // production: {
  //   client: process.env.DB_CLIENT,
  //   connection: process.env.DB_CONNECTION,
  //   migrations: {
  //     directory: process.env.DB_MIGRATION_DIR,
  //   },
  //   seeds: {
  //     directory: process.env.DB_SEEDS_DIR
  //   },
  //   useNullAsDefault: true
  // }
};