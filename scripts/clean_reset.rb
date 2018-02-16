DataNode.delete_all
ConnectedNode.delete_all
Cluster.delete_all
PathData.delete_all
Achievement.delete_all
Message.delete_all

ActiveRecord::Base.connection.reset_pk_sequence!('data_nodes')
ActiveRecord::Base.connection.reset_pk_sequence!('connected_nodes')
ActiveRecord::Base.connection.reset_pk_sequence!('clusters')
ActiveRecord::Base.connection.reset_pk_sequence!('path_data')
ActiveRecord::Base.connection.reset_pk_sequence!('achievements')
ActiveRecord::Base.connection.reset_pk_sequence!('messages')
Rails.application.load_seed

User.all.each do |user|
	user.gold = 10000
	user.gems = 3
	user.gold_per_min = 0
	user.faction_id = 1
	user.save
end