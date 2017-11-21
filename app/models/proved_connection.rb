class ProvedConnection < ActiveRecord::Base
	belongs_to :user
	belongs_to :connected_node
end