class ChangeIncomeDefault2 < ActiveRecord::Migration[5.1]
  def change
		change_column_default :data_nodes, :resource_generator, 21.0
  end
end
