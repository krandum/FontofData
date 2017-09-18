class SiteController < ApplicationController
	def index
		@factions = ["", "red", "blue", "green"]
		@nodes = []
		(1...32).each do |key, value|
			base = "elem"
			fid = DataNode.first(:conditions => {:value => value}).faction_id
			@nodes.push(name)
		end
	end
end
