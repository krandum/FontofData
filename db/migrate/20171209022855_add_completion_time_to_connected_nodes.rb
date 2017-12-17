class AddCompletionTimeToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :completion_time, :datetime
  end
end
