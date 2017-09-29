class AddUserToDataNodes < ActiveRecord::Migration[5.1]
  def change
    add_reference :data_nodes, :user, foreign_key: true
  end
end
