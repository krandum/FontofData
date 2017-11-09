#!/usr/bin/env bash
sudo npm init --yes
sudo npm install browserify browserify-incremental paper
uname_out="$(uname -s)"
case "$uname_out" in
       Linux*)         machine=Linux;;
       Darwin*)        machine=Mac;;
       *)              machine="UKNOWN:${uname_out}"
esac
printf "Running setup for %s\n" "$uname_out"
if [ ${machine} == Mac ]
then
	brew install postgresql
	initdb /usr/local/var/postgres
	pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
	which psql
elif [ ${machine} == Linux ]
then
	sudo apt-get install postgresql postgresql-contrib libpq-dev
fi
bundle
bundle exec rake db:create
bundle exec rake db:migrate
sh setup.sh
