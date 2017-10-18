# rails c
# load './reset_dn.rb'

DataNode.delete_all
ConnectedNode.delete_all
Cluster.delete_all

update_seq_sql = "update sqlite_sequence set seq = #{0} where name = 'data_nodes';"
ActiveRecord::Base.connection.execute(update_seq_sql)
update_seq_sql = "update sqlite_sequence set seq = #{0} where name = 'clusters';"
ActiveRecord::Base.connection.execute(update_seq_sql)
Rails.application.load_seed
