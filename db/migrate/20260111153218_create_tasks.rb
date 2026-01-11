class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.boolean :completed, default: false, null: false
      t.string :external_user_name
      t.string :external_company
      t.string :external_city

      t.timestamps
    end
  end
end
