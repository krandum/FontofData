class AddIdToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :id, :primary_key
  end
end
