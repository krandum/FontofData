class AddTimestampsToDataNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :data_nodes, :last_change, :datetime
  end
end
