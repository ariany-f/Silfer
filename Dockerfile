FROM php:8.2-fpm

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1

# Dependências do sistema + Nginx
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 (Laravel Mix)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Extensões PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd exif pdo pdo_mysql zip bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar projeto
COPY . .

# Permissões Laravel
RUN chmod -R 775 storage bootstrap/cache

# Dependências PHP
RUN composer install --no-dev --optimize-autoloader

# Build frontend
RUN npm install && npm run production

# Config Nginx (template com LISTEN_PORT para substituir no startup)
COPY docker/nginx-default.conf.template /etc/nginx/conf.d/default.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf

# Script de startup (injetar PORT e iniciar FPM + Nginx)
COPY docker/start-container.sh /start-container.sh
# Corrigir CRLF (Windows) e garantir permissão
RUN sed -i 's/\r$//' /start-container.sh && chmod +x /start-container.sh

EXPOSE 8080

CMD ["/start-container.sh"]
