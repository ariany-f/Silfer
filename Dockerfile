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
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 (Laravel Mix precisa de Node 14+)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Extensões PHP (bcmath e mbstring para Laravel)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd exif pdo pdo_mysql zip bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar projeto
COPY . .

# Permissões para Laravel
RUN chmod -R 775 storage bootstrap/cache

# Instalar dependências PHP
RUN composer install --no-dev --optimize-autoloader

# Instalar dependências JS e build frontend
RUN npm install && npm run production

# Otimizações Laravel para produção
# (config/route/view cache rodam no startup quando env vars estão disponíveis)

EXPOSE 8080

# Railway injeta PORT; usa 8080 como fallback
CMD ["sh", "-c", "php artisan config:cache 2>/dev/null || true && php artisan route:cache 2>/dev/null || true && php artisan view:cache 2>/dev/null || true && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
