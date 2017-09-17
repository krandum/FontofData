class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  belongs_to :faction

  before_create :default_faction

  def change_faction(f)
    self.faction_id = f
  end


  private

  def default_faction
    self.faction_id = 1
  end
end
