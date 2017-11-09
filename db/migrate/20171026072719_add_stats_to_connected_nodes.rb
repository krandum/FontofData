class AddStatsToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :self_percentage, :decimal, default: 0.0
    add_column :connected_nodes, :inverse_percentage, :decimal, default: 0.0
    add_column :connected_nodes, :self_friction, :float, default: 0.001
    add_column :connected_nodes, :inverse_friction, :float, default: 0.001
    add_column :connected_nodes, :self_worth, :integer, default: 0
    add_column :connected_nodes, :inverse_worth, :integer, default: 0
    add_column :connected_nodes, :self_speed, :float, default: 0.0
    add_column :connected_nodes, :inverse_speed, :float, default: 0.0
  end
end
