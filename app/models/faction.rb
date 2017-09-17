class Faction < ActiveRecord::Base
  has_many :users
  has_many :data_nodes
end
