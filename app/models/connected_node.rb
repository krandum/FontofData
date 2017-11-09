class ConnectedNode < ApplicationRecord
  after_create :create_inverse, unless: :has_inverse?
  after_destroy :destroy_inverse, if: :has_inverse?

  belongs_to :data_node
  belongs_to :connection, class_name: 'DataNode'

  def update_connection(params)
    @inverse = inverse
    p params
    unless params['percentage'].nil?
      p params['percentage']
      # TODO: implement a function that can assure the total percentage doesn't exceed 100%
      self.self_percentage = params['percentage']
      @inverse.inverse_percentage = params['percentage']
    end
    unless params['friction'].nil?
      p params['friction']
      self.self_friction = params['friction']
      @inverse.inverse_friction = params['friction']
    end
    unless params['worth'].nil?
      p params['worth']
      self.self_worth = params['worth']
      @inverse.inverse_worth = params['worth']
    end
    unless params['speed'].nil?
      p params['speed']
      self.self_speed = params['speed']
      @inverse.inverse_speed = params['speed']
    end
    save
    @inverse.save
  end

  private

  def create_inverse
    self.class.create(inverse_options)
  end

  def destroy_inverse
    inverses.destroy_all
  end

  def inverse
    self.class.where(inverse_options).first
  end

  def inverses
    self.class.where(inverse_options)
  end

  def has_inverse?
    self.class.exists?(inverse_options)
  end

  def inverse_options
    { data_node_id: connection_id, connection_id: data_node_id }
  end
end
