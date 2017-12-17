#!/usr/bin/env bash
pg_ctl -D /usr/local/var/postgres -l shared/log/pgsql_server.log start
bundle exec sidekiq -d -L shared/log/sidekiq.log
