Rails.application.routes.draw do

  resources :news_posts
  resources :interactions
  resources :effects
  resources :factions
  resources :data_nodes
  resources :play
  
  devise_for :users,
   controllers: { sessions: 'users/sessions' , registrations: 'users/registrations'}
  
  devise_scope :user do
      get 'profile/:id', to: 'users/registrations#profile', as: :user
      get 'users/index', to: 'users/registrations#index', as: 'user_index'
      put 'faction_select', to: 'users/registrations#change_faction', as: 'faction_select'
  end
  
  # get 'data_nodes/index'
  # get 'data_nodes/show'
  # get 'data_nodes/new'
  # get 'data_nodes/edit'
  # post 'data_nodes/create'
  # patch 'data_nodes/update'
  # put 'data_nodes/update'
  # delete 'data_nodes/destroy'
  
  get 'errors/e404'
  get 'errors/e500'
  get 'home/index'
  get 'about/index'
  get 'story/index'
  get 'faq/index'
  get '/take_action', :to => 'interactions#take_action'
  get '/request_nodes', :to => 'data_nodes#request_nodes'
  
  root 'home#index'

# The priority is based upon order of creation: first created -> highest priority.
# See how all your routes lay out with "rake routes".

# You can have the root of your site routed with "root"
# root 'welcome#index'

# Example of regular route:
#  get 'products/:id' => 'catalog#view'

# Example of named route that can be invoked with purchase_url(id: product.id)
#  get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

# Example resource route (maps HTTP verbs to controller actions automatically):
#  resources :products

# Example resource route with options:
#  resources :products do
#   member do
#    get 'short'
#    post 'toggle'
#   end
#
#   collection do
#    get 'sold'
#   end
#  end

# Example resource route with sub-resources:
#  resources :products do
#   resources :comments, :sales
#   resource :seller
#  end

# Example resource route with more complex sub-resources:
#  resources :products do
#   resources :comments
#   resources :sales do
#    get 'recent', on: :collection
#   end
#  end

# Example resource route with concerns:
#  concern :toggleable do
#   post 'toggle'
#  end
#  resources :posts, concerns: :toggleable
#  resources :photos, concerns: :toggleable

# Example resource route within a namespace:
#  namespace :admin do
#   # Directs /admin/products/* to Admin::ProductsController
#   # (app/controllers/admin/products_controller.rb)
#   resources :products
#  end

end
