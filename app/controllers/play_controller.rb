class PlayController < ApplicationController

	before_action :authenticate_user!

	def index
		factions = ["", "", "red", "blue", "green"]
		elems = DataNode.where(value: 1..32)
		@classes = []
		iter = 1
		i = 0
		i_max = elems.count
		while iter <= 32 do
			name = "elem"
			elem = DataNode.where(value: iter).first
			if i < i_max && iter == elems[i].value
				index = elem.faction_id
				name += " " + factions[index]
				i += 1
			end
			# unless elem.nil? || elem == 0
			# 	index = elem.faction_id
			# 	name += " " + factions[index]
			# end
			@classes.push(name)
			iter += 1
		end
		@user = User.find(current_user.id)
	end
end
