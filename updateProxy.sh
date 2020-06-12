#!/usr/bin/env sh
set -eu

sed "s/{\$EXTERNAL_API_SVC}/$EXTERNAL_API_SVC/g" /app/Caddyfile.template > /app/Caddyfile

ln -s /app/packagehtml/$HTML_ROOT /app/html 

exec caddy -conf /app/Caddyfile
