class FixLastMigration < ActiveRecord::Migration[5.1]
  def change
		change_column_default(:data_nodes, :value, nil)
		change_column :connected_nodes, :s_value, :bigint
		change_column :connected_nodes, :i_value, :bigint
		change_column :path_data, :val_a, :bigint
		change_column :path_data, :val_b, :bigint
  end
end
