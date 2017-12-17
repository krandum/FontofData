class ChangeDefaultGoldInUser < ActiveRecord::Migration[5.1]
  def change
		change_column_default :users, :gold, 10000
  end
end
