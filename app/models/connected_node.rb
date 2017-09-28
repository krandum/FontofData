class ConnectedNode < ApplicationRecord
  belongs_to :data_node
  belongs_to :connection, class_name: 'DataNode'
end
