class TransactionWorker
	include Sidekiq::Worker

	# currency:
	# 	0 - gold
	#		1 - keys

	def perform(user_id, currency, amount)
		# Do something later
		ActionCable.server.broadcast "user#{user_id}",
			function_call: 'transaction',
			currency: currency,
			amount: amount

	end
end