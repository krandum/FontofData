class CreateFactions < ActiveRecord::Migration[5.1]
  def change
    create_table :factions do |t|
      t.string :faction_name
      t.integer :score
    end
  end
end
