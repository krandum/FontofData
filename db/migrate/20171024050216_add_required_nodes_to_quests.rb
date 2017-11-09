class AddRequiredNodesToQuests < ActiveRecord::Migration[5.1]
  def change
    add_column :quests, :required_nodes, :integer, array: true, default: []
  end
end
