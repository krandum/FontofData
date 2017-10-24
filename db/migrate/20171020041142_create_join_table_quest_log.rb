class CreateJoinTableQuestLog < ActiveRecord::Migration[5.1]
  def change
    create_join_table :users, :quests, tablename: :quest_log do |t|
      t.index [:user_id, :quest_id]
      # t.index [:quest_id, :user_id]
    end
  end
end
