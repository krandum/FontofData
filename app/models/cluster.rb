class Cluster < ApplicationRecord
  belongs_to :owner, foreign_key: :owner_id, polymorphic: true
  # has_one :cluster_core, class_name: 'DataNode'
  has_many :cluster_memberships, dependent: :destroy
  has_many :users, through: :cluster_memberships
  has_many :data_nodes
end
