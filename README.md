# Docker Containers for STAMPS
# Requirements

- [Docker CE latest](https://docs.docker.com/install/)
- [Getting Started](https://docs.docker.com/get-started/)
- [Local Docker Swarm](https://docs.docker.com/get-started/part4/)

# Initial Setup
## Networks

info:: If you do not specify subnet and gateway, docker will pick those randomly, which may conflict with existing subnet / gateway settings on your local machine or network.

The docker stack requires two networks to exist, the 'stamps' network connects the services internally:

~~~~
docker network create --attachable -d overlay --subnet=10.100.11.0/24 --gateway=10.100.11.1 stamps
~~~~

While the 'proxy' network routes outside requests to the apache service. The proxy network should not need to be created.
If it needs to be created, you can add it as follows:

~~~~
docker network create --attachable -d overlay --subnet=10.100.10.0/24 --gateway=10.100.10.1 proxy
~~~~

Please note: the proxy network is used by the traefik proxy to forward requests to a service that exposes specific docker labels.
You can find an example for this in `docker-compose-feris.yml`.

## Apache Docker Container

- [Ubuntu Docker Base Images](https://hub.docker.com/_/ubuntu/)
- [Local Customization](./apache/)

To build the container, run:

~~~~
cd apache
docker build .
~~~~

This will build the container, following all steps as specified in the Dockerfile.
On success, the build will print out a final message like `Successfully built 151acaefd707`. The latter part is part of the container's hash code that is used to identify it based on its contents as the CONTAINER_ID.

To run the container locally, exposing internal port 80 to external 8088 and 443 to 9443 with an interactive terminal, where 'CONTAINER_ID' is the docker container hash (docker image ls):

~~~~
docker run -p8088:80 -p9443:443 -it CONTAINER_ID
~~~~

To use the container within the docker-compose file, you need to tag it and push it to the registry. At ISAS, the Docker registry runs at do1-aps-feris.isas.de:5000, which we thus use as the prefix of our container tag, where `VERSION` should be replaced with the release version of your container and `CONTAINER_ID` with the hash code for your container:

~~~~
docker tag CONTAINER_ID do1-aps-feris.isas.de:5000/isas/stamps-apache:VERSION
~~~~

To make the image available to other docker hosts, run (with `VERSION` replaced):

~~~~
docker push do1-aps-feris.isas.de:5000/isas/stamps-apache:VERSION
~~~~

You may have to login to the registry with your regular ISAS user credentials before you can push:

~~~~
docker login do1-aps-feris.isas.de:5000/v1
~~~~

## MySQL Docker Container

- [MySQL Docker Base Images](https://hub.docker.com/_/mysql/)
- [Local Customization](./mysql)

# Starting the Application
## Important files

 - `docker-compose-feris.yml` - Docker stack definition for use on feris / lardo (Test System)
 - `docker-compose.yml` - Docker stack definition for local use (Development)

## Secrets
You can create a secret in one of two ways, reading the secret's content from a file:

~~~~
docker secret create SECRET_NAME FILE
~~~~

or from standard input:

~~~~
echo "my secret content" | docker secret create SECRET_NAME -
~~~~

Secrets are accessible to a running container as files under `/run/secrets/SECRET_NAME` and can thus be used 
to provide passwords or sensitive information to programs running in the container.

 - stamps-config - This file needs to be adapted to point at the right locations in the docker container and to provide info to contact and authenticate with the database. Its template is qsdb.config.
 - qsdb-mysql-root - MySQL root user password, used during initialization and bootstrapping of the database.
 - qsdb-mysql-user - The regular user for the qsdb database schema.
 - qsdb-mysql-password - The regular user's password to authenticate to the mysql service.

## Launching a stack
To launch the development stack, run the following command:
~~~~
docker stack deploy --compose-file docker-compose.yml stamps-dev
~~~~
If you inspect the compose file, you will see so-called bind-mount instructions (volumes section). This allows to mount a local filesystem into the running container, possibly replacing
the content already present in the container at the mount location. This is however not persistent. 

warning:: Any changes made locally in that mounted directory are transparent to the container while 
running but will not be saved in the container when you stop or restart the container / service.



