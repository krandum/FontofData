class User < ActiveRecord::Base
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable and :omniauthable
	# Pablo removed: :recoverable, :trackable
	devise :database_authenticatable, :registerable, :rememberable, :validatable
	belongs_to :faction
	has_many :data_nodes

	has_many :owned_clusters, class_name: 'Cluster', as: :owner
	has_many :cluseters, through: :cluster_memberships
	has_many :cluster_memberships

	has_many :news_posts

	# before_create :default_faction

	enum user_access: [:user, :sub_admin, :admin, :super_admin]

	private

	# def default_faction
	# 	self.faction_id = 1
	# end
end
