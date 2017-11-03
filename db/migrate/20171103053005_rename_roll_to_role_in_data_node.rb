class RenameRollToRoleInDataNode < ActiveRecord::Migration[5.1]
  def change
		rename_column :data_nodes, :roll, :role
  end
end
