/** @license
 * kael <https://github.com/weblancaster/kael/>
 * Author: Michael Lancaster | MIT License
 * v0.0.3 (2014/01/13)
 */

module.exports = function kael() {
    'use strict';

    var path = require('path');
    var fs = require('fs');
    var exec = require('child_process').exec;
    var marked = require('marked');
    var clc = require('cli-color');
    var moment = require('moment');

    // DB
    var NeDB = require('nedb')
        , pathDB = './db/articles'
        , db = new NeDB({ filename: pathDB, autoload: true });

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

    // default messages
    var messages = {
        initial: 'Initializing process...'
    }

    // folders defined
    var markdownFolder = './markdown/';
    var blogFolder = './blog/';
    var htmlContent;

    /**
     * Responsible to create markdown folder
     * @method configHTMLFolder
     */
    function createMarkdownFolder() {

        if ( !fs.existsSync(markdownFolder) ) {
            fs.mkdirSync(markdownFolder);
            console.log( logSuccess('Default markdown folder saved successfully') );
        } else {
            console.log( logSuccess('Folder: ' + markdownFolder + ' already exists.') );
        }

        createBlogFolder();
    }

    /**
     * Responsible to create blog folder
     * @method createBlogFolder
     */
    function createBlogFolder() {

        if ( !fs.existsSync(blogFolder) ) {
            fs.mkdirSync(blogFolder);
            console.log( logSuccess('Default blog folder saved successfully') );
            // createHTML(folder, fileName);
        } else {
            console.log( logSuccess('Folder: ' + blogFolder + ' already exists.') );
        }

        readMarkdown();
    }

    /**
     * Responsible to go through all markdown files
     * remove the extension and call the method to create new folders
     * also checks if there's a blog folder with the same name already
     * @method readMarkdown
     */
    function readMarkdown() {

        cleanDB();

        fs.readdir(markdownFolder, function(error, data) {
            var articlesLength = data.length;

            if ( error ) {
                console.log( logError('Markdown folder not found!') );
                return false;
            }

            if ( data.length < 1 ) {
                console.log( logWarn('Markdown folder not found. Please add markdown files to the markdown folder.') );
                return false;
            }

            for ( var i = 0, j = data.length; i < j; i++ ) {
                var file = data[i];
                var fileName = file.substring(0, file.indexOf('.'));
                var folder = blogFolder + fileName;

                removeFolder(folder, fileName);
            }
        });
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
     * Responsible to convert markdown file to HTML
     * @method convertFile
     */
    function createHTML(file, folderName) {
        var path = markdownFolder + folderName + '.md';

        fs.readFile(path, function(error, data) {
            var formatted = data.toString();
            var html = marked(formatted);
            var htmlPath = blogFolder + folderName + '/' + folderName + '.html';

            htmlContent = html;

            fs.writeFile(htmlPath, html, function (error) {
                if ( error ) {
                    console.log( logError('Error converting markdown to HTML: ' + error) );
                }
                console.log( logSuccess('File: ' + file + ' converted to HTML') );
            });

            insertDocument(folderName);

        });
    }

    /**
     * Responsible to clean database before
     * insert new documents
     * @method cleanDB
     */
    function cleanDB() {
        fs.writeFile(pathDB, '', function() {
            console.log( logWarn('Database cleaned!') );
        });
    }

    /**
     * Responsible to insert document in the database
     * @method insertDocument
     */
    function insertDocument(fileName) {
        var articleTitle = fileName.replace(/-/g, ' ');
        var pagePath = '/blog/' + fileName + '/' + fileName
            , dateNow = moment().format('MMM Do YY, h:mm:ss a')
            , articleDocument = { 
                title: articleTitle,
                date: dateNow,
                path: fileName,
                html: htmlContent
            };

        db.insert(articleDocument, function (error, newArticle) {
            if ( error ) {
                console.log( logError('Error trying to save article info into the DB: ' + error) );
                return false;
            }

            console.log( logSuccess(articleTitle + ' - saved successfully on database!') );
        });
    }

    /**
     * Responsible to start up the build process
     * @method startUp
     */
    function startUp() {
        // Initial message
        console.log( logNotice(messages.initial) );

        // create markdown folder
        createMarkdownFolder();
    }

    // Initialize build process
    startUp();
}



