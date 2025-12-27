FROM postgres:15-alpine

# Install openssl for certificate generation
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /var/lib/postgresql/ssl

# Generate SSL certificates during build
RUN openssl genrsa -out /var/lib/postgresql/ssl/server.key 2048 && \
    openssl req -new -key /var/lib/postgresql/ssl/server.key -out /var/lib/postgresql/ssl/server.csr \
        -subj "/C=TH/ST=Bangkok/L=Bangkok/O=OvenX/OU=IT/CN=db.ovenx.shop" && \
    openssl x509 -req -days 3650 -in /var/lib/postgresql/ssl/server.csr \
        -signkey /var/lib/postgresql/ssl/server.key -out /var/lib/postgresql/ssl/server.crt && \
    rm /var/lib/postgresql/ssl/server.csr && \
    chmod 600 /var/lib/postgresql/ssl/server.key && \
    chmod 644 /var/lib/postgresql/ssl/server.crt && \
    chown postgres:postgres /var/lib/postgresql/ssl/*

# Copy custom PostgreSQL config
COPY postgres-ssl.conf /etc/postgresql/postgresql.conf
COPY pg_hba_ssl.conf /etc/postgresql/pg_hba.conf

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf", "-c", "hba_file=/etc/postgresql/pg_hba.conf"]
