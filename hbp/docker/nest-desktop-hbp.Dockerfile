FROM nestsim/nest:2.18.0
LABEL maintainer="Sebastian Spreizer <spreizer@web.de>"

RUN apt-get update && apt-get install -y python3-pip

# install nest-desktop and nest-server
RUN pip3 install nest-desktop==2.*.* --upgrade

# add user 'nest'
RUN adduser --disabled-login --gecos 'NEST' --home /home/nest nest && \
    chown nest:nest /home/nest

# copy entrypoint to nest home folder
COPY ./docker/entrypoint.sh /home/nest
RUN chown nest:nest /home/nest/entrypoint.sh && \
    chmod +x /home/nest/entrypoint.sh && \
    echo '. /opt/nest/bin/nest_vars.sh' >> /home/nest/.bashrc

# Setup user authentication for HBP

RUN apt-get update && apt-get install -y \
    apache2 \
    libapache2-mod-auth-openidc && \
    rm -rf /var/lib/apt/lists/*

# enable needed modules
RUN a2enmod auth_openidc && \
    a2enmod ssl && \
    a2enmod rewrite && \
    a2enmod proxy && \
    a2enmod proxy_http && \
    a2enmod proxy_wstunnel

# disable default virtual host
RUN a2dissite 000-default

# send logs to stderr and stdout
# see : https://serverfault.com/questions/711168/writing-apache2-logs-to-stdout-stderr
#
RUN ln -sf /proc/self/fd/1 /var/log/apache2/other_vhosts_access.log && \
    ln -sf /proc/self/fd/2 /var/log/apache2/error.log

COPY ./hbp/auth/apache2/01-nest-desktop.apps-dev.hbp.eu.conf ./etc/apache2/sites-enabled/

EXPOSE 80 5000 8000
WORKDIR /home/nest
USER nest
ENTRYPOINT ["/home/nest/entrypoint.sh"]
