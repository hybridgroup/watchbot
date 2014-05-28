require 'date'

activate :directory_indexes
activate :neat
activate :livereload

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

configure :build do
end

helpers do
  def menu_item(path)
    properties = {:href => "/#{path}", :class => "item"}

    if current_page.path == path
      properties[:class] = "active item"
    end

    properties
  end

  def copyright_years
    "2010 - #{Date.today.year}"
  end
end
