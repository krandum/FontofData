class PlayController < ApplicationController

	before_action :authenticate_user!

	def index
		factions = ["", "red", "blue", "green", ""]
		@classes = []
		iter = 1
		while iter <= 32 do
			print iter.to_s
			name = "elem"
			elem = DataNode.where(value: iter).first
			unless elem.nil? || elem == 0
				index = elem.faction_id
				name += " " + factions[index]
			end
			@classes.push(name)
			iter += 1
		end
	end
end
