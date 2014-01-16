/** @license
 * kael <https://github.com/weblancaster/kael/>
 * Author: Michael Lancaster | MIT License
 * v0.0.2 (2014/01/13)
 */

(function() {
    'use strict';

var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var marked = require('marked');
var clc = require('cli-color');
var readline = require('readline');

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

// default color messages
var logError = clc.red.bold;
var logWarn = clc.yellow;
var logNotice = clc.blue;
var logSuccess = clc.green;

// set readline for CLI
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// default messages
var messages = {
    initial: 'Initializing process...',
    markdownIn: 'Please enter the name of the folder where the markdown files are saved. If empty or answered as no it will use default (markdown).',
    htmlIn: 'Please enter the name of the folder where the HTML will be generated. If empty or answered as no it will use default (blog).'
}

// Global var's defined
var markdownFolder;
var blogFolder;

/**
 * Responsible to config the markdown folder
 * @method configHTMLFolder
 */
function configMarkdownFolder() {
    // Markdown default message
    console.log( logWarn(messages.markdownIn) );

    rl.question('Do you want to set a new folder for your markdown files? (folder name or no): ', function (answer) {
        console.log('input ' + typeof answer + answer);

        if ( answer === 'no' || answer === '' ) {
            markdownFolder = 'markdown/';
            console.log( logSuccess('Default folder markdown saved successfully') );
        } else {
            markdownFolder = answer + '/';
            console.log( logSuccess('Folder ' + answer +' saved successfully') );
        }

        // config blog folder
        configHTMLFolder();
    });
}

/**
 * Responsible to config the blog folder
 * @method configHTMLFolder
 */
function configHTMLFolder() {
    // HTML default message
    console.log( logWarn(messages.htmlIn) );

    rl.question('Do you want to set a new folder for your generated HTML files? (folder name or no): ', function (answer) {
        if ( answer === 'no' || answer === '' ) {
            blogFolder = 'blog/';
            console.log( logSuccess('default folder blog saved successfully') );
        } else {
            blogFolder = answer + '/';
            console.log( logSuccess('Folder ' + answer +' saved successfully') );
        }

        // start build markdowns
        readMarkdown();
    });
}

/**
 * Responsible to go through all markdown files
 * remove the extension and call the method to create new folders
 * also checks if there's a blog folder with the same name already
 * @method readMarkdown
 */
function readMarkdown() {

    fs.readdir(markdownFolder, function(error, data) {
        if ( error ) {
            console.log( logError('Folder which contains the markdown files not found') );
            return false;
        }

        for ( var i = 0, j = data.length; i < j; i++ ) {
            var file = data[i];
            var fileName = file.substring(0, file.indexOf('.'));
            var folder = blogFolder + fileName;

            removeFolder(folder, fileName);
        }

        rl.close();
    });
}

/**
 * Responsible to create folders with names
 * passed to the method
 * @param folder [folder name]
 * @param file [file name]
 * @method createNewFolder
 */
function createFolder(folder, fileName) {

    if ( !fs.existsSync(folder) ) {
        fs.mkdirSync(folder);
        console.log( logWarn('Folder: ' + folder + ' created.') );
        createHTML(folder, fileName);
    }
}

/**
 * Responsible to remove folder
 * @param  folder [folder name]
 * @method removeFolder
 */
function removeFolder(folder, fileName) {
    var command = 'rm -rf ' + folder;
    exec(command, function(error, out) {
        console.log( logWarn('Folder: ' + folder + ' removed') );
        createFolder(folder, fileName);
    });
}

/**
 * Responsible to convert markdown file to HTML
 * @method convertFile
 */
function createHTML(file, folderName) {
    var path = markdownFolder + folderName + '.md';

    fs.readFile(path, function(error, data) {
        var formatted = data.toString();
        var html = marked(formatted);
        var htmlPath = blogFolder + folderName + '/' + folderName + '.html';

        fs.writeFile(htmlPath, html, function (error) {
            if ( error ) {
                console.log( logError('Error converting markdown to HTML: ' + error) );
            }
            console.log( logSuccess('File: ' + file + ' converted to HTML') );
        });

    });
}

/**
 * Responsible to start up the build process
 * @method startUp
 */
function startUp() {
    // Initial message
    console.log( logSuccess(messages.initial) );

    // config markdown folder
    configMarkdownFolder();
}

// Initialize build process
startUp();

})();