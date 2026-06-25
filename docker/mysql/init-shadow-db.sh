#!/bin/sh
set -eu

shadow_database="${MYSQL_SHADOW_DATABASE:-${MYSQL_DATABASE}_shadow}"

case "$MYSQL_DATABASE" in
  *[!A-Za-z0-9_]* | "")
    echo "MYSQL_DATABASE must contain only letters, numbers, and underscores" >&2
    exit 1
    ;;
esac

case "$shadow_database" in
  *[!A-Za-z0-9_]* | "")
    echo "MYSQL_SHADOW_DATABASE must contain only letters, numbers, and underscores" >&2
    exit 1
    ;;
esac

case "$MYSQL_USER" in
  *[!A-Za-z0-9_]* | "")
    echo "MYSQL_USER must contain only letters, numbers, and underscores" >&2
    exit 1
    ;;
esac

mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`$shadow_database\`;
GRANT ALL PRIVILEGES ON \`$shadow_database\`.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
SQL
