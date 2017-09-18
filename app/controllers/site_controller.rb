class SiteController < ApplicationController
	def index
		@nodes = []
		(1...32).each do |iter|
			name = "elem"
			if (DataNode.where(value: iter).exists?)
				name += " " + iter.to_s
			end
			@nodes.push(name)
		end
	end
end
