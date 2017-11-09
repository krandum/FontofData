class Quest < ApplicationRecord
  has_many :quest_logs
  has_many :users, through: :quest_logs
end
