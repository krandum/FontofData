class InteractionsController < ApplicationController
	# before_action :can_access, except: [:take_action, :create, :update, :destroy]
	before_action :set_interaction, only: [:show, :edit, :update, :destroy]

	# GET /interactions
	# GET /interactions.json
	def index
		@interactions = Interaction.all
	end

	# GET /interactions/1
	# GET /interactions/1.json
	def show
	end

	# GET /interactions/new
	def new
		@interaction = Interaction.new
	end

	# GET /interactions/1/edit
	def edit
	end

	# POST /interactions
	# POST /interactions.json
	def create
		@interaction = Interaction.new(interaction_params)

		respond_to do |format|
			if @interaction.save
				format.html { redirect_to @interaction, notice: 'Interaction was successfully created.' }
				format.json { render :show, status: :created, location: @interaction }
			else
				format.html { render :new }
				format.json { render json: @interaction.errors, status: :unprocessable_entity }
			end
		end
	end

	# PATCH/PUT /interactions/1
	# PATCH/PUT /interactions/1.json
	def update
		respond_to do |format|
			if @interaction.update(interaction_params)
				format.html { redirect_to @interaction, notice: 'Interaction was successfully updated.' }
				format.json { render :show, status: :ok, location: @interaction }
			else
				format.html { render :edit }
				format.json { render json: @interaction.errors, status: :unprocessable_entity }
			end
		end
	end

	# DELETE /interactions/1
	# DELETE /interactions/1.json
	def destroy
		@interaction.destroy
		respond_to do |format|
			format.html { redirect_to interactions_url, notice: 'Interaction was successfully destroyed.' }
			format.json { head :no_content }
		end
	end

	# def take_action
	# 	@origin = DataNode.where(value: params['origin']).first
	# 	if @origin.nil?
	# 		@origin = DataNode.new(value: params['origin'], faction_id: 1)
	# 	end
	# 	@target = DataNode.where(value: params['target']).first
	# 	if @target.nil?
	# 		@target = DataNode.new(value: params['target'], faction_id: 1)
	# 	end
	# 	@effect = Effect.find(params['effect'])
	# 	out = {
	# 		'status' => nil,
	# 		'origin' => 'same',
	# 		'target' => 'same'
	# 	}
	# 	unless !valid?(@origin, @target, @effect)
	# 		case @effect.effect_name
	# 		when 'attack'
	# 			if nodes_adjacent?(params['origin'].to_i, params['target'].to_i)
	# 				if !@origin.connections.where(value: params['target']).empty?
	# 					unless @target.id.nil?
	# 						@target.update_attribute(:faction_id, @origin.faction_id)
	# 						@target.update_attribute(:user_id, @origin.user_id)
	# 					else
	# 						@target = current_user.data_nodes.build(value: params['target'], faction_id: @origin.faction_id)
	# 						@target.save
	# 					end
	# 					out['status'] = 'success'
	# 					out['target'] = 'to_origin'
	# 				else
	# 					out['status'] = 'not_connected'
	# 				end
	# 			else
	# 				out['status'] = 'not_adjacent'
	# 			end
	# 		when 'connect'
	# 			if nodes_adjacent?(params['origin'].to_i, params['target'].to_i)
	# 				if @target.id.nil?
	# 					@target.save
	# 				end
	# 				if @origin.id.nil?
	# 					@origin.save
	# 				end
	# 				begin
	# 					@origin.connections << @target
	# 					@target.connections << @origin
	# 					out['status'] = 'success'
	# 				rescue ActiveRecord::RecordNotUnique
	# 					out['status'] = 'connection_exists'
	# 				end
	# 			else
	# 				out['status'] = 'not_adjacent'
	# 			end
	# 		when 'give'
	# 			@origin.update_attribute(:faction_id, 1)
	# 			out['status'] = 'success'
	# 			out['origin'] = 'netrual'
	# 			out['target'] = 'self'
	# 		when 'swap'
	# 			tmp_ori_id = 1
	# 			tmp_targ_id = 1
	# 			unless @origin.id.nil?
	# 				tmp_ori_id = @origin.id
	# 			end
	# 			unless @target.id.nil?
	# 				tmp_targ_id = @target.id
	# 			end
	# 			if !@origin.id.nil?
	# 				@origin.update_attribute(:faction_id, tmp_targ_id)
	# 			elsif !@target.id.nil?
	# 				@origin = DataNode.create!(value: params['origin'], faction_id: @target.faction_id)
	# 			end
	# 			if !@target.id.nil?
	# 				@target.update_attribute(:faction_id, tmp_ori_id)
	# 			elsif !@origin.id.nil?
	# 				@target = DataNode.create!(value: params['origin'], faction_id: @origin.faction_id)
	# 			end
	# 			out['status'] = 'success'
	# 			out['origin'] = 'to_target'
	# 			out['target'] = 'to_origin'
	# 		else
	# 			out['status'] = 'invalid_action'
	# 		end
	# 	else
	# 		out['status'] = 'not_valid'
	# 	end
	# 	p @origin
	# 	p @target
	# 	respond_to do |format|
	# 		format.html { render json: out }
	# 		format.json
	# 	end
	# end

	private
	# Use callbacks to share common setup or constraints between actions.
	def set_interaction
		@interaction = Interaction.find(params[:id])
	end

	# Never trust parameters from the scary internet, only allow the white list through.
	def interaction_params
		params.require(:interaction).permit(:user_id, :effect_id, :origin_node_id, :target_node_id)
	end

	# def get_masks(effect)
	# 	base = effect.clearence_value
	# 	o = (base - (base % 10000)) / 10000	#origin_faction
	# 	ta = ((base % 10000) - (base % 1000)) / 1000 #target_faction
	# 	ow = ((base % 1000) - (base % 100)) / 100 #owner_user
	# 	re = ((base % 100) - (base % 10)) / 10 #reciver_user
	# 	ra = base % 10 #owner_rank
	# 	[o, ta, ow, re, ra]
	# end

