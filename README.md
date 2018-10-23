# Docker Containers for STAMPS

# Initial Setup
## Networks
The docker stack requires two networks to exist, the 'stamps' network connects the services internally:

  docker network create --attachable -d overlay --subnet=10.100.11.0/24 --gateway=10.100.11.1 stamps

While the 'proxy' network routes outside requests to the apache service. The proxy network should not need to be created.
If it needs to be created, you can add it as follows:

  docker network create --attachable -d overlay --subnet=10.100.10.0/24 --gateway=10.100.10.1 proxy

Please note: the proxy network is used by the traefik proxy to forward requests to a service that exposes specific docker labels.

## Secrets
The stack supports the following secrets for secure storage and access of credentials:

 - qsdb-mysql-root
 - qsdb-database
 - qsdb-mysql-user
 - qsdb-mysql-password

These secrets need to be defined before the stack can be deployed. The following command creates the secret 'SECRET-NAME' (please substitute with one of the names above)
with the value "mypassword".

  echo "mypassword" | docker secret create SECRET-NAME -

The content of each secret is available at runtime within the docker container as a file below `/run/secrets/<SECRET-NAME>`.

## Apache Docker Container

https://hub.docker.com/_/httpd/

To run the container locally, exposing internal port 80 to external 8088 and 443 to 9443 with an interactive terminal, where 'CONTAINER_ID' is the docker container hash (docker image ls):

  docker run -p8088:80 -p9443:443 -it CONTAINER_ID

## MySQL Docker Container

https://hub.docker.com/_/mysql/
