# rails c
# load './reset_dn.rb'

DataNode.delete_all
update_seq_sql = "update sqlite_sequence set seq = #{0} where name = 'data_nodes';"
ActiveRecord::Base.connection.execute(update_seq_sql)
ConnectedNode.delete_all
update_seq_sql = "update sqlite_sequence set seq = #{0} where name = 'connected_nodes';"
ActiveRecord::Base.connection.execute(update_seq_sql)
DataNode.create([{ value: 4, faction_id: 3 },
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

DataNode.find(1).connections << DataNode.find(5)
DataNode.find(5).connections << DataNode.find(1)
DataNode.find(1).connections << DataNode.find(6)
DataNode.find(6).connections << DataNode.find(1)
DataNode.find(5).connections << DataNode.find(6)
DataNode.find(6).connections << DataNode.find(5)
DataNode.find(6).connections << DataNode.find(7)
DataNode.find(7).connections << DataNode.find(6)

DataNode.find(2).connections << DataNode.find(3)
DataNode.find(3).connections << DataNode.find(2)
DataNode.find(2).connections << DataNode.find(8)
DataNode.find(8).connections << DataNode.find(2)
DataNode.find(3).connections << DataNode.find(9)
DataNode.find(9).connections << DataNode.find(3)
DataNode.find(8).connections << DataNode.find(9)
DataNode.find(9).connections << DataNode.find(8)

DataNode.find(4).connections << DataNode.find(11)
DataNode.find(11).connections << DataNode.find(4)
DataNode.find(4).connections << DataNode.find(12)
DataNode.find(12).connections << DataNode.find(4)
DataNode.find(10).connections << DataNode.find(11)
DataNode.find(11).connections << DataNode.find(10)
DataNode.find(11).connections << DataNode.find(12)
DataNode.find(12).connections << DataNode.find(11)
