#!/bin/bash
# Generate SSL certificates for PostgreSQL

SSL_DIR="/var/lib/postgresql/ssl"
mkdir -p $SSL_DIR

# Generate CA key and certificate
openssl genrsa -out $SSL_DIR/ca.key 4096
openssl req -x509 -new -nodes -key $SSL_DIR/ca.key -sha256 -days 3650 -out $SSL_DIR/ca.crt \
    -subj "/C=TH/ST=Bangkok/L=Bangkok/O=OvenX/OU=IT/CN=PostgreSQL-CA"

# Generate server key and CSR
openssl genrsa -out $SSL_DIR/server.key 2048
openssl req -new -key $SSL_DIR/server.key -out $SSL_DIR/server.csr \
    -subj "/C=TH/ST=Bangkok/L=Bangkok/O=OvenX/OU=IT/CN=db.ovenx.shop"

# Create extensions file for SAN
cat > $SSL_DIR/server.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = db.ovenx.shop
DNS.2 = localhost
DNS.3 = postgres
IP.1 = 127.0.0.1
IP.2 = 192.168.1.13
EOF

# Sign server certificate with CA
openssl x509 -req -in $SSL_DIR/server.csr -CA $SSL_DIR/ca.crt -CAkey $SSL_DIR/ca.key \
    -CAcreateserial -out $SSL_DIR/server.crt -days 3650 -sha256 -extfile $SSL_DIR/server.ext

# Set proper permissions
chmod 600 $SSL_DIR/server.key
chmod 644 $SSL_DIR/server.crt $SSL_DIR/ca.crt
chown postgres:postgres $SSL_DIR/*

echo "SSL certificates generated successfully!"
ls -la $SSL_DIR/
