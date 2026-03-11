FROM php:8.2-cli

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1

# Dependências do sistema
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

# Extensões PHP
RUN docker-php-ext-install gd exif pdo pdo_mysql zip

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar projeto
COPY . .

# Instalar dependências PHP
RUN composer install --no-dev --optimize-autoloader

# Instalar dependências JS
RUN npm install

# Build frontend (Laravel Mix)
RUN npm run production

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=$PORT
