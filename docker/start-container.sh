#!/bin/sh
set -e

PORT="${PORT:-8080}"

# Substituir PORT no template do Nginx
sed "s/LISTEN_PORT/$PORT/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# PHP-FPM em background (não bloqueia; Nginx precisa ser o processo principal)
php-fpm &
sleep 2

# Cache Laravel em background (pode conectar no DB; não bloqueia o Nginx)
(php artisan config:cache 2>/dev/null; php artisan route:cache 2>/dev/null; php artisan view:cache 2>/dev/null) &

# Nginx em primeiro plano (Railway espera esse processo)
exec nginx -g 'daemon off;'
