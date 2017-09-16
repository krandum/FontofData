class CreateFactions < ActiveRecord::Migration
  def change
    create_table :factions do |t|
      t.string :faction_name

      t.timestamps null: false
    end
  end
end
