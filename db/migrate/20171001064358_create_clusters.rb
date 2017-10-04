class CreateClusters < ActiveRecord::Migration[5.1]
  def change
    create_table :clusters do |t|
      t.belongs_to :owner, foreign_key: true

      t.timestamps
    end
  end
end
