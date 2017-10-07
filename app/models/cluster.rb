class Cluster < ApplicationRecord
  belongs_to :owner, polymorphic: true
  has_one :core, class_name: 'DataNode'
  has_many :users, through: :cluster_member
  has_many :data_nodes
end
