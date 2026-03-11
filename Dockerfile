FROM php:8.2-cli

WORKDIR /app

# Variáveis para evitar erro do React CRA
ENV SKIP_PREFLIGHT_CHECK=true
ENV COMPOSER_ALLOW_SUPERUSER=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    nodejs \
    npm

# Instalar extensões PHP necessárias
RUN docker-php-ext-install \
    gd \
    exif \
    pdo \
    pdo_mysql \
    zip

# Instalar composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar projeto
COPY . .

# Instalar dependências PHP
RUN composer install --no-dev --optimize-autoloader

# Instalar dependências do frontend
RUN npm ci

# Build React
RUN npm run build

# Gerar key caso não exista
RUN php artisan key:generate || true

# Porta usada pelo Railway
EXPOSE 8080

# Rodar Laravel
CMD php artisan serve --host=0.0.0.0 --port=$PORT
