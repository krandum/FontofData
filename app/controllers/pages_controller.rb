class PagesController < ApplicationController
	def home
		@news_posts = NewsPost.all
	end

	def about
	end

	def story
	end

	def faq
	end

	def e404
	end

	def e500
	end
end
