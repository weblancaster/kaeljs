(function() {
    'use strict';

var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var marked = require('marked');

// set marked module options
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: true,
    sanitize: false,
    smartLists: true,
    smartypants: true
});

// Global var's defined
var markdownFolder = 'markdown/';
var blogFolder = 'blog/';

/**
 * Responsible to go through all markdown files
 * remove the extension and call the method to create new folders
 * also checks if there's a blog folder with the same name already
 * @method readMarkdown
 */

function readMarkdown() {

    fs.readdir(markdownFolder, function(error, data) {
        if ( error ) {
            console.log('Folder "markdown" not found');
            return false;
        }

        for ( var i = 0, j = data.length; i < j; i++ ) {
            var file = data[i];
            var fileName = file.substring(0, file.indexOf('.'));
            var folder = blogFolder + fileName;

            createFolder(folder, fileName);
            createHTML(file, fileName);
        }

    });
}

/**
 * Responsible to create folders with names
 * passed to the method
 * @param folder [folder name]
 * @param file [file name]
 * @method createNewFolder
 */
function createFolder(folder, file) {

    if ( !fs.existsSync(folder) ) {
        fs.mkdirSync(folder);
        console.log('Folder: ' + folder + ' created.');
    } else {
        removeFolder(folder);
    }
}

/**
 * Responsible to remove folder
 * @param  folder [folder name]
 * @method removeFolder
 */
function removeFolder(folder) {
    var command = 'rm -rf ' + folder;
    exec(command, function(error, out) {
        console.log('Folder: ' + folder + ' removed');
    });
}

/**
 * Responsible to convert markdown file to HTML
 * @method convertFile
 */
function createHTML(file, fileName) {
    var path = markdownFolder + file;

    fs.readFile(path, function(error, data) {
        var formatted = data.toString();
        var html = marked(formatted);
        var htmlPath = blogFolder + fileName + '/' + fileName + '.html';

        fs.writeFile(htmlPath, html, function (error) {
            if ( error ) {
                console.log('Error converting markdown to HTML: ' + error);
            }
            console.log('File: ' + file + ' converted to HTML');
        });

    });
}

// Initialize build process
readMarkdown();

})();