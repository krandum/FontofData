class AddRankToDataNode < ActiveRecord::Migration[5.1]
  def change
    add_column :data_nodes, :rank, :integer, default: 0
  end
end
