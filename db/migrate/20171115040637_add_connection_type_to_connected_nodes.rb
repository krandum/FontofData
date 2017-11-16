class AddConnectionTypeToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :connection_type, :integer, default: 0
  end
end
