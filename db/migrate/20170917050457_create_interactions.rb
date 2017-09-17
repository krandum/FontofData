class CreateInteractions < ActiveRecord::Migration[5.0]
  def change
    create_table :interactions do |t|
      t.belongs_to :user, foreign_key: true
      t.belongs_to :effect, foreign_key: true
      t.belongs_to :origin_node, foreign_key: true
      t.belongs_to :target_node, foreign_key: true

      t.timestamps
    end
  end
end
