class AddSvalueAndIvalueToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :s_value, :integer
    add_column :connected_nodes, :i_value, :integer
  end
end
