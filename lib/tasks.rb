class Tasks
	def self.testfunction(data)
		p data['test1']
	end

	def give_gold
		User.each do |user|
			user.gain_gold
		end
	end

	def give_quest
		User.each do |user|
			user.receive_quest
		end
	end
end