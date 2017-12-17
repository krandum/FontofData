class ChangeDefaultGemsInUser < ActiveRecord::Migration[5.1]
  def change
		change_column_default :users, :gems, 3
  end
end
