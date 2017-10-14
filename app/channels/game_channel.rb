class GameChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
		stream_from "game"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

	def update_node(data)
		ActionCable.server.broadcast "game",
			action_index: data['action_index'],
			origin: data['origin'],
			target: data['target'],
			origin_fac: data['origin_fac'],
			target_fac: data['target_fac'],
			origin_change: data['origin_change'],
			target_change: data['target_change']
	end
end
