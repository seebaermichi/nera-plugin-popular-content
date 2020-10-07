# Popular content - Nera plugin
This is a plugin for the static side generator [Nera](https://github.com/seebaermichi/nera) to create list(s) with popular content. It could be used for different puposes, like deciding which content should be shown in a simple list or maybe in a content slider on your homepage or just teasers with content from different pages.  
You can define within the plugins `config/popular-content.yaml` file which properties it should recognize and how it should order the content.  

## Usage
The first thing you need to do is to place this plugin in the `src/plugins` folder of your nera project.  

In addition you need to define which property or properties the plugin should recognize in your markdown files. As an example you could set up the following in the plugins `config/popular-content.yaml` file:
```yaml
properties:
  - meta_property_name: is_home_teaser
    order: desc
```
If you then provide the property `is_home_teaser` with a number (to sort the different elements) in the markdown file you want to add, like this:
```yamle
---
title: Your page title
description: Your page description
is_home_teaser: 1
...
```
The plugin will collect the pages which have `is_home_teaser` in their meta section and provide their meta data in `app.popularContent.is_home_teaser` to your view.  

You can then loop through e.g. `app.popularContent.is_home_teaser` and render it as a list or use it in a teaser markup or what ever you like. Please find two template examples in the plugins `views/` folder.
