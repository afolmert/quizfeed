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

class Options {
    warnings: boolean;
    swap: boolean;
    shuffle: boolean;
    title: string;
    sort: boolean;

    toString() {
        return JSON.stringify(this);
    }
}



class Program {

    testLoadEntries(filepath: string) {

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


    /**
     * Analyze given entries , generating list of warnings if possible
     */
    analyzeEntries(entries: quizfeed.Entry[]): string[] {

        // check for duplicate questions

        const entriesByQuestion: { [question: string]: quizfeed.Entry[] } = {};

        entries.forEach((entry, idx) => {
            if (entry.question in entriesByQuestion) {
                entriesByQuestion[entry.question].push(entry);
            } else {
                entriesByQuestion[entry.question] = [entry];
            }

        });

        const duplicates: quizfeed.Entry[][] = _.filter(entriesByQuestion, (value, key) => {
            return value.length > 1;
        });


        const warnings: string[] = [];

        duplicates.forEach((entries: quizfeed.Entry[]) => {

            let warning: string = `WARNING: Duplicate question ${entries[0].question} in `;
            warning += _.map(entries, (entry: quizfeed.Entry) => `${entry.sourceFile}: line ${entry.sourceLineNumber}`).join(', ');

            warnings.push(warning);

        });

        return warnings;

}


    processFiles(filepaths: string[], options: Options) {

        let allEntries: quizfeed.Entry[] = [];

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

            if (options.shuffle) {
                utils.shuffleArray(allEntries);
            } else if (options.sort) {
                allEntries.sort((a, b) => a.question.localeCompare(b.question));
            }

            console.log(quizfeed.Entries.exportEntries(allEntries));

            if (options.warnings) {

                const warnings: string[] = this.analyzeEntries(allEntries);
                for (const w of warnings) {
                    console.error(w);
                }
            }
        });

    }
}


function collectFilepaths(argv: any): string[] {

    const result: string[] = [];

    argv._.forEach(arg => {
        if (!fs.existsSync(arg)) {
            console.log(arg + ' is not a file');
            process.exit(1);
        } else {
            result.push(arg);
        }
    });
    return result;
}

function collectOptions(argv: any): Options {
    const result: Options = new Options();
    let options = new Options();
    options.warnings = argv.warnings;
    options.shuffle = argv.shuffle;
    options.swap = argv.swap;
    options.title = argv.title;
    options.sort = argv.sort;
    return result;

}

function main() {

       
    // main program
    const argv = require('yargs')
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
        const p = require('./package.json');
        console.log('version ' + p.version);
        process.exit(1);
    }

    if (!argv._ || argv._.length == 0) {
        console.log('No input files');
        process.exit(1);
    }


    
    const filepaths: string[] = collectFilepaths(argv);
    const options: Options = collectOptions(argv);
    const program = new Program();

    program.processFiles(filepaths, options);

}


