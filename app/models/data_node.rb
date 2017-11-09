class DataNode < ActiveRecord::Base
	belongs_to :faction
	belongs_to :user
	belongs_to :cluster

	has_many :interactions

	has_many :connected_nodes
	has_many :connections, through: :connected_nodes

	has_many :connected_with_nodes, foreign_key: :connection_id, class_name: 'ConnectedNode'
	has_many :connected_withs, through: :connected_with_nodes, source: :data_node

	def claim_node(user)
		user.data_nodes << self
		user.faction.data_nodes << self
	end

end
