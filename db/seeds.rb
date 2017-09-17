# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
factions = Faction.create([{ faction_name: 'Neutral' }, { faction_name: 'Red' }, { faction_name: 'Green' }, { faction_name: 'Blue' }])
effects = Effect.create([{ effect_name: 'attack', clearence_value: 25000 }, { effect_name: 'give', clearence_value: 20001 }, { effect_name: 'swap', clearence_value: 00001 }])