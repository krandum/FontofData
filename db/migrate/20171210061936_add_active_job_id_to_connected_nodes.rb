class AddActiveJobIdToConnectedNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :connected_nodes, :active_job_id, :string
  end
end
