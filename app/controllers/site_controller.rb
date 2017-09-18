class SiteController < ApplicationController
	def index
		@factions = ["", "red", "blue", "green"]
		@nodes = []
		(1...32).each do |key, iter|
			base = "elem"
			fid = DataNode.first(:conditions => ["value = ?", iter]).faction_id
			@nodes.push(name)
		end
	end
end
