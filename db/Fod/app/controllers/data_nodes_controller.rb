class DataNodesController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :get_data_node, only: [:show, :edit, :update, :destroy]

  def index
    @data_nodes = DataNode.all
  end

  def show
  end

  def new
    @data_node = current_user.data_nodes.build(faction: current_user.faction, ownder: current_user.id)
    @data_node.save
    redirect_to root_path
  end

  def edit
  end

  def create
    @data_node = current_user.data_nodes.build(faction: 1, ownder: current_user.id)
    if @data_node.save
      redirect_to root_path
    else
      render 'index'
    end
  end

  def update
  end

  def destroy
  end

  private

  def get_data_node
    @data_node = DataNode.find(params[:id])
  end

  def data_node_params
    params.require(:data_node).permit(:faction, :owner)
  end
end
