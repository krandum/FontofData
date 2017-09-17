class Interaction < ApplicationRecord
  belongs_to :user
  belongs_to :effect
  belongs_to :origin_node, class_name: 'DataNode'
  belongs_to :target_node, class_name: 'DataNode'
end
