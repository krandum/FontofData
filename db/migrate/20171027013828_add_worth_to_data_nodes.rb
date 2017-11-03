class AddWorthToDataNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :data_nodes, :worth, :integer, default: 0
  end
end
