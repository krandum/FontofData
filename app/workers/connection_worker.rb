class ConnectionWorker
  include Sidekiq::Worker

	def perform(connection_id, user_id)
		# Do something later
		user = User.find(user_id)
		connection = ConnectedNode.find(connection_id)
		connection.complete
		# connection.capture(user_id)
		if connection.s_value > 15 && connection.i_value > 15
			ActionCable.server.broadcast "game",
				function_call: 'connection_finished',
				owener: User.find_by(id: user_id).username,
				origin: connection.s_value,
				target: connection.i_value,
				origin_fac: connection.data_node.faction_id,
				captured: connection.capture(user_id)
		else
			ActionCable.server.broadcast "user#{user_id}",
				function_call: 'connection_finished',
				owener: User.find_by(id: user_id).username,
				origin: connection.s_value,
				target: connection.i_value,
				origin_fac: connection.data_node.faction_id,
				captured: connection.capture(user_id)
			# if user.tutorial_flag != 5 and user.completed_tut?
			# 	# user.tutorial_flag = 1
			# 	# user.save
			# 	TutorialComplete.check_condition(user)
			# end
		end
	end
end
