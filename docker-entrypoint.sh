#!/bin/sh
set -eu

# Intentionally without --accept-data-loss: a schema change that would drop
# data should fail the container rather than silently destroying user data.
./node_modules/.bin/prisma db push --skip-generate

exec node server.js
