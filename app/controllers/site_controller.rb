class SiteController < ApplicationController
	def index
		@factions = ["", "red", "blue", "green"]
		@nodes = []
		iter = 1
		while (iter <= 32)
			base = "elem"
			fid = DataNode.find_by(value: iter).first.faction_id
			@nodes.push(name)
			iter++
		end
	end
end
