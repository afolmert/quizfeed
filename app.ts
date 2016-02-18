// TODO
// make this installable package from GitHub

// npm install -g https://afolmert.git.com/quizfeed
// this install quizfeed command which I can use to run


/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/lodash/lodash.d.ts' />
/// <reference path='typings/yargs/yargs.d.ts' />
/// <reference path='typings/async/async.d.ts' />

import fs = require('fs');
import _ = require('lodash');
import async = require('async');

import quizfeed = require('./lib/quizfeed');


import utils = require('./lib/utils');




function testLoadEntries(filepath: string) {
    quizfeed.Entries.loadEntries(filepath, (error: any, entries: quizfeed.Entry[]) => {
        if (error) {
            console.log('Error occurred ');
            console.log('Error: ' + error.message);
        } else {
            console.log('Entries loaded fine ');
            console.log(entries);
        }
    });

}






function processFiles(filepaths: string[], options: any) {

    var allEntries: quizfeed.Entry[] = [];

    async.each(filepaths, (filepath: string, callback: ErrorCallback) => {

        quizfeed.Entries.loadEntries(filepath, (error: any, entries: quizfeed.Entry[]) => {
            if (error) {
                return callback(error);
            }
            allEntries = allEntries.concat(entries);
            callback(null);
        });

    },
    (error: any) => {
        if (error) {
            console.log('ERROR ' + error.message);
            process.exit(1);
        }

        console.log('Loaded Entries ------------------ ');
        console.log(allEntries);

        if (options.shuffle) {
            utils.shuffleArray(allEntries);
        } else if (options.sort) {
            allEntries.sort((a, b) => a.question.localeCompare(b.question));
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



var filepaths: string[] = [];

argv._.forEach(arg => {
    if (!fs.existsSync(arg)) {
        console.log(arg + ' is not a file');
        process.exit(1);
    }
});


processFiles(argv._, argv);
