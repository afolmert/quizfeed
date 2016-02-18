// TODO
// make this installable package from GitHub
// npm install -g https://afolmert.git.com/quizfeed
// this install quizfeed command which I can use to run
/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/lodash/lodash.d.ts' />
/// <reference path='typings/yargs/yargs.d.ts' />
/// <reference path='typings/async/async.d.ts' />
var fs = require('fs');
var async = require('async');
var quizfeed = require('./lib/quizfeed');
var utils = require('./lib/utils');
function testLoadEntries(filepath) {
    quizfeed.Entries.loadEntries(filepath, function (error, entries) {
        if (error) {
            console.log('Error occurred ');
            console.log('Error: ' + error.message);
        }
        else {
            console.log('Entries loaded fine ');
            console.log(entries);
        }
    });
}
function processFiles(filepaths, options) {
    var allEntries = [];
    async.each(filepaths, function (filepath, callback) {
        quizfeed.Entries.loadEntries(filepath, function (error, entries) {
            if (error) {
                return callback(error);
            }
            allEntries = allEntries.concat(entries);
            callback(null);
        });
    }, function (error) {
        if (error) {
            console.log('ERROR ' + error.message);
            process.exit(1);
        }
        console.log('Loaded Entries ------------------ ');
        console.log(allEntries);
        if (options.shuffle) {
            utils.shuffleArray(allEntries);
        }
        else if (options.sort) {
            allEntries.sort(function (a, b) { return a.question.localeCompare(b.question); });
        }
        console.log('Output is --------------------------- ');
        console.log(quizfeed.Entries.exportEntries(allEntries));
    });
}
// main program
var argv = require('yargs')
    .usage('Usage: quizfeed [options] [file...]')
    .example('quizfeed --swap --title "German words" file.txt', 'generates quiz for entries in given file.txt')
    .alias('s', 'swap')
    .describe('s', 'Swap questions with answers')
    .alias('t', 'title')
    .describe('t', 'Sets title for all generated entries')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .describe('v', 'Shows quizfeed version')
    .describe('shuffle', 'Shuffle output order')
    .describe('sort', 'Sort output order')
    .argv;
if (argv.v) {
    var p = require('./package.json');
    console.log('version ' + p.version);
    process.exit(1);
}
if (!argv._ || argv._.length == 0) {
    console.log('No input files');
    process.exit(1);
}
var filepaths = [];
argv._.forEach(function (arg) {
    if (!fs.existsSync(arg)) {
        console.log(arg + ' is not a file');
        process.exit(1);
    }
});
processFiles(argv._, argv);
