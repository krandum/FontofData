class AddProgressFlagsToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :progress_flags, :integer, array:true, default: []
  end
end
