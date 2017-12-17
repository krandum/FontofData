class AddMultiplierToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :multiplier, :float, default: 1.0
  end
end
