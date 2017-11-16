class AddRecentQuestsToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :recent_quests, :integer, array: true, default: []
  end
end
