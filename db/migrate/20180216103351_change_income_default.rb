class ChangeIncomeDefault < ActiveRecord::Migration[5.1]
  def change
		change_column_default :data_nodes, :resource_generator, 10.5
  end
end
