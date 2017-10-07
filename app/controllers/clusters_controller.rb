class ClustersController < ApplicationController

	def info
		@factions = Faction.all
		@users = User.all
	end

end
