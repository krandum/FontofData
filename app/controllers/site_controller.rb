class SiteController < ApplicationController
	def index
		@factions = ["", "red", "blue", "green"]
		@nodes = []
		(1...32).each do |iter|
			name = "elem"
			node = DataNode.first(:conditions => {:value => iter})
			if (node.exists?)
				index = node.faction_id
				name += " " + @factions[index]
			end
			@nodes.push(name)
		end
	end
end
