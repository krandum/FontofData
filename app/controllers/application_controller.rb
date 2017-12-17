class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :configure_permitted_parametes, if: :devise_controller?
	before_action :set_current_user

  protected

  def configure_permitted_parametes
	  devise_parameter_sanitizer.permit(:sign_up) do |u|
        u.permit(:username, :email, :password, :password_confirmation, :remember_me, :avatar)
      end
	  devise_parameter_sanitizer.permit(:sign_in) do |u|
        u.permit(:login, :password, :remember_me)
      end
	  devise_parameter_sanitizer.permit(:account_update) do |u|
        u.permit(:username, :email, :password, :password_confirmation, :current_password, :avatar)
      end
	end

	private

	def set_current_user
		ConnectedNode.current_user = current_user
	end

end
