class SiteController < ApplicationController
	def index
		@factions = [' ', ' red', ' blue', ' green', ' ']
		@nodes = []
		i = 1
		while i <= 32 do
			base = 'elem'
			fid = DataNode.where(value: i).first.faction_id
			name = base << @factions[fid]
			@nodes.push(name)
			iter++
		end
	end
end
