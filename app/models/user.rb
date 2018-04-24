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

	has_many :achievements

	def self.find_for_database_authentication(warden_conditions)
		conditions = warden_conditions.dup
		login = conditions.delete(:login)
		where(conditions).where(['lower(username) = :value OR lower(email) = :value', { value: login.strip.downcase }]).first
	end

	##Status##

	def logon
		time = Time.now
		self.status = 'online'
		receive_daily_keys(time)
		receive_offline_resources(time)
		self.last_login = time
		self.save
	end

	def logoff
		self.status = 'offline'
		self.receive_resources
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

	##Actions##

	def claim_node(node, cluster_name)
		cluster = self.owned_clusters.create(owner_type: 'Player', cluster_name: cluster_name)
		node.update_attributes(
			role: 1,
			user_id: self.id,
			cluster_core: true,
			cluster_id: cluster.id,
			faction_id: self.faction_id,
			last_change: Time.now
		)
		self.gold_per_min += node.resource_generator
		self.save
	end

	def can_claim(node_val)
		if node_val == 1 || self.proved.where("val_b = #{node_val} OR val_a = #{node_val}").count >= 3
			true
		else
			false
		end
	end

	def can_capture(node_val)
		if node_val <= 15
			node = DataNode.find_by(value: node_val, user_id: self.id)
			node = DataNode.find_by(value: node_val, faction_id: 1) unless node
		else
			node = DataNode.find_by(value: node_val)
		end
		if node
			completed = node.connected_nodes.where(connection_type: 2)
			home_team = completed.select{ |x| x.connection.faction_id != self.faction_id}.count
			away_team = completed.select{ |x| x.connection.faction_id != node.faction_id}.count
			if away_team >= home_team
				true
			else
				false
			end
		else
			true
		end
	end

	##Achievements##

	def award(achievement, rewards = {})
		achievements << achievement.new
		self.gems += rewards[:keys] if rewards[:keys]
		self.save
	end

	def awarded?(achievement)
		achievements.where(type: achievement.name ).count > 0
		# achievements.count(:conditions => { :type => achievement }) > 0
	end

	def completed_tut?
		t4_nodes = self.data_nodes.where(value: 8..15)
		t4_nodes.each do |node|
			if connected_to_root?(node)
				return true
			end
		end
		false
	end

	private

	def set_time
		self.last_income = Time.now
	end

	def connected_to_root?(node)
		return true if node.value == 1
		parent = self.data_nodes.find_by(value: node.value / 2)
		return false unless parent
		connected_to_root?(parent)
	end

	def receive_daily_keys(time)
		self.gems += [3, time.day - self.last_login.day].min
	end

	def receive_offline_resources(time)
		self.gold += [6000, ((time - self.last_income) / 1.minute) * self.gold_per_min].min
		self.last_income = time
	end

end
