# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
factions = Faction.create([{ faction_name: 'Neutral' },
                           { faction_name: 'Red' },
                           { faction_name: 'Green' },
                           { faction_name: 'Blue' }])

effects = Effect.create([{ effect_name: 'attack', clearence_value: 25000 },
                         { effect_name: 'give', clearence_value: 20001 },
                         { effect_name: 'swap', clearence_value: 00001 },
                         { effect_name: 'connect', clearence_value: 00000 }])

data_nodes = DataNode.create([{ value: 4, faction_id: 3 },
                              { value: 5, faction_id: 2 },
                              { value: 6, faction_id: 2 },
                              { value: 7, faction_id: 4 },
                              { value: 8, faction_id: 3 },
                              { value: 9, faction_id: 3 },
                              { value: 10, faction_id: 3 },
                              { value: 11, faction_id: 2 },
                              { value: 12, faction_id: 2 },
                              { value: 13, faction_id: 4 },
                              { value: 14, faction_id: 4 },
                              { value: 15, faction_id: 4 }])
