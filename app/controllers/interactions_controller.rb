class InteractionsController < ApplicationController
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

	def take_action
		valid = check_valid(params)
		if valid == 0
			origin = DataNode.where(value: params['origin']).first
			target = DataNode.where(value: params['target']).first
			effect = Effect.find(params['effect'])
			case effect.faction_name
			when 'attack'
				target.faction_id = origin.faction_id
				out = {'status' => 'success',
					'origin' => 'same',
					'target' => 'to_origin'
				}
			when 'give'
				origin.faction_id = 1
				out = {'status' => 'success',
					'origin' => 'neutral',
					'target' => 'same'
				}
			when 'swap'
				tmp_o = 1
				unless origin.nil? || origin == 0
					tmp_o = origin.faction_id
				end
				tmp_t = 1
				unless target.nil? || target == 0
					tmp_t = target.faction_id
				end
				if !(origin.nil?) && origin != 0
					origin.faction_id = tmp_o
				end
				if !(target.nil?) && target != 0
					target.faction_id = tmp_t
				end
				out = {'status' => 'success',
					'origin' => 'to_target',
					'target' => 'to_origin'
				}
			else
				out = { 'status' => 'failure_effect',
					'origin' => 'same',
					'target' => 'same'
				}
			end
		else
			out = { 'status' => 'failure_global' << valid,
				'origin' => 'same',
				'target' => 'same'
			}
		end
		respond_to do |format|
			format.html { render json: out }
			format.json
		end
	end

	private
	# Use callbacks to share common setup or constraints between actions.
	def set_interaction
		@interaction = Interaction.find(params[:id])
	end

	# Never trust parameters from the scary internet, only allow the white list through.
	def interaction_params
		params.require(:interaction).permit(:user_id, :effect_id, :origin_node_id, :target_node_id)
	end

	def get_masks(effect)
		base = effect.clearence_value
		o = (base - (base % 10000)) / 10000
		ta = ((base % 10000) - (base % 1000)) / 1000
		ow = ((base % 1000) - (base % 100)) / 100
		re = ((base % 100) - (base % 10)) / 10
		ra = base % 10
		[o, ta, ow, re, ra]
	end

	def check_valid(args)
		@user = User.find(current_user.id)
		effect = Effect.find(args['effect'])
		origin = DataNode.where(value: args['origin']).first
		if effect.nil? || effect == 0 || @user.nil?
			return 1
		end
		if origin.nil? || origin == 0 || origin.faction_id.nil? || origin.faction_id == 0
			o_val = 4
		elsif origin.faction_id == @user.faction_id
			o_val = 2
		elsif origin == 4
			o_val = 1
		else
			o_val = 4
		end
		target = DataNode.where(value: args['target']).first
		if target.nil? || target == 0 || target.faction_id.nil? || target.faction_id == 0
			t_val = 4
		elsif target.faction_id == @user.faction_id
			t_val = 2
		elsif origin == 4
			t_val = 1
		else
			t_val = 4
		end
		# Owner and target not implemented for MVP, Admin still TODO
		or_m, ta_m, ow_m, re_m, ra_m = get_masks(effect)
		if (or_m != 0 && o_val & or_m == 0) || (ta_m != 0 && t_val & ta_m == 0)
			return 2
		end
		0
	end
end
