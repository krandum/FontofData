class ConnectedNode < ApplicationRecord
	after_create :init_values
	after_create :create_inverse, unless: :has_inverse?
	after_destroy :destroy_inverse, if: :has_inverse?

	cattr_accessor :current_user

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
		create_job
		save
		@inverse.save
	end

	def completion_time
		if self.self_speed > 0.0 || self.inverse_speed > 0.0
			est_time = Time.now
			speed_diff = (self.self_speed - self.inverse_speed).abs
			percent_a = self.self_percentage
			percent_b = self.inverse_percentage

			while percent_a + percent_b < 100.0 do
				percent_a += self.self_speed
				percent_b += self.inverse_speed
				est_time += 1.second
			end

			if percent_a + percent_b > 100.0
				percent_diff = (percent_a - percent_b).abs
				if self.self_speed < self.inverse_speed
					percent_a -= percent_diff
				elsif self.self_speed > self.inverse_speed
					percent_b -= percent_diff
				else
					percent_diff /= 2.0
					percent_a -= percent_diff
					percent_b -= percent_diff
				end
			end

			if self.self_speed > self.inverse_speed
				while percent_a < 100.0 do
					percent_a += speed_diff
					est_time += 1.second
				end
			elsif self.self_speed < self.inverse_speed
				while percent_b < 100.0 do
					percent_b += speed_diff
					est_time += 1.second
				end
			else #speed is equal and connection will never complete
				est_time = nil
			end
		else
			est_time = nil
		end
		est_time
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

	def self.check_completed
		connections = ConnectedNode.where(connection_type: 1)
		time = Time.now
		connections.each do |connection|
			if connection.completion_time <= time
				connection.capture
			end
		end
	end

	def invest(worth)
		@inverse = inverse
		update_percentages
		self.attributes = {
			self_worth: self_worth + worth,
			last_speed_change: Time.now
		}
		self.self_speed = calc_speed(self.self_worth, self.multiplier)
		@inverse.attributes = {
			inverse_worth: self.self_worth,
			inverse_speed: self.self_speed,
			last_speed_change: self.last_speed_change
		}
		create_job
	end

	def complete
		@inverse = inverse
		self.attributes = {
			connection_type: 2,
			self_percentage: 100.0,
			inverse_percentage: 100.0,
			self_speed: 0.0,
			inverse_speed: 0.0,
			self_worth: 0
		}
		@inverse.attributes = {
			connection_type: 2,
			self_percentage: 100.0,
			inverse_percentage: 100.0,
			self_speed: 0.0,
			inverse_speed: 0.0,
			inverse_worth: 0
		}
		remove_job
	end

	def push
		@inverse = inverse
		self.update_attributes(
			connection_type: 1,
			self_percentage: 0.0,
			inverse_percentage: 0.0,
			self_speed: calc_speed(self.self_worth, self.multiplier),
			inverse_speed: calc_speed(@inverse.self_worth, @inverse.multiplier)
		)
		@inverse.update_attributes(
			connection_type: 0,
			self_percentage: 0.0,
			inverse_percentage: 0.0,
			self_speed: self.inverse_speed,
			inverse_speed: self.self_speed
		)
		create_job
	end

	def capture(user_id)
		user = User.find(user_id)
		self.complete
		captured_node = self.connection
		captured_node.update_attributes(
			faction_id: user.faction_id,
			user_id: user.id,
			cluster_id: self.data_node.cluster_id,
			last_change: Time.now
		)
		captured_node.update_connections
	end

	private

	def update_percentages
		s_percent = self.self_percentage
		i_percent = @inverse.self_percentage
		total_speed = self.self_speed + @inverse.self_speed
		ticks = (Time.now - self.last_speed_change) / 1.second
		if s_percent + i_percent < 100
			ticks_till_100 = (100.0 - (s_percent + i_percent)) / total_speed
			if ticks <= ticks_till_100
				s_percent += self.self_speed * ticks
				i_percent += @inverse.self_speed * ticks
				ticks = 0
			else
				s_percent += self.self_speed * ticks_till_100
				i_percent += @inverse.self_speed * ticks_till_100
				ticks -= ticks_till_100
			end
		end
		if ticks > 0
			s_percent += (self.self_speed - @inverse.self_speed) * ticks
			i_percent += (@inverse.self_speed - self.self_speed) * ticks
		end
		self.attributes = {
			self_percentage: s_percent,
			inverse_percentage: i_percent
		}
		@inverse.attributes = {
			self_percentage: s_percent,
			inverse_percentage: i_percent
		}
	end

	def calc_speed(worth, multiplier)
		worth * 0.0001 * multiplier
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

	def save_connection
		self.save
		@inverse.save
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

	def create_job
		time = self.completion_time
		id = self.self_speed > self.inverse_speed ? self.id : @inverse.id
		unless time.nil?
			if self.active_job_id.nil?
				create_job_new(time, id)
			else
				job = Sidekiq::ScheduledSet.new.find_job(self.active_job_id)
				if job.nil?
					create_job_new(time, id)
				else
					job.reschedule(time)
				end
			end
		end
		save_connection
	end

	def create_job_new(time, connection_id)
		self.active_job_id = ConnectionWorker.perform_at(time, connection_id, current_user.id)
		@inverse.active_job_id = self.active_job_id
	end

	def remove_job
		job = Sidekiq::ScheduledSet.new.find_job(self.active_job_id)
		unless job.nil?
			job.delete
		end
		self.update_attributes(active_job_id: nil)
		@inverse.update_attributes(active_job_id: nil)
	end
end
