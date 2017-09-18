class SiteController < ApplicationController
	def index
		@factions = ["", "red", "blue", "green"]
		@nodes = []
		(1...32).each do |iter|
			name = "elem"
			node = DataNode.where(value: iter).first
			if (node.exists?)
				name += " " + @factions[node.first.faction_id % 4]
			end
			@nodes.push(name)
		end
	end
end
