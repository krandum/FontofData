class CreateJoinTableProvedConnections < ActiveRecord::Migration[5.1]
  def change
    create_join_table :Users, :ConnectedNodes do |t|
      # t.index [:user_id, :connected_node_id]
      # t.index [:connected_node_id, :user_id]
    end
  end
end