# 0 - any
# 1 - netrual
# 2 - self
# 4 - enemy

	# def nodes_adjacent?(origin, target)
	# 	if (target == origin - 1 || target == origin + 1	||
	# 			target == origin << 1 || target == origin << 1 | 1 || target == origin >> 1)
	# 		true
	# 	else
	# 		false
	# 	end
	# end
	#
	# def valid?(origin, target, effect)
	# 	@user = User.find(current_user.id)
	# 	unless origin.nil?
	# 		if origin.faction_id == @user.faction_id
	# 			origin_faction = 2
	# 		elsif origin.faction_id == 1
	# 			origin_faction = 1
	# 		else
	# 			origin_faction = 4
	# 		end
	# 	else
	# 		origin_faction = 4
	# 	end
	# 	unless target.nil?
	# 		if target.faction_id == @user.faction_id
	# 			target_faction = 2
	# 		elsif target.faction_id == 1
	# 			target_faction = 1
	# 		else
	# 			target_faction = 4
	# 		end
	# 	else
	# 		target_faction = 4
	# 	end
	# 	origin_faction_mask, target_faction_mask, owner_user, target_user, owner_user_rank = get_masks(effect)
	# 	p ["User faction", @user.faction_id]
	# 	p ["ori_fact, targ_fact", origin.faction_id, target.faction_id]
	# 	p ["mask, value", origin_faction_mask, origin_faction]
	# 	p ["mask, value", target_faction_mask, target_faction]
	#
	# 	# could also do mask & input != 0 instead of mask | input == mask
	# 	if (origin_faction_mask == 0 || (origin_faction_mask |
	# 		origin_faction == origin_faction_mask)) && (target_faction_mask == 0 ||
	# 			(target_faction_mask | target_faction == target_faction_mask))
	# 		true
	# 	else
	# 		false
	# 	end
	# # 	@user = User.find(current_user.id)
	# # 	@effect = Effect.find(args['effect'])
	# # 	origin = DataNode.where(value: args['origin']).first
	# # 	if @effect.nil? || @effect == 0 || @user.nil?
	# # 		return 1
	# # 	end
	# # 	if origin.nil? || origin == 0 || origin.faction_id.nil? || origin.faction_id == 0
	# # 		o_val = 4
	# # 	elsif origin.faction_id == @user.faction_id
	# # 		o_val = 2
	# # 	elsif origin == 4
	# # 		o_val = 1
	# # 	else
	# # 		o_val = 4
	# # 	end
	# # 	target = DataNode.where(value: args['target']).first
	# # 	if target.nil? || target == 0 || target.faction_id.nil? || target.faction_id == 0
	# # 		t_val = 4
	# # 	elsif target.faction_id == @user.faction_id
	# # 		t_val = 2
	# # 	elsif origin == 4
	# # 		t_val = 1
	# # 	else
	# # 		t_val = 4
	# # 	end
	# #
	# # 	if (target.value == origin.value - 1 || target.value == origin.value + 1	||
	# # 				 target.value == origin.value << 1 || target.value == origin.value << 1 | 1)
	# # 		adjacent = true
	# # 	else
	# # 		adjacent = false
	# # 	end
	# #
	# # 	if @effect.effect_name == "attack" && !adjacent
	# # 		return 0
	# #
	# # 	# Owner and target not implemented for MVP, Admin still TODO
	# # 	or_m, ta_m, ow_m, re_m, ra_m = get_masks(@effect)
	# # 	if (or_m != 0 && o_val & or_m == 0) || (ta_m != 0 && t_val & ta_m == 0)
	# # 		return 2
	# # 	end
	# # 	return 0
	# # end
	# #
	# # def can_access
	# # 	unless current_user.try(:admin?)
	# # 		flash[:notice] = "You are not authorized."
	# # 		redirect_to root_path
	# # 	end
	# end

end
