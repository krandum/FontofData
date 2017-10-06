class PagesController < ApplicationController
	def home
		@news_posts = NewsPost.all
	end

	def about
	end

	def story
	end

	# def play
	# 	factions = ["", "", "red", "blue", "green"]
	# 	@classes = []
	# 	iter = 1
	# 	while iter <= 32 do
	# 		name = "elem"
	# 		elem = DataNode.where(value: iter).first
	# 		unless elem.nil? || elem == 0
	# 			index = elem.faction_id
	# 			name += " " + factions[index]
	# 		end
	# 		@classes.push(name)
	# 		iter += 1
	# 	end
	# 	@user = User.find(current_user.id)
	# end

	def faq
	end

	def e404
	end

	def e500
	end
end
