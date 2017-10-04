bundle exec rake db:migrate
printf "run rake db:seed? y/n: "
while [ -z "$confirm_seed" ]; do
	read confirm_seed
	if [ $confirm_seed == "y" ]
	then
	  bundle exec rake db:seed
  elif [ $confirm_seed == "n" ]
	then
  		printf "Skipping Seed."
		bundle exec rails runner "load 'reset_dn.rb'"
	else
		$confirm_seed = ""
	fi
done
echo
printf "Create an admin account? y/n:"
while [ -z "$confirm_admin" ]; do
	read confirm_admin
	if [ $confirm_admin = "y" ]
	then
		printf "Username: "
		while [ -z "$username" ]; do
		  read username
		done
		printf "Email: "
		while [ -z "$email" ]; do
		  read email
		done
		printf "Password: "
		while [ -z "$password" ]; do
		  read -s password
		done
		echo
		bundle exec rails runner "User.create!({username: \"$username\", email: \"$email\", password: \"$password\", password_confirmation: \"$password\" })"
		bundle exec rails runner "User.where(email: \"$email\").first.super_admin!"
	elif [ $confirm_admin != "n" ]
	then
		$confirm_admin = ""
	fi
done
