class Interaction < ApplicationRecord
  belongs_to :user
  belongs_to :effect
  belongs_to :origin_node, class_name: 'DataNode', foreign_key: :origin_node_id
  belongs_to :target_node, class_name: 'DataNode', foreign_key: :target_node_id
end
