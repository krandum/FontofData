# rails c
# load './reset_dn.rb'

DataNode.delete_all
update_seq_sql = "update sqlite_sequence set seq = #{new_max} where name = 'data_nodes';"
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
