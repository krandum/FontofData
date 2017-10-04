class CreateJoinTableClusterMembership < ActiveRecord::Migration[5.1]
  def change
	  create_table :cluster_membership, :id => false do |t|
		  t.integer :cluster_id
		  t.integer :user_id
	  end
  end
end
