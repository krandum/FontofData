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

ActiveRecord::Schema.define(version: 20171103053005) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "chat_rooms", force: :cascade do |t|
    t.string "title"
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_chat_rooms_on_user_id"
  end

  create_table "cluster_memberships", id: false, force: :cascade do |t|
    t.integer "cluster_id"
    t.integer "user_id"
  end

  create_table "clusters", force: :cascade do |t|
    t.integer "owner_id"
    t.string "owner_type"
  end

  create_table "connected_nodes", force: :cascade do |t|
    t.bigint "data_node_id", null: false
    t.bigint "connection_id", null: false
    t.decimal "self_percentage", default: "0.0"
    t.decimal "inverse_percentage", default: "0.0"
    t.float "self_friction", default: 0.001
    t.float "inverse_friction", default: 0.001
    t.integer "self_worth", default: 0
    t.integer "inverse_worth", default: 0
    t.float "self_speed", default: 0.0
    t.float "inverse_speed", default: 0.0
    t.index ["data_node_id", "connection_id"], name: "index_connected_nodes_on_data_node_id_and_connection_id", unique: true
  end

  create_table "data_nodes", force: :cascade do |t|
    t.integer "value"
    t.integer "role"
    t.bigint "user_id"
    t.boolean "cluster_core", default: false
    t.decimal "resource_generator", default: "0.7"
    t.bigint "faction_id"
    t.bigint "cluster_id"
    t.integer "worth", default: 0
    t.index ["cluster_id"], name: "index_data_nodes_on_cluster_id"
    t.index ["faction_id"], name: "index_data_nodes_on_faction_id"
    t.index ["user_id"], name: "index_data_nodes_on_user_id"
  end

  create_table "effects", id: :serial, force: :cascade do |t|
    t.string "effect_name"
    t.integer "clearence_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "factions", force: :cascade do |t|
    t.string "faction_name"
    t.integer "score"
  end

  create_table "interactions", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.integer "effect_id"
    t.integer "origin_node_id"
    t.integer "target_node_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["effect_id"], name: "index_interactions_on_effect_id"
    t.index ["user_id"], name: "index_interactions_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body"
    t.bigint "user_id"
    t.bigint "chat_room_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_room_id"], name: "index_messages_on_chat_room_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "news_posts", id: :serial, force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_news_posts_on_user_id"
  end

  create_table "quests", force: :cascade do |t|
    t.string "quest_name"
    t.integer "gem_reward"
    t.integer "times_accepted", default: 0
    t.integer "times_abandoned", default: 0
    t.integer "times_completed", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "required_nodes", default: [], array: true
  end

  create_table "quests_users", id: false, force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "quest_id", null: false
    t.index ["user_id", "quest_id"], name: "index_quests_users_on_user_id_and_quest_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
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
    t.integer "sign_in_count", default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "chat_rooms", "users"
  add_foreign_key "data_nodes", "clusters"
  add_foreign_key "data_nodes", "factions"
  add_foreign_key "data_nodes", "users"
  add_foreign_key "interactions", "effects"
  add_foreign_key "interactions", "users"
  add_foreign_key "messages", "chat_rooms"
  add_foreign_key "messages", "users"
  add_foreign_key "news_posts", "users"
end
