class CreateJoinTableConnectedNode < ActiveRecord::Migration[5.1]
  def change
    create_join_table :data_nodes, :connections, table_name: :connected_nodes do |t|
      t.index [:data_node_id, :connection_id], unique: true
      # t.index [:connection_id, :data_node_id]
    end
  end
end
