#!/usr/bin/env bash
pg_ctl -D /usr/local/var/postgres -l log/pgsql_server.log start
touch shared/log/sidekiq.log
bundle exec sidekiq -d -L log/sidekiq.log
