#!/usr/bin/env sh
set -eu

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  php artisan db:seed --force
fi

php artisan config:cache
php artisan view:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
