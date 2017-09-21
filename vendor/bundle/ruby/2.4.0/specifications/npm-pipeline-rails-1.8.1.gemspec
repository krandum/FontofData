# -*- encoding: utf-8 -*-
# stub: npm-pipeline-rails 1.8.1 ruby lib

Gem::Specification.new do |s|
  s.name = "npm-pipeline-rails".freeze
  s.version = "1.8.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Rico Sta. Cruz".freeze]
  s.bindir = "exe".freeze
  s.date = "2017-08-01"
  s.description = "Use any toolchain to bulid your asset files in Rails 4.2. Integrate Brunch, Gulp, Grunt, Webpack, Browserify and others seamlessly into Rails apps.".freeze
  s.email = ["rstacruz@users.noreply.github.com".freeze]
  s.homepage = "https://github.com/rstacruz/npm-pipeline-rails".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.6.11".freeze
  s.summary = "Use npm as part of your Rails asset pipeline".freeze

  s.installed_by_version = "2.6.11" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<railties>.freeze, ["< 6.0.0", ">= 4.0.0"])
      s.add_runtime_dependency(%q<sprockets>.freeze, ["~> 3.5"])
      s.add_development_dependency(%q<bundler>.freeze, ["~> 1.11"])
      s.add_development_dependency(%q<rake>.freeze, ["~> 10.0"])
      s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0"])
      s.add_development_dependency(%q<rails>.freeze, ["< 5.1", ">= 4.2"])
    else
      s.add_dependency(%q<railties>.freeze, ["< 6.0.0", ">= 4.0.0"])
      s.add_dependency(%q<sprockets>.freeze, ["~> 3.5"])
      s.add_dependency(%q<bundler>.freeze, ["~> 1.11"])
      s.add_dependency(%q<rake>.freeze, ["~> 10.0"])
      s.add_dependency(%q<minitest>.freeze, ["~> 5.0"])
      s.add_dependency(%q<rails>.freeze, ["< 5.1", ">= 4.2"])
    end
  else
    s.add_dependency(%q<railties>.freeze, ["< 6.0.0", ">= 4.0.0"])
    s.add_dependency(%q<sprockets>.freeze, ["~> 3.5"])
    s.add_dependency(%q<bundler>.freeze, ["~> 1.11"])
    s.add_dependency(%q<rake>.freeze, ["~> 10.0"])
    s.add_dependency(%q<minitest>.freeze, ["~> 5.0"])
    s.add_dependency(%q<rails>.freeze, ["< 5.1", ">= 4.2"])
  end
end
