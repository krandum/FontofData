class ConnectionWorker
  include Sidekiq::Worker

	def perform(connection_id, user_id)
		# Do something later
		connection = ConnectedNode.find(connection_id)
		connection.capture(user_id)
		ActionCable.server.broadcast "game",
			function_call: 'connection_finished',
			# origin: connection.s_value,
			target: connection.i_value,
			origin_fac: connection.data_node.faction_id
			# target_fac: connection.connection.faction_id,
			# origin_change: 'same',
			# target_change: 'to_origin'
	end
end
