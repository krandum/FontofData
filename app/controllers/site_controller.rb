class SiteController < ApplicationController
	def index
		factions = ['', 'red', 'blue', 'green', ' ']
		@nodes = []
		iter = 1
		while iter <= 32 do
			name = 'elem'
			elem = DataNode.where(value: iter).first
			if defined? elem && !(elem.empty?) && elem.method_defined?(:faction_id)
				index = elem.faction_id
				name += ' ' << factions[index]
			end
			@nodes.push(name)
			iter += 1
		end
	end
end
