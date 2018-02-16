class AddProgressFlagsToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :tutorial_flag, :integer, default: 0
  end
end
