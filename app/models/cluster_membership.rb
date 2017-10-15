class ClusterMembership < ApplicationRecord
	belongs_to :cluster
	belongs_to :user
end
