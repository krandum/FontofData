class DataNode < ActiveRecord::Base
	after_create :stress
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
			node = DataNode.new(value: value, )
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

	def claim_node(user_id)
		previous_user = self.user
		new_user = User.find_by(id: user_id)
		unless previous_user.nil?
			previous_user.receive_resources
			previous_user.gold_per_min -= self.resource_generator
			previous_user.save
		end
		unless new_user.nil?
			new_user.receive_resources
			new_user.data_nodes << self
			new_user.faction.data_nodes << self
			new_user.gold_per_min += self.resource_generator
			new_user.save
		end
	end

	def capture_node(user_id)
		previous_user = self.user
		new_user = User.find_by(id: user_id)
		unless previous_user.nil?
			previous_user.receive_resources
			previous_user.gold_per_min -= self.resource_generator
			previous_user.save
			ActionCable.server.broadcast "user#{previous_user.id}",
				function_call: 'update_income',
				new_income: previous_user.gold_per_min
		end

		unless new_user.nil?
			new_user.receive_resources
			new_user.data_nodes << self
			new_user.faction.data_nodes << self
			new_user.gold_per_min += self.resource_generator
			new_user.save
			ActionCable.server.broadcast "user#{new_user.id}",
				function_call: 'update_income',
				new_income: new_user.gold_per_min
		end
	end

	def update_connections(user_id)
		# friendly_connections = self.connected_nodes.select { |x| x.connection.faction_id == self.faction_id }
		# other_connections = self.connected_nodes.select { |x| x.connection.faction_id != self.faction_id }

		self.connected_nodes.each { |x| x.complete if x.connection.faction_id == self.faction_id }
		self.connected_nodes.each { |x| x.push(user_id) if x.connection.faction_id != self.faction_id }
	end

	private

	def stress
		# p "stress crate"
		# unless self.role == 99
		# 	1000.times do
		# 		DataNode.create(value: self.value * 100000000, role: 99)
		# 	end
		# end
	end

end
