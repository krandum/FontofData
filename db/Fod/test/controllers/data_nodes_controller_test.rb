require 'test_helper'

class DataNodesControllerTest < ActionController::TestCase
  setup do
    @data_node = data_nodes(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:data_nodes)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create data_node" do
    assert_difference('DataNode.count') do
      post :create, data_node: { faction_id: @data_node.faction_id, value: @data_node.value }
    end

    assert_redirected_to data_node_path(assigns(:data_node))
  end

  test "should show data_node" do
    get :show, id: @data_node
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @data_node
    assert_response :success
  end

  test "should update data_node" do
    patch :update, id: @data_node, data_node: { faction_id: @data_node.faction_id, value: @data_node.value }
    assert_redirected_to data_node_path(assigns(:data_node))
  end

  test "should destroy data_node" do
    assert_difference('DataNode.count', -1) do
      delete :destroy, id: @data_node
    end

    assert_redirected_to data_nodes_path
  end
end
