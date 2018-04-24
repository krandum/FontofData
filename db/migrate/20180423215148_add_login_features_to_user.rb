class AddLoginFeaturesToUser < ActiveRecord::Migration[5.1]
	def change
		add_column :users, :last_login, :datetime, default: Time.now
		add_column :users, :status, :string, default: 'offline'
	end
end
