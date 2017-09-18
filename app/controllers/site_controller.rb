class SiteController < ApplicationController
	def index
		@factions = ['', 'red', 'blue', 'green', ' ']
		@nodes = []
		iter = 1
		while iter <= 32 do
			name = 'elem'
			node = DataNode.where(:value: iter).first
			if node.method_defined?(:faction_id) AND !(node.empty?) AND defined? node
				index = node.faction_id
				name += ' ' << @factions[index]
			end
			@nodes.push(name)
			iter += 1
		end
	end
end
