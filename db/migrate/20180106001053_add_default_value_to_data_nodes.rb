class AddDefaultValueToDataNodes < ActiveRecord::Migration[5.1]
  def change
		change_column_default :data_nodes, :role, 0
		change_column_default :data_nodes, :faction_id, 1
  end
end
