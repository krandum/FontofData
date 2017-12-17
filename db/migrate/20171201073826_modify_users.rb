class ModifyUsers < ActiveRecord::Migration[5.1]
  def change
		add_column :users, :last_income, :datetime
		add_column :users, :quests_completed, :integer
  end
end
