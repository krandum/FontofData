require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Fod
	class Application < Rails::Application
		# Settings in config/environments/* take precedence over those specified here.
		# Application configuration should go into files in config/initializers
		# -- all .rb files in that directory are automatically loaded.

		# Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
		# Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
		# config.time_zone = 'Central Time (US & Canada)'

		# The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
		# config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
		# config.i18n.default_locale = :de

		# Do not swallow errors in after_commit/after_rollback callbacks.

		# config.active_record.raise_in_transactional_callbacks = true		#deprecated


		config.browserify_rails.paths << /vendor\/assets\/javascripts\/module\.js/
		config.browserify_rails.source_map_environments << "production"
		config.browserify_rails.evaluate_node_modules = true
		config.browserify_rails.force = ->(file) { File.extname(file) == ".ts" }
		config.browserify_rails.node_env = "production"

		config.sass.preferred_syntax = :scss
		config.sass.line_comments = false
		config.sass.cache = false
		config.assets.paths << Rails.root.join('node_modules', 'paper', 'dist')
		config.assets.paths << Rails.root.join('node_modules', 'acorn')
		config.assets.paths << Rails.root.join('node_modules', 'palette', 'lib')
		config.assets.paths << Rails.root.join('node_modules', 'popper.js', 'dist')
		config.active_job.queue_adapter = :sidekiq
		config.autoload_paths += Dir[Rails.root.join("app", "models", "achievements")]

		# config.browserify_rails.commandline_options = "-t babelify"
	end
end
