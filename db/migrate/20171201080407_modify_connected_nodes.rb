class ModifyConnectedNodes < ActiveRecord::Migration[5.1]
  def change
		add_column :connected_nodes, :last_speed_change, :datetime
  end
end
