class CreateDataNodes < ActiveRecord::Migration[5.1]
  def change
    create_table :data_nodes do |t|
      t.integer :value
      t.integer :roll
      t.belongs_to :user, foreign_key: true
	  t.boolean :cluster_core, default: false
    end
  end
end
