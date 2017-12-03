class CreatePathData < ActiveRecord::Migration[5.1]
  def change
    create_table :path_data do |t|
      t.integer :val_a
      t.integer :val_b
      t.string :path
    end
  end
end
