class SiteController < ApplicationController
	def index
		@factions = ["", "red", "blue", "green"]
		@nodes = []
		iter = 1
		while (iter <= 32)
			base = "elem"
			fid = DataNode.first(:conditions => ["value = ?", iter]).faction_id
			@nodes.push(name)
			iter++
		end
	end
end
