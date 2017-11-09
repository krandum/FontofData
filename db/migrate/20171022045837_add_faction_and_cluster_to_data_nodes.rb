class AddFactionAndClusterToDataNodes < ActiveRecord::Migration[5.1]
  def change
    add_reference :data_nodes, :faction, foreign_key: true
    add_reference :data_nodes, :cluster, foreign_key: true
  end
end
