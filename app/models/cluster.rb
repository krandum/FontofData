class Cluster < ApplicationRecord
  belongs_to :owner, polymophic: true
  has_one :core, class_name: 'DataNode'
  has_many :users, through: :cluster_member
end
