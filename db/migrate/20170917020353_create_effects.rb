class CreateEffects < ActiveRecord::Migration[5.0]
  def change
    create_table :effects do |t|
      t.string :effect_name
      t.integer :clearence_value

      t.timestamps
    end
  end
end
