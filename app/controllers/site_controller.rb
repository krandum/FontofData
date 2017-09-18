class SiteController < ApplicationController
	def index
		factions = ['', 'red', 'blue', 'green', ' ']
		@nodes = []
		iter = 1
		while iter <= 32 do
			print iter.to_s
			name = 'elem'
			elem = DataNode.where(value: iter).first
			print defined? elem
			print elen.empty?
			print elem.method_defined?(:faction_id)
			if defined? elem && !(elem.empty?) && elem.method_defined?(:faction_id)
				index = elem.faction_id
				name += ' ' << factions[index]
			end
			@nodes.push(name)
			iter += 1
		end
	end
end
