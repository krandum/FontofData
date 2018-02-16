class Achievement < ApplicationRecord
	belongs_to :user

	class << self
		def levels
			@levels ||= []
		end

		def level(level, options = {})
			levels << {level: level, }
		end

		def rewards
			@reward ||= {}
		end

		def set_rewards(options = {})
			rewards[:keys] = options[:keys]
		end
	end
end
