class DataNodesController < ApplicationController
	before_action :can_access, except: [:request_nodes, :create, :update, :destroy]
	before_action :set_data_node, only: [:show, :edit, :update, :destroy]
	before_action :range_parameter, only: [:request_nodes]

	# GET /data_nodes
	# GET /data_nodes.json
	def index
		@data_nodes = DataNode.all
	end

	# GET /data_nodes/1
	# GET /data_nodes/1.json
	def show
	end

	# GET /data_nodes/new
	def new
		@data_node = DataNode.new
	end

	# GET /data_nodes/1/edit
	def edit
	end

	# POST /data_nodes
	# POST /data_nodes.json
	def create
		@data_node = DataNode.new(data_node_params)

		respond_to do |format|
			if @data_node.save
				format.html { redirect_to @data_node, notice: 'Data node was successfully created.' }
				format.json { render :show, status: :created, location: @data_node }
			else
				format.html { render :new }
				format.json { render json: @data_node.errors, status: :unprocessable_entity }
			end
		end
	end

	# PATCH/PUT /data_nodes/1
	# PATCH/PUT /data_nodes/1.json
	def update
		respond_to do |format|
			if @data_node.update(data_node_params)
				format.html { redirect_to @data_node, notice: 'Data node was successfully updated.' }
				format.json { render :show, status: :ok, location: @data_node }
			else
				format.html { render :edit }
				format.json { render json: @data_node.errors, status: :unprocessable_entity }
			end
		end
	end

	# DELETE /data_nodes/1
	# DELETE /data_nodes/1.json
	def destroy
		@data_node.destroy
		respond_to do |format|
			format.html { redirect_to data_nodes_url, notice: 'Data node was successfully destroyed.' }
			format.json { head :no_content }
		end
	end

	def request_nodes
		out = {'nodes' => {}}
		ranges = []
		personalNodes = nil
		params['ranges'].each do |key, range|
			ranges += [range[:from].to_i..range[:to].to_i]
			if ranges.last.overlaps?(1..31) && personalNodes.nil?
				personalNodes = DataNode.includes(:connections).where(value: (1..31)).where("user_id = #{current_user.id} or faction_id = 1").order(:value)
			end
		end
		unless personalNodes.nil?
			personalNodes.each do |node|
				out['nodes'][node.value] = {
					'value' => node.value,
					'faction_id' => node.faction_id,
					'owner' => node.user&.username,
					'teir' => 1,
					'worth' => 1000,
					'contention' => 0,
					'cluster_name' => node.cluster.try(:cluster_name),
					'last_captured' => node.last_change
				}
				if out['nodes'][node.value]['cluster_name'].nil?
					out['nodes'][node.value]['cluster_name'] = 'none'
				end
				out['nodes'][node.value]['dad'] = get_connection_info(node.connected_nodes.find_by(i_value: node.value >> 1))
				out['nodes'][node.value]['bro'] = get_connection_info(node.connected_nodes.find_by(i_value: node.value - 1))
			end
		end


		activeNodes = DataNode.includes(:connections).where(value: ranges).where.not(value: 1..31).order(:value)
		unless activeNodes.nil?
			activeNodes.each do |node|
				if out['nodes'][node.value].nil? && !(node.value < 32 && node.faction_id != 1)
					out['nodes'][node.value] = {
						'value' => node.value,
						'faction_id' => node.faction_id,
						'owner' => node.user&.username,
						'teir' => 1,
						'worth' => 1000,
						'contention' => 0,
						'cluster_name' => node.cluster.try(:cluster_name),
						'last_captured' => node.last_change
					}
					if out['nodes'][node.value]['cluster_name'].nil?
						out['nodes'][node.value]['cluster_name'] = 'none'
					end
					out['nodes'][node.value]['dad'] = get_connection_info(node.connected_nodes.where(i_value: node.value >> 1).first)
					out['nodes'][node.value]['bro'] = get_connection_info(node.connected_nodes.where(i_value: node.value - 1).first)
				end
			end
		end

		ranges.each do |range|
			range.each do |cur|
				if out['nodes'][cur].nil?
					out['nodes'][cur] = {
						'value' => cur,
						'faction_id' => 1,
						'owner' => 'unclaimed',
						'teir' => 1,
						'worth' => 0,
						'contention' => 0
					}
					out['nodes'][cur]['bro'] = nil
					out['nodes'][cur]['dad'] = nil
				end
			end
		end
		respond_to do |format|
			format.html { render json: out }
			format.json
		end
	end

	def request_nodes_old
		# p 'REQUEST STARTED'
		out = {'nodes' => {}}
		ranges = params['ranges']
		num = ranges.values.count
		iter = 0
		while (iter < num)
			range = ranges[iter.to_s]
			# p "RANGE #{range[:from]} TO #{range[:to]}"
			cur = range[:from].to_i
			claimedNodes = DataNode.includes(:connections).where(value: range[:from].to_i..range[:to].to_i).order(:value)
			# p 'NODES GRABBED'
			i = 0
			i_max = claimedNodes.count
			while cur <= range[:to].to_i
				if i < i_max && cur == claimedNodes[i].value
					# p "NODE VALUE #{cur}"
					out['nodes'][cur] = {
						'value' => cur,
						'faction_id' => claimedNodes[i].faction_id,
						'owner' => claimedNodes[i].user&.username,
						'teir' => 1,
						'worth' => 1000,
						'contention' => 0,
						'cluster_name' => claimedNodes[i].cluster.try(:cluster_name),
						'last_captured' => claimedNodes[i].last_change
					}
					if out['nodes'][cur]['cluster_name'].nil?
						out['nodes'][cur]['cluster_name'] = 'none'
					end
					# out['nodes'][cur]['bro'] = claimedNodes[i].connections.select{|x| x.value == cur - 1}.first.try(:value)
					# out['nodes'][cur]['dad'] = claimedNodes[i].connections.select{|x| x.value == cur >> 1}.first.try(:value)

					out['nodes'][cur]['dad'] = get_connection_info(claimedNodes[i].connected_nodes.where(i_value: cur >> 1).first)
					out['nodes'][cur]['bro'] = get_connection_info(claimedNodes[i].connected_nodes.where(i_value: cur - 1).first)
					# out['nodes'][cur]['dad'] = {
					# 	'value' => claimedNodes[i].connections.select{ |x| x.value == cur >> 1 }.first.try(:value),
					# 	'completions' => []
					# }
					# out['nodes'][cur]['dad'] = {
					# 	'value' => claimedNodes[i].connections.select{ |x| x.value == cur - 1 }.first.try(:value),
					#   'completions' => []
					# }
					i += 1
				else
					out['nodes'][cur] = {
						'value' => cur,
						'faction_id' => 1,
						'owner' => 'unclaimed',
						'teir' => 1,
						'worth' => 0,
						'contention' => 0
					}
					out['nodes'][cur]['bro'] = nil
					out['nodes'][cur]['dad'] = nil
				end
				cur += 1
			end
			iter += 1
		end
		# p 'REQUEST FINISHED'
		respond_to do |format|
			format.html { render json: out }
			format.json
		end
	end

	private
	# Use callbacks to share common setup or constraints between actions.

	def get_connection_info(connection)
		if !connection.nil?
			if connection.connection.value <= 31 && connection.connection.user_id != current_user.id &&
				connection.connection.faction_id != 1
				nil
			else
				{
					'value' => connection.connection.value,
					'last_updated' => connection.last_speed_change.to_i * 1000,
					'completions' => [{
						'percentage' => connection.self_percentage,
						'faction_id' => connection.data_node.faction_id,
						'speed' => connection.self_speed
						}, {
						'percentage' => connection.inverse_percentage,
						'faction_id' => connection.connection.faction_id,
						'speed' => connection.inverse_speed
					}],
				}
			end
		else
			nil
		end
	end

	def set_data_node
		@data_node = DataNode.find(params[:id])
	end

	def range_parameter
		params.require(:ranges).permit!
	end

	# Never trust parameters from the scary internet, only allow the white list through.
	def data_node_params
		params.require(:data_node).permit(:value, :faction_id)
	end

	def can_access
		unless current_user.try(:admin?)
			flash[:notice] = "You are not authorized."
			redirect_to root_path
		end
	end

end
