brew install postgresql
initdb /usr/local/var/postgres
pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
which psql
bundle
bundle exec rake db:create:all
bundle exec rake db:migrate
sh setup.sh
