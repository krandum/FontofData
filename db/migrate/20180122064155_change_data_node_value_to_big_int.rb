class ChangeDataNodeValueToBigInt < ActiveRecord::Migration[5.1]
  def change
		change_column :data_nodes, :value, :bigint, default: 10000.0
  end
end
