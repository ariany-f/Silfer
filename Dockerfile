FROM php:8.2-cli

WORKDIR /app

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

# Instalar extensões PHP
RUN docker-php-ext-install gd exif pdo pdo_mysql zip

# Instalar composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar projeto
COPY . .

# Instalar dependências PHP
RUN composer install --no-dev --optimize-autoloader

# Build frontend
RUN npm ci
RUN npm run build

# Rodar Laravel
CMD php artisan serve --host=0.0.0.0 --port=$PORT
