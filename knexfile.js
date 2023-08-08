const process = require('./config-server-env.json')

module.exports = {
  development: {
    client: 'postgres',
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