bundle exec rake db:drop
bundle exec rake db:migrate
bundle exec rake db:seed
printf "Create admin account\n"
printf "Email: "
while [ -z "$email" ]; do
  read email
done
printf "Password: "
while [ -z "$password" ]; do
  read -s password
done
echo
bundle exec rails runner "User.create!({username: \"admin\", email: \"$email\", password: \"$password\", password_confirmation: \"$password\", admin: true })"
