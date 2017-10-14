class CreateClusters < ActiveRecord::Migration[5.1]
  def change
    create_table :clusters do |t|
      t.integer :owner_id
	  t.string :owner_type
    end
  end
end
