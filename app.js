// TODO
// make this installable package from GitHub
// npm install -g https://afolmert.git.com/quizfeed
// this install quizfeed command which I can use to run
/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/lodash/lodash.d.ts' />
/// <reference path='typings/yargs/yargs.d.ts' />
var fs = require('fs');
var quizfeed = require('./lib/quizfeed');
var utils = require('./lib/utils');
function testLoadEntries(filepath) {
    var entries = quizfeed.Entries.loadEntries(filepath);
}
function processFiles(filepaths, options) {
    var entries = [];
    filepaths.forEach(function (filepath) {
        var tmp = quizfeed.Entries.loadEntries(filepath);
        entries = entries.concat(tmp);
    });
    console.log('Loaded Entries ------------------ ');
    console.log(entries);
    if (options.shuffle) {
        utils.shuffleArray(entries);
    }
    else if (options.sort) {
        entries.sort(function (a, b) { return a.question.localeCompare(b.question); });
    }
    console.log('Output is --------------------------- ');
    -console.log(quizfeed.Entries.exportEntries(entries));
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
