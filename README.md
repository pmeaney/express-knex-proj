## Project Info

VS Code Extensions
- Better Comments
  - Allows comment colors:
    - // * <-- Green Comments.  For calling out conditional flow

**A Template User System:** Social Auth + Default Auth.

The project will initally be just a user mgmt template, useful for building apps in general. 



### Swagger stuff:
https://dev.to/przpiw/document-express-api-with-swagger-51in

____________
### KnexJS stuff

knex migrate:up 
knex migrate:make migration_one
knex seed:make seed_one_clear_db
knex seed:make seed_two_initialize_data 
knex seed:run --specific=seed_two_initialize_data.js

Knex can be a little funky...
Or maybe I just need to experiment with it a little more.
For local dev on laptop, connect via:
connection: process.env.DB_CONNECTION_LOCAL_LAPTOP_DEV,
"DB_CONNECTION_LOCAL_LAPTOP_DEV": "postgres://root:root@localhost:5432/root",
(previously had: 
    "DB_CONNECTION": "postgres://localhost:5432/root@root",)

    but strangely had this issue from postgres container log:
    2023-08-23 22:03:30.642 UTC [39] FATAL:  password authentication failed for user "patrickmeaney"

    but the new way works.
    
vs on remote ubuntu server, this works:
 connection: {
       host:     process.env.DEV_DOCKER_POSTGRES_CONTAINER_NAME,
       database: process.env.DEV_POSTGRES_USER,
       user:     process.env.DEV_POSTGRES_PASSWORD,
       password: process.env.DEV_POSTGRES_DATABASE_NAME,
     },
    "DEV_DOCKER_POSTGRES_CONTAINER_NAME": "postgres-proj-postgres-1",
    "DEV_POSTGRES_USER": "root",
    "DEV_POSTGRES_PASSWORD": "root",
    "DEV_POSTGRES_DATABASE_NAME": "root",


### Docker stuff

docker compose  -f docker-compose-local.yml up --build

On local dev laptop (docker-compose-local.yml), I use slightly different settings-- basically, I only need to connect the NodeJS & Postgres containers to the same network. And, the image is built locally.  Whereas, in the docker-compose-remote.yml, we pull the published image, and connect the NodeJS app container to the nginx container's network (which the remote postgres container is also connected to)
- On laptop, use: `docker compose -f docker-compose-local.yml up`
    **When you install something new though**, you'll need to **tell docker to rebuild with --build** as shown here: 
    `docker compose  -f docker-compose-local.yml up --build`
- On remote, use: `docker compose -f docker-compose-remote.yml up`

- To publish to github docker registry automatically, commit to the branch specified at ./.github/workflow/build_publish_pull.yaml

Or, if you want to publish manually:
```bash
export CR_PAT=githubToken
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
docker build -t ghcr.io/pmeaney/express-knex-proj . 
docker push ghcr.io/pmeaney/express-knex-proj:latest
```

Source of Docker Compose template for connecting NodeJS with Postgres (& PGAdmin):
https://github.com/alexeagleson/docker-node-postgres-template



```bash
export CR_PAT=githubToken
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
docker build -t ghcr.io/USERNAME/PACKAGENAME . 
docker push ghcr.io/USERNAME/PACKAGENAME:latest
```


### Architecture sections

- Sessions
  - https://medium.com/swlh/session-management-in-nodejs-using-redis-as-session-store-64186112aa9

- Security
  - argon2
    - http://cjlarose.com/2016/03/29/argon2-ffi-express.html
    - Salt is included in hash automatically: https://github.com/ranisalt/node-argon2/wiki/Options#salt
    - https://www.npmjs.com/package/argon2

```javascript
// simple argon2 example from https://github.com/ranisalt/node-argon2#readme
// run "node" then paste this:
const argon2 = require('argon2');
const hash = await argon2.hash("password");
console.log('hash is: ', hash;)
await argon2.verify(hash, "password")
```

```javascript
// nodejs example in CLI REPL
❯ node        
Welcome to Node.js v18.16.1.
Type ".help" for more information.
> const argon2 = require('argon2');
undefined
> const hash = await argon2.hash("password");
undefined
> hash;
'$argon2id$v=19$m=65536,t=3,p=4$8nDd6IlGzAV+xkYCMuZYGQ$yjxQvSagvZrbs0yy9QAzzoalnQ97tg240VsEv8ZbwyE'
> await argon2.verify(hash, "password")
true

```



Since the Argon2 library generates a salt for us (https://github.com/ranisalt/node-argon2/wiki/Options#salt) Do we need to still extract its salt and store it in the DB?

Well, as it turns out, Argon2's hash function output includes the salt within it already.  So by storing the hash, since it already includes a salt value by default (default is 16 chars), the salt is stored as well.  More info here in the "Storing Passwords" section:
https://www.alexedwards.net/blog/how-to-hash-and-verify-passwords-with-argon2-in-go