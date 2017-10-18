class Interaction < ApplicationRecord
  belongs_to :user
  belongs_to :effect
  belongs_to :origin_node, foreign_key: :origin_node_id , class_name: 'DataNode'
  belongs_to :target_node, foreign_key: :target_node_id , class_name: 'DataNode'
end
