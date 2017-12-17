class AddClusterNameToCluster < ActiveRecord::Migration[5.1]
  def change
    add_column :clusters, :cluster_name, :string
  end
end
