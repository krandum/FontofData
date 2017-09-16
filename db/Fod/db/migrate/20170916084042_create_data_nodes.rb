class CreateDataNodes < ActiveRecord::Migration
  def change
    create_table :data_nodes do |t|
      t.integer :value
      t.integer :faction_id

      t.timestamps null: false
    end
  end
end
