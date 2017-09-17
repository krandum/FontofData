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

ActiveRecord::Schema.define(version: 20170917050457) do

  create_table "data_nodes", force: :cascade do |t|
    t.integer  "value"
    t.integer  "faction_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "effects", force: :cascade do |t|
    t.string   "effect_name"
    t.integer  "clearence_value"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "factions", force: :cascade do |t|
    t.string   "faction_name"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  create_table "interactions", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "effect_id"
    t.integer  "origin_node_id"
    t.integer  "target_node_id"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.index ["effect_id"], name: "index_interactions_on_effect_id"
    t.index ["origin_node_id"], name: "index_interactions_on_origin_node_id"
    t.index ["target_node_id"], name: "index_interactions_on_target_node_id"
    t.index ["user_id"], name: "index_interactions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string   "username"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.integer  "faction_id"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end