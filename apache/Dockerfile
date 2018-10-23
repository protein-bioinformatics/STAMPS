FROM ubuntu:18.04
USER root

RUN apt-get update && apt-get install -y locales \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

RUN apt-get install -y apache2 python3 build-essential
RUN apt-get install -y nano
RUN apt-get install -y python3-pymysql libmysqlclient-dev libmysqlcppconn-dev openjdk-8-jre-headless openjdk-8-jdk-headless zlib1g-dev libsqlite3-dev
RUN rm -rf /var/lib/apt/lists/*

ADD apache2/ /etc/apache2/
ADD --chown=www-data:www-data stamps/ /var/www/html/stamps/
RUN a2dismod mpm_event && a2enmod mpm_prefork
RUN a2enmod proxy \
autoindex \
alias \
authn_file \
authz_host \
negotiation \
filter \
cgi \
rewrite \
authz_user \
deflate \
headers \
xml2enc \
mime \
proxy_http \
authz_core \
authn_core \
ssl \
env \
dir \
auth_basic \
status \
access_compat \
socache_shmcb \
setenvif 

RUN rm /var/www/html/index.html
RUN cd /var/www/html/stamps/admin/ && ln -s /run/secrets/stamps-config qsdb.conf

EXPOSE 80
EXPOSE 443
#USER www-data
RUN cd /var/www/html/stamps/admin/src && make
CMD apachectl -D FOREGROUND
