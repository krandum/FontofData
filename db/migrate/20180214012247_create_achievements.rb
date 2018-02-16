class CreateAchievements < ActiveRecord::Migration[5.1]
  def change
    create_table :achievements do |t|
			t.string :type
			t.integer :user_id

      t.timestamps
		end

		add_index :achievements, [:type, :user_id], :unique => true
  end
end
