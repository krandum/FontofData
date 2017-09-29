class DataNode < ActiveRecord::Base
  belongs_to :faction
  belongs_to :user
  has_many :interactions

  has_many :connected_nodes
  has_many :connections, through: :connected_nodes

  has_many :connected_with_nodes, foreign_key: :connection_id, class_name: 'ConnectedNode'
  has_many :connected_withs, through: :connected_with_nodes, source: :data_node
end
