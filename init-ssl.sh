#!/bin/bash
# Script para obter certificado SSL inicial com Let's Encrypt
# Uso: bash init-ssl.sh seudominio.com.br seuemail@email.com

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Uso: bash init-ssl.sh seudominio.com.br seuemail@email.com"
    exit 1
fi

echo "=== Gerando certificado SSL para $DOMAIN ==="

# Criar diretórios necessários
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Parar containers existentes
docker compose down 2>/dev/null || true

# Substituir domínio no nginx.conf
sed -i "s/SEUDOMINIO.COM.BR/$DOMAIN/g" ./nginx/nginx.conf

echo ">> Passo 1: Subindo nginx temporário para validação..."

# Criar nginx temporário só para o challenge (sem SSL)
cat > ./nginx/nginx-temp.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Aguardando certificado SSL...';
        add_header Content-Type text/plain;
    }
}
EOF

# Subir só o nginx temporário
docker run -d --name nginx-temp \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx-temp.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

echo ">> Passo 2: Obtendo certificado com Certbot..."

# Rodar certbot
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo ">> Passo 3: Limpando nginx temporário..."
docker stop nginx-temp && docker rm nginx-temp
rm ./nginx/nginx-temp.conf

echo ""
echo "=== Certificado obtido com sucesso! ==="
echo ">> Agora execute: docker compose up -d --build"
echo ""
