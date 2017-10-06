# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171006083456) do

  create_table "chat_rooms", force: :cascade do |t|
    t.string "title"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_chat_rooms_on_user_id"
  end

  create_table "cluster_membership", id: false, force: :cascade do |t|
    t.integer "cluster_id"
    t.integer "user_id"
  end

  create_table "clusters", force: :cascade do |t|
    t.integer "owner_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "owener_type"
    t.string "owner_type"
    t.index ["owner_id"], name: "index_clusters_on_owner_id"
  end

  create_table "connected_nodes", id: false, force: :cascade do |t|
    t.integer "data_node_id", null: false
    t.integer "connection_id", null: false
    t.index ["data_node_id", "connection_id"], name: "index_connected_nodes_on_data_node_id_and_connection_id", unique: true
  end

  create_table "data_nodes", force: :cascade do |t|
    t.integer "value"
    t.integer "faction_id"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_data_nodes_on_user_id"
  end

  create_table "effects", force: :cascade do |t|
    t.string "effect_name"
    t.integer "clearence_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "factions", force: :cascade do |t|
    t.string "faction_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "interactions", force: :cascade do |t|
    t.integer "user_id"
    t.integer "effect_id"
    t.integer "origin_node_id"
    t.integer "target_node_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["effect_id"], name: "index_interactions_on_effect_id"
    t.index ["origin_node_id"], name: "index_interactions_on_origin_node_id"
    t.index ["target_node_id"], name: "index_interactions_on_target_node_id"
    t.index ["user_id"], name: "index_interactions_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body"
    t.integer "user_id"
    t.integer "chat_room_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_room_id"], name: "index_messages_on_chat_room_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "news_posts", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_news_posts_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", default: "", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "faction_id", default: 1, null: false
    t.integer "gold", default: 0, null: false
    t.decimal "gold_per_min", default: "0.0", null: false
    t.integer "gems", default: 0, null: false
    t.integer "user_access", default: 0, null: false
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "avatar_file_name"
    t.string "avatar_content_type"
    t.integer "avatar_file_size"
    t.datetime "avatar_updated_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

end
