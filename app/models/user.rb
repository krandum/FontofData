class User < ActiveRecord::Base
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable and :omniauthable
	# Pablo removed: :recoverable, :trackable
	devise :database_authenticatable, :registerable, :rememberable, :validatable
	belongs_to :faction

	before_create :default_faction

	private

	def default_faction
		self.faction_id = 1
	end
end
