class Faction < ActiveRecord::Base
	has_many :users
	has_many :data_nodes
	has_many :clusters, as: :owner
	# unsure if faction will have easy access to cluster owned by players

	# def self.joinFaction(user)
	#
	# end

end
