class AddUserToPathData < ActiveRecord::Migration[5.1]
  def change
    add_column :path_data, :user_id, :integer
  end
end
