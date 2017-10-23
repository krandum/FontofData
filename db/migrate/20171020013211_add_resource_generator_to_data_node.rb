class AddResourceGeneratorToDataNode < ActiveRecord::Migration[5.1]
  def change
    add_column :data_nodes, :resource_generator, :decimal, default: 0.7
  end
end
