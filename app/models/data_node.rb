class DataNode < ActiveRecord::Base
	belongs_to :faction
	belongs_to :user
	belongs_to :cluster

	has_many :interactions

	has_many :connected_nodes
	has_many :connections, through: :connected_nodes

	has_many :connected_with_nodes, foreign_key: :connection_id, class_name: 'ConnectedNode'
	has_many :connected_withs, through: :connected_with_nodes, source: :data_node

	# finds/creates a node with a given value
	def self.get_node(value)
		node = DataNode.where(value: value).first
		if node.nil?
			node = DataNode.new(value: value)
		end
		node
	end

	# finds/creates multiple values with a given array of values
	def self.get_nodes(*values)
		nodes = []
		values.each do |value|
			nodes.push(DataNode.get_node(value))
		end
		nodes
	end

	def claim_node(user)
		user.data_nodes << self
		user.faction.data_nodes << self
	end

	def update_connections
		# friendly_connections = self.connected_nodes.select { |x| x.connection.faction_id == self.faction_id }
		# other_connections = self.connected_nodes.select { |x| x.connection.faction_id != self.faction_id }

		self.connected_nodes.each { |x| x.complete if x.connection.faction_id == self.faction_id }
		self.connected_nodes.each { |x| x.push if x.connection.faction_id != self.faction_id }
	end

end
