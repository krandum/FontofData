class EffectsController < ApplicationController
  before_action :can_access, except: [:create, :update, :destroy]
  before_action :set_effect, only: [:show, :edit, :update, :destroy]

  # GET /effects
  # GET /effects.json
  def index
    @effects = Effect.all
  end

  # GET /effects/1
  # GET /effects/1.json
  def show
  end

  # GET /effects/new
  def new
    @effect = Effect.new
  end

  # GET /effects/1/edit
  def edit
  end

  # POST /effects
  # POST /effects.json
  def create
    @effect = Effect.new(effect_params)

    respond_to do |format|
      if @effect.save
        format.html { redirect_to @effect, notice: 'Effect was successfully created.' }
        format.json { render :show, status: :created, location: @effect }
      else
        format.html { render :new }
        format.json { render json: @effect.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /effects/1
  # PATCH/PUT /effects/1.json
  def update
    respond_to do |format|
      if @effect.update(effect_params)
        format.html { redirect_to @effect, notice: 'Effect was successfully updated.' }
        format.json { render :show, status: :ok, location: @effect }
      else
        format.html { render :edit }
        format.json { render json: @effect.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /effects/1
  # DELETE /effects/1.json
  def destroy
    @effect.destroy
    respond_to do |format|
      format.html { redirect_to effects_url, notice: 'Effect was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_effect
      @effect = Effect.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def effect_params
      params.require(:effect).permit(:effect_name, :clearence_value)
    end

    def can_access
      unless current_user.try(:admin?)
        flash[:notice] = "You are not authorized."
        redirect_to root_path
      end
    end

end
