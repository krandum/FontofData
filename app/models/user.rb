class User < ActiveRecord::Base
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable and :omniauthable
	# Pablo removed: :recoverable
	validates :username, presence: true, length: { maximum: 255 }, uniqueness: { case_sensitive: false }, format: { with: /\A[a-zA-Z0-9]*\z/, message: 'may only contain letters and numbers.' }
	devise :database_authenticatable, :registerable, :rememberable, :validatable, :trackable

	attr_accessor :login
	enum user_access: %i[user sub_admin admin super_admin]
	has_attached_file :avatar, styles: { medium: '150x150#', thumb: '28x28#' } # , default_url: "/images/:style/missing.png"
	validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\z/
	validates_with AttachmentSizeValidator, attributes: :avatar, less_than: 100.kilobytes

	belongs_to :faction
	has_many :data_nodes
	has_many :interactions

	has_many :owned_clusters, class_name: 'Cluster', as: :owner
	has_many :cluster_memberships
	has_many :clusters, through: :cluster_memberships

	has_many :quest_logs
	has_many :quests, through: :quest_logs

	has_many :news_posts
	has_many :chat_rooms, dependent: :destroy
	has_many :messages, dependent: :destroy

	def self.find_for_database_authentication(warden_conditions)
		conditions = warden_conditions.dup
		login = conditions.delete(:login)
		where(conditions).where(['lower(username) = :value OR lower(email) = :value', { value: login.strip.downcase }]).first
	end

	def self.receive_resources
		User.includes(:data_nodes).all.each do |user|
			user.receive_resources
		end
	end

	def receive_resources
		self.gold += [data_nodes.sum(:resource_generator), 1.0].max
		self.save
	end

	def self.receive_quest
		User.all.each do |user|
			user.receive_quest
		end
	end

	def receive_quest
		quest = Quest.find(([*1..12] - self.recent_quests).sample)
		unless quest.nil?
			self.quests << quest
			self.recent_quests += [quest.id]
			if self.recent_quests.count > 5
				self.recent_quests.shift
			end
			self.save
		end
	end

end
