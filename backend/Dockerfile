FROM php:8.2-cli-alpine

WORKDIR /var/www/html

RUN apk add --no-cache bash git icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install pdo_mysql mbstring bcmath intl zip opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction \
    && php artisan config:clear \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache

EXPOSE 10000

CMD ["sh", "scripts/render-start.sh"]
