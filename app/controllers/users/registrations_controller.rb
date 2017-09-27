class Users::RegistrationsController < Devise::RegistrationsController
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /users/index
  def index
    unless current_user.try(:admin?)
      flash[:notice] = "You are not authorized."
      redirect_to root_path
    else
      @users = User.all
    end
  end

  # GET /users/profile
  def profile
    @user = User.find(params[:id])
  end

  # PUT /
  def change_faction
    @user = User.find(params.require(:user))
    unless current_user.id == @user.id || current_user.admin?
      flash[:notice] = "You are not authorized."
    else
      flash[:notice] = "faction changed."
      @user.update_attribute(:faction_id, params.require(:faction))
    end
    redirect_back(fallback_location: root_path)
  end

  # PUT
  def make_admin
    @user = User.find(params.require(:user))
    unless current_user.admin?
      flash[:notice] = "Not sure how you got here, but no."
    else
      flash[:notice] = @user.username + " is now an admin"
      @user.update_attribute(:admin, true)
    end
    redirect_back(fallback_location: root_path)
  end

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  # def create
  #   super
  # end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

   protected

  # def update_user(resource, params)
  #   resource.update_without_password(params)
  # end
  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_up_params
  #   devise_parameter_sanitizer.permit(:sign_up, keys: [:attribute])
  # end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end
end
