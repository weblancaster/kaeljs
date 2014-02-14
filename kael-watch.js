var kael = require('./lib/kael')
    , watch = require('watch')
    , moment = require('moment');

(function(){

    // markdown path folder
    var mdFiles = './markdown/';

    watch.watchTree(mdFiles, function (f, curr, prev) {
        var dateNow = moment().format('MMM Do YY, h:mm:ss a');

        if (typeof f == "object" && prev === null && curr === null) {
          console.log(dateNow, 'Watch markdown files running!');
        } else if (prev === null) {
          console.log(dateNow, 'New markdown file added');
        } else if (curr.nlink === 0) {
          console.log(dateNow, 'Markdown file removed');
        } else {
          console.log(dateNow, 'Markdown file changed');
        }

        kael();

    });

})();