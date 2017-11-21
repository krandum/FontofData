class ConnectedNode < ApplicationRecord
	after_create :init_values
	after_create :create_inverse, unless: :has_inverse?
	after_destroy :destroy_inverse, if: :has_inverse?

	belongs_to :data_node
	belongs_to :connection, class_name: 'DataNode'

	has_many :proved_connections
	has_many :users, through: :proved_connections

	#use to set connection values
	def update_connection(params)
		@inverse = inverse
		p params
		unless params['percentage'].nil?
			p params['percentage']
			# TODO: implement a function that can assure the total percentage doesn't exceed 100%
			self.self_percentage = params['percentage']
			@inverse.inverse_percentage = params['percentage']
		end
		unless params['friction'].nil?
			p params['friction']
			self.self_friction = params['friction']
			@inverse.inverse_friction = params['friction']
		end
		unless params['worth'].nil?
			p params['worth']
			self.self_worth = params['worth']
			@inverse.inverse_worth = params['worth']
		end
		unless params['speed'].nil?
			p params['speed']
			self.self_speed = params['speed']
			@inverse.inverse_speed = params['speed']
		end
		save
		@inverse.save
	end

	#called by automate job every second to update the percentages
	def self.tick
		# loop through all conflict connection and increment their percentages
		conflict_connections.each do |connection|
			@inverse = connection.inverse
			connection.self_percentage += connection.self_speed
			connection.inverse_percentage += connection.inverse_speed
			if connection.self_percentage + connection.inverse_percentage >= 100.0
				speed_dif = connection.self_speed - connection.inverse_speed
				if speed_dif > 0
					connection.self_percentage -= connection.self_speed - speed_dif
					connection.inverse_percentage = 100.0 - connection.self_percentage
				elsif speed_dif < 0
					connection.inverse_percentage -= connection.inverse_speed + speed_dif
					connection.self_percentage = 100.0 - connection.inverse_percentage
				else
					connection.self_percentage -= connection.self_speed
					connection.inverse_percentage -= connection.inverse_speed
				end
			end
			if connection.self_percentage >= 100.0
				connection.self_percentage = 0.0
				connection.inverse_percentage = 0.0
				connection.capture
			elsif connection.inverse_percentage >= 100.0
				connection.self_percentage = 0.0
				connection.inverse_percentage = 0.0
				connection.capture
			end
			@inverse.self_percentage += connection.inverse_percentage
			@inverse.inverse_percentage += connection.self_percentage
		end
	end

	private

	def capture
		self.connection_type = 2
		@inverse.connection_type = 2
	end

	def create_inverse
		self.class.create(inverse_options)
		self.connection_type = 1
		self.save
	end

	def init_values
		self.s_value = DataNode.find(self.data_node_id).value
		self.i_value = DataNode.find(self.connection_id).value
		self.save
	end

	def destroy_inverse
		inverses.destroy_all
	end

	def conflict_connections
		ConnectedNode.where(connection_type: 1)
	end

	def inverse
		self.class.where(inverse_options).first
	end

	def inverses
		self.class.where(inverse_options)
	end

	def has_inverse?
		self.class.exists?(inverse_options)
	end

	def inverse_options
		{ data_node_id: connection_id, connection_id: data_node_id }
	end
end
