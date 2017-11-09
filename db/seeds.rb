# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#	 cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#	 Mayor.create(name: 'Emanuel', city: cities.first)
if Faction.all.empty?
	factions = Faction.create([
		{ faction_name: 'Neutral' },
		{ faction_name: 'Red' },
		{ faction_name: 'Green' },
		{ faction_name: 'Blue' }
	])
end

if Effect.all.empty?
	effects = Effect.create([
		{ effect_name: 'attack', clearence_value: 25000 },
		{ effect_name: 'connect', clearence_value: 20000 }
		# { effect_name: 'give', clearence_value: 20001 },
		# { effect_name: 'swap', clearence_value: 00001 },

	])
end

if DataNode.all.empty?
	data_nodes = DataNode.create([
		{ value: 4, faction_id: 3 },
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
		{ value: 15, faction_id: 4 }
	])

	greenNodes = [DataNode.find(1), DataNode.find(5), DataNode.find(6), DataNode.find(7)]
	begin
    greenNodes[0].connections << [greenNodes[1], greenNodes[2]]
    greenNodes[1].connections << greenNodes[2].connections
    greenNodes[2].connections << greenNodes[3].connections
		# greenNodes[0].connections << [greenNodes[1], greenNodes[2]]
		# greenNodes[1].connections << [greenNodes[0], greenNodes[2]]
		# greenNodes[2].connections << [greenNodes[0], greenNodes[1], greenNodes[3]]
		# greenNodes[3].connections << greenNodes[2]
	end
	greenCluster = Faction.find(3).clusters.build
	greenNodes[0].update_attribute(:cluster_core, true)
	greenCluster.data_nodes << greenNodes
	greenCluster.save

	redNodes = [DataNode.find(2), DataNode.find(3), DataNode.find(8), DataNode.find(9)]
	begin
    redNodes[0].connections << [redNodes[1], redNodes[2]]
    redNodes[3].connections << [redNodes[1], redNodes[2]]
		# redNodes[0].connections << [redNodes[1], redNodes[2]]
		# redNodes[1].connections << [redNodes[0], redNodes[3]]
		# redNodes[2].connections << [redNodes[0], redNodes[3]]
		# redNodes[3].connections << [redNodes[1], redNodes[2]]
	end
	redCluster = Faction.find(2).clusters.build
	redNodes[0].update_attribute(:cluster_core, true)
	redCluster.data_nodes << redNodes
	redCluster.save

	blueNodes = [DataNode.find(4), DataNode.find(10), DataNode.find(11), DataNode.find(12)]
	begin
    blueNodes[2].connections << [blueNodes[0], blueNodes[1], blueNodes[3]]
    blueNodes[0].connections << blueNodes[3]
		# blueNodes[0].connections << [blueNodes[2], blueNodes[3]]
		# blueNodes[1].connections << blueNodes[2]
		# blueNodes[2].connections << [blueNodes[0], blueNodes[1], blueNodes[3]]
		# blueNodes[3].connections << [blueNodes[0], blueNodes[2]]
	end
	blueCluster = Faction.find(4).clusters.build
	blueNodes[0].update_attribute(:cluster_core, true)
	blueCluster.data_nodes << blueNodes
	blueCluster.save

end

if Quest.all.empty?
  quests = Quest.create([
      {quest_name: 'leo', gem_reward: 1, required_nodes: [
          2, 1,
          5, 2,
          6, 5,
          6, 3,
          3, 1,
          12, 6,
          13, 12
      ]},
			{quest_name: 'libra', gem_reward: 1, required_nodes: [
					4, 2,
          5, 4,
          11, 5,
          12, 11,
          12, 6,
          7, 6,
          7, 3
			]},
			{quest_name: 'scorpio', gem_reward: 1, required_nodes: [
					2, 1,
          3, 1,
          6, 3,
          13, 6,
          14, 13,
          15, 14
			]},
			{quest_name: 'sagitarious', gem_reward: 1, required_nodes: [
					5, 2,
          5, 4,
          11, 5,
          6, 5,
          7, 6,
          14, 7,
          7, 3
			]},
			{quest_name: 'aquarious', gem_reward: 1, required_nodes: [
					4, 2,
          5, 2,
          6, 5,
          6, 3,
          7, 3
			]},
			{quest_name: 'pisces', gem_reward: 1, required_nodes: [
					5, 2,
          10, 5,
          6, 5,
          6, 3,
          13, 6
			]},
			{quest_name: 'aries', gem_reward: 1, required_nodes: [
					4, 2,
          2, 1,
          7, 3,
          3, 1
			]},
			{quest_name: 'taurus', gem_reward: 1, required_nodes: [
					10, 5,
          5, 2,
          2, 1,
          13, 6,
          6, 3,
          3, 1
			]},
			{quest_name: 'gemini', gem_reward: 1, required_nodes: [
					5, 4,
          5, 2,
          6, 5,
          7, 6,
          6, 3,
          3, 2
			]},
			{quest_name: 'cancer', gem_reward: 1, required_nodes: [
					10, 5,
          11, 10,
          11, 5,
          12, 11,
          3, 2,
          7, 3,
          7, 6,
          6, 3
			]},
			{quest_name: 'virgo', gem_reward: 1, required_nodes: [
					2, 1,
          5, 2,
          6, 5,
          6, 3,
          3, 1
			]},
			{quest_name: 'capricorn', gem_reward: 1, required_nodes: [
					9, 4,
          10, 9,
          10, 5,
          5, 2,
          2, 1,
          3, 1
			]}
                        ])
end
