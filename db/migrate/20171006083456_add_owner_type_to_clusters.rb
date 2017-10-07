class AddOwnerTypeToClusters < ActiveRecord::Migration[5.1]
  def change
    add_column :clusters, :owner_type, :string
  end
end
