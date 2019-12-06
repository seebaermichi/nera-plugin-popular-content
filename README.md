# Popular content - Nera plugin
This is a plugin for the static side generator [nera](https://github.com/seebaermichi/nera) to create a simple popular content list.  
It uses the `createdAt` and the `title` of the meta object of the page.

## Usage
The only thing you need to do is to place this plugin in the `src/plugins` folder of your nera project.  

In addition you should place the property `is_popular` with a number for ordering in the meta section of the markdown file of the page which should be popular.

You can then include the `views/popular-content.pug` of this plugin where ever you want to have the popular content or just loop through the `app.popularContent` array in any view file.
