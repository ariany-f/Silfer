#!/bin/sh
set -e

PORT="${PORT:-8080}"

# Substituir PORT no template do Nginx
sed "s/LISTEN_PORT/$PORT/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Cache Laravel (não bloqueia; falha silenciosa se faltar env)
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

# PHP-FPM em background
php-fpm

# Nginx em primeiro plano (Railway espera processo principal)
exec nginx -g 'daemon off;'
