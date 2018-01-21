class ChangeGoldToFloat < ActiveRecord::Migration[5.1]
  def change
		change_column :users, :gold, :float, default: 10000.0
  end
end
