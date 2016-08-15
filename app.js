// TODO
// make this installable package from GitHub
"use strict";
// npm install -g https://afolmert.git.com/quizfeed
// this install quizfeed command which I can use to run
/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/lodash/lodash.d.ts' />
/// <reference path='typings/yargs/yargs.d.ts' />
/// <reference path='typings/async/async.d.ts' />
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var quizfeed = require('./lib/quizfeed');
var utils = require('./lib/utils');
var Options = (function () {
    function Options() {
    }
    Options.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Options;
}());
var Program = (function () {
    function Program() {
    }
    Program.prototype.testLoadEntries = function (filepath) {
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
    };
    /**
     * Analyze given entries , generating list of warnings if possible
     */
    Program.prototype.analyzeEntries = function (entries) {
        // check for duplicate questions
        var entriesByQuestion = {};
        entries.forEach(function (entry, idx) {
            if (entry.question in entriesByQuestion) {
                entriesByQuestion[entry.question].push(entry);
            }
            else {
                entriesByQuestion[entry.question] = [entry];
            }
        });
        var duplicates = _.filter(entriesByQuestion, function (value, key) {
            return value.length > 1;
        });
        var warnings = [];
        duplicates.forEach(function (entries) {
            var warning = "WARNING: Duplicate question " + entries[0].question + " in ";
            warning += _.map(entries, function (entry) { return (entry.sourceFile + ": line " + entry.sourceLineNumber); }).join(', ');
            warnings.push(warning);
        });
        return warnings;
    };
    Program.prototype.processFiles = function (filepaths, options) {
        var _this = this;
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
            if (options.shuffle) {
                utils.shuffleArray(allEntries);
            }
            else if (options.sort) {
                allEntries.sort(function (a, b) { return a.question.localeCompare(b.question); });
            }
            console.log(quizfeed.Entries.exportEntries(allEntries));
            if (options.warnings) {
                var warnings = _this.analyzeEntries(allEntries);
                for (var _i = 0, warnings_1 = warnings; _i < warnings_1.length; _i++) {
                    var w = warnings_1[_i];
                    console.error(w);
                }
            }
        });
    };
    return Program;
}());
function collectFilepaths(argv) {
    var result = [];
    argv._.forEach(function (arg) {
        if (!fs.existsSync(arg)) {
            console.log(arg + ' is not a file');
            process.exit(1);
        }
        else {
            result.push(arg);
        }
    });
    return result;
}
function collectOptions(argv) {
    var result = new Options();
    var options = new Options();
    options.warnings = argv.warnings;
    options.shuffle = argv.shuffle;
    options.swap = argv.swap;
    options.title = argv.title;
    options.sort = argv.sort;
    return result;
}
function main() {
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
        .alias('w', 'warnings')
        .alias('v', 'version')
        .describe('v', 'Shows quizfeed version')
        .describe('shuffle', 'Shuffle output order')
        .describe('sort', 'Sort output order')
        .describe('warnings', 'Show warnings')
        .boolean('warnings')
        .boolean('sort')
        .boolean('shuffle')
        .boolean('version')
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
    var filepaths = collectFilepaths(argv);
    var options = collectOptions(argv);
    var program = new Program();
    program.processFiles(filepaths, options);
}
