class PlayController < ApplicationController

	before_action :authenticate_user!

	def index
		factions = ["", "", "red", "blue", "green"]
		@classes = []
		iter = 1
		while iter <= 32 do
			name = "elem"
			elem = DataNode.where(value: iter).first
			unless elem.nil? || elem == 0
				index = elem.faction_id
				name += " " + factions[index]
			end
			@classes.push(name)
			iter += 1
		end
		@user = User.find(current_user.id)
		asset_path("kyle-gregory-devaras-241280.jpg")
	end
end
