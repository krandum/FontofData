class ConnectedNode < ApplicationRecord
  after_create :create_inverse, unless: :has_inverse?
  after_destroy :destroy_inverse, if: :has_inverse?

  belongs_to :data_node
  belongs_to :connection, class_name: 'DataNode'

  private

	def create_inverse
		self.class.create(inverse_options)
	end

	def destroy_inverse
		inverses.destroy_all
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
