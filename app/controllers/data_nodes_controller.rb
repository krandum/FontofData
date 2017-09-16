class DataNodesController < ApplicationController
  before_action :set_data_node, only: [:show, :edit, :update, :destroy]

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

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_data_node
      @data_node = DataNode.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def data_node_params
      params.require(:data_node).permit(:value, :faction_id)
    end
end
