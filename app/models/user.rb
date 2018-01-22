class User < ActiveRecord::Base
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable and :omniauthable
	# Pablo removed: :recoverable
	validates :username, presence: true, length: { maximum: 255 }, uniqueness: { case_sensitive: false }, format: { with: /\A[a-zA-Z0-9]*\z/, message: 'may only contain letters and numbers.' }
	devise :database_authenticatable, :registerable, :rememberable, :validatable, :trackable

	before_create :set_time

	attr_accessor :login
	enum user_access: %i[user sub_admin admin super_admin]
	has_attached_file :avatar, styles: { medium: '150x150#', thumb: '28x28#' } # , default_url: "/images/:style/missing.png"
	validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\z/
	validates_with AttachmentSizeValidator, attributes: :avatar, less_than: 100.kilobytes

	belongs_to :faction
	has_many :data_nodes
	has_many :interactions

	has_many :owned_clusters, class_name: 'Cluster', foreign_key: 'owner_id', as: :owner
	has_many :cluster_memberships
	has_many :clusters, through: :cluster_memberships

	# has_many :proved_connections
	# has_many :proved, through: :proved_connections, source: :connected_node
	has_many :proved, foreign_key: 'user_id', class_name: 'PathData'

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
		time = Time.now
		self.gold += ((time - self.last_income) / 1.minute) * self.gold_per_min
		self.last_income = time
		self.save
	end

	def transaction(type, amount)
		case type
			when 0
				self.gold += amount
			when 1
				self.gems += amount
			else
				#invalid
				p "wrong transaction type"
		end
		self.save
		TransactionWorker.perform_async(self.id, type, amount)
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

	def complete_quest(quest_id)
		quest = self.quests.find_by(id: quest_id)
		self.gems += quest.gem_reward
		quest.times_completed += 1
		quest.save
		self.quests.delete(quest)
		self.save
	end

	def can_claim(node_val)
		if self.proved.where("val_b = #{node_val} OR val_a = #{node_val}").count >= 3
			true
		else
			false
		end

	end

	def can_capture(node_val)
		node = DataNode.find_by(value: node_val)
		completed = node.connected_nodes.where(connection_type: 2)
		home_team = completed.select{ |x| x.connection.faction_id != self.faction_id}.count
		away_team = completed.select{ |x| x.connection.faction_id != node.faction_id}.count
		if away_team >= home_team
			true
		else
			false
		end
	end

	private

	def set_time
		self.last_income = Time.now
	end

end
