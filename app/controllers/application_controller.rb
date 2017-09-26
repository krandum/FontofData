class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :configure_permitted_parametes, if: :devise_controller?

  protected

  def configure_permitted_parametes
    devise_parameter_sanitizer.permit(:sign_up) do |u| 
      u.permit(:username, :email, :password, :password_confirmation, :remember_me)
    end
  end
end
