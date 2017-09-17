class DataNode < ActiveRecord::Base
  belongs_to :faction
  has_many :interactions
end
