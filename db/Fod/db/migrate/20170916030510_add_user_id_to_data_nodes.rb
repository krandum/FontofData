class AddUserIdToDataNodes < ActiveRecord::Migration
  def change
    add_column :data_nodes, :user_id, :integer
  end
end
