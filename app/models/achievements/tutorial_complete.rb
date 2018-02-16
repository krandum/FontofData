class TutorialComplete < Achievement
	set_rewards keys: 3


	class << self

		def check_condition(user)
			return unless user
			if !user.awarded?(self) and user.tutorial_flag >= 5
				user.award(self, rewards)
			end
		end

		def description
			'Learning the ropes'
		end

	end


end