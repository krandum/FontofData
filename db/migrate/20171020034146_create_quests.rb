class CreateQuests < ActiveRecord::Migration[5.1]
  def change
    create_table :quests do |t|
      t.string :quest_name
      t.integer :gem_reward

			#stats for fun
			t.integer :times_accepted, default: 0
			t.integer :times_abandoned, default: 0
			t.integer :times_completed, default: 0

      t.timestamps
    end
  end
end
