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

	def update_node_test(data)
		if  data['action_index'] == 1
			status, origin, target = take_action(data['origin'], data['target'], 1)
		if  data['action_index'] == 2
			status, origin, target = take_action(data['origin'], data['target'], 4)

		if status == 'success'
			current_user.interactions.create!(effect_id: data['action_index'], origin_node_id: @origin.id, target_node_id: @target.id)
			ActionCable.server.broadcast "game",
				action_index: data['action_index'],
				origin: data['origin'],
				target: data['target'],
				origin_fac: @origin.faction_id,
				target_fac: @target.faction_id,
				origin_change: origin,
				target_change: target
			else
				# code to handle invalid selections should go here
				p status
			end
	end

private

	def take_action(origin_value, target_value, effect_id)
		@origin = DataNode.where(value: origin_value).first
		if @origin.nil?
			@origin = DataNode.new(value: origin_value, faction_id: 1)
		end
		@target = DataNode.where(value: target_value).first
		if @target.nil?
			@target = DataNode.new(value: target_value, faction_id: 1)
		end
		effect = Effect.find(effect_id)

		status = 'not_valid'
		origin_status = 'same'
		target_status = 'same'

		if valid?(@origin, @target, effect)
			case effect.effect_name
			when 'attack'
				if nodes_adjacent?(origin_value, target_value)
					if !@origin.connections.where(value: target_value).empty?
						if @target.id.nil?
							@target = current_user.data_nodes.create!(
								value: target_value,
								faction_id: @origin.faction_id
							)
						else
							@target.update_attribute(:faction_id, @origin.faction_id)
							@target.update_attribute(:user_id, @origin.user_id)
						end
						status = 'success'
						target_status = 'to_origin'
					else
						status = 'not_connected'
					end
				else
					status = 'not_adjacent'
				end
			when 'connect'
				if nodes_adjacent?(origin_value, target_value)
					if @target.id.nil?
						@target.save
					end
					if @origin.id.nil?
						@origin.save
					end
					begin
						@origin.connections << @target
						@target.connections << @origin
						status = 'success'
					rescue ActiveRecord::RecordNotUnique
						status = 'connection_exists'
					end
				else
					status = 'not_adjacent'
				end
			when 'give'
				@origin.update_attribute(:faction_id, 1)
				status = 'success'
				origin_status = 'netrual'
				target_status = 'self'
			when 'swap'
				tmp_ori_id = 1
				tmp_targ_id = 1
				unless @origin.id.nil?
					tmp_ori_id = @origin.id
				end
				unless @target.id.nil?
					tmp_targ_id = @target.id
				end
				if !@origin.id.nil?
					@origin.update_attribute(:faction_id, tmp_targ_id)
				elsif !@target.id.nil?
					@origin = DataNode.create!(value: origin_value, faction_id: @target.faction_id)
				end
				if !@target.id.nil?
					@target.update_attribute(:faction_id, tmp_ori_id)
				elsif !@origin.id.nil?
					@target = DataNode.create!(value: origin_value, faction_id: @origin.faction_id)
				end
				status = 'success'
				origin_status = 'to_target'
				target_status = 'to_origin'
			else
				status = 'invalid_action'
			end
		end
		[status, origin_status, target_status]
	end

	def get_masks(effect)
		base = effect.clearence_value
		o = (base - (base % 10000)) / 10000	#origin_faction
		ta = ((base % 10000) - (base % 1000)) / 1000 #target_faction
		ow = ((base % 1000) - (base % 100)) / 100 #owner_user
		re = ((base % 100) - (base % 10)) / 10 #reciver_user
		ra = base % 10 #owner_rank
		[o, ta, ow, re, ra]
	end

	def valid?(origin, target, effect)
		@user = current_user
		unless origin.nil?
			if origin.faction_id == @user.faction_id
				origin_faction = 2
			elsif origin.faction_id == 1
				origin_faction = 1
			else
				origin_faction = 4
			end
		else
			origin_faction = 4
		end
		unless target.nil?
			if target.faction_id == @user.faction_id
				target_faction = 2
			elsif target.faction_id == 1
				target_faction = 1
			else
				target_faction = 4
			end
		else
			target_faction = 4
		end
		origin_faction_mask, target_faction_mask, owner_user, target_user, owner_user_rank = get_masks(effect)
		# p ["User faction", @user.faction_id]
		# p ["ori_fact, targ_fact", origin.faction_id, target.faction_id]
		# p ["mask, value", origin_faction_mask, origin_faction]
		# p ["mask, value", target_faction_mask, target_faction]

		# could also do mask & input != 0 instead of mask | input == mask
		if (origin_faction_mask == 0 || (origin_faction_mask |
			origin_faction == origin_faction_mask)) && (target_faction_mask == 0 ||
				(target_faction_mask | target_faction == target_faction_mask))
			true
		else
			false
		end
	end

	def nodes_adjacent?(origin, target)
		if (target == origin - 1 || target == origin + 1	||
				target == origin << 1 || target == origin << 1 | 1 ||
				target == origin >> 1)
			true
		else
			false
		end
	end

end
