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
						'connection_num' => 0, #claimedNodes[i].connections.count,
						'worth' => 1000,
						'contention' => 0
					}
					out['nodes'][cur]['bro'] = claimedNodes[i].connections.select{|x| x.value == cur - 1}.first.try(:value)
					out['nodes'][cur]['dad'] = claimedNodes[i].connections.select{|x| x.value == cur >> 1}.first.try(:value)
					# out['nodes'][cur]['bro'] = claimedNodes[i].connections.where(value: cur - 1).first.try(:value)
					# out['nodes'][cur]['dad'] = claimedNodes[i].connections.where(value: cur >> 1).first.try(:value)
					i += 1
				else
					out['nodes'][cur] = {
						'value' => cur,
						'faction_id' => 1,
						'owner' => 'unclaimed',
						'teir' => 1,
						'connection_num' => 0,
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
