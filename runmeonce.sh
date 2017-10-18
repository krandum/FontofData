bundle exec rake db:drop
bundle exec rake db:migrate
sh setup.sh
bundle exec rails runner "User.create!({username: \"Red\", email: \"red@red.com\", password: \"redred\", password_confirmation: \"redred\" })"
bundle exec rails runner "User.create!({username: \"Blue\", email: \"blue@blue.com\", password: \"blueblue\", password_confirmation: \"blueblue\" })"
bundle exec rails runner "User.create!({username: \"Green\", email: \"green@green.com\", password: \"greengreen\", password_confirmation: \"greengreen\" })"
