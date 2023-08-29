## Project Info


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