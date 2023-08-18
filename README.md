
____________

Source of Docker Compose template for connecting NodeJS with Postgres (& PGAdmin):
https://github.com/alexeagleson/docker-node-postgres-template


export CR_PAT=githubToken
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
docker build -t ghcr.io/USERNAME/PACKAGENAME . 
docker push ghcr.io/USERNAME/PACKAGENAME:latest
