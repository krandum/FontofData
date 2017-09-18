class SiteController < ApplicationController
	def index
		@factions = [' ', ' red', ' blue', ' green', ' ']
		@nodes = []
		iter = 1
		while iter <= 32 do
			base = 'elem'
			fid = DataNode.where(value: iter).first.faction_id
			name = base << @factions[fid]
			@nodes.push(name)
			iter++
		end
	end
end
