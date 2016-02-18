/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />
/// <reference path='../typings/async/async.d.ts' />




import fs = require('fs');
import _ = require('lodash');
import async = require('async');

import utils = require('./utils');


const OPTION_SHOULD_SWAP: string = 'swap';

const OPTION_SEPARATOR: string = 'separator';

const OPTION_TITLE: string = 'title';


export class Option {
    public name: string;
    public value: string;

    constructor(name?: string, value?: string) {
        this.name = name;
        this.value = value;
    }

    toString() {
        return `Option ${this.name}: ${this.value}`;
    }

    equals(other: Option): boolean {
        return this.name == other.name && this.value == other.value;

    }


    static parse(input: string): Option {

        let result: Option = new Option();

        if (utils.isNullOrWhitespace(input)) {
            throw new Error('Non-empty input expected');
        }

        input = input.trim();

        if (!utils.startsWith(input, '#![') || !utils.endsWith(input, ']')) {
            throw new Error('Invalid syntax: ' + input);
        }

        input = input.substr(3, input.length - 4);

        if (input.indexOf('(') >= 0) {

            let regexp: RegExp = /^([a-zA-Z]+)\((.+)\)$/;

            let match = regexp.exec(input);

            if (match != null) {
                result.name = match[1];
                result.value = match[2];
            } else {
                throw new Error('Cannot parse option: ' + input);
            }

        } else {
            result.name = input;
            result.value = null;

        }
        return result;

    }

}



export class Context {
    public shouldSwap: boolean;
    public separator: RegExp;
    public title: string;

    constructor() {
        this.shouldSwap = false;
        this.separator = /\t/;
        this.title = '';
    }

    static isContextLine(input: string): boolean {
        return false;

    }

    static parseSeparator(input: string): RegExp {

        let result: RegExp;
        input = utils.stripQuotes(input);
        if (utils.startsWith(input, '/') && utils.endsWith(input, '/')) {
            result = new RegExp(input.substr(1, input.length - 2));
        } else {
            result = new RegExp(utils.escapeRegExp(input));
        }
        return result;

    }

    update(input: string) {

        let option: Option = Option.parse(input);

        switch (option.name) {
            case OPTION_TITLE:
                this.title = utils.stripQuotes(option.value);
                break;
            case OPTION_SEPARATOR:
                this.separator = Context.parseSeparator(option.value);
                break;
            case OPTION_SHOULD_SWAP:
                this.shouldSwap = JSON.parse(option.value);
        }
    }


    toString(): string {
        return `Context: title ${this.title} shouldSwap ${this.shouldSwap} separator ${this.separator}`;

    }
}





export class Entry {
    public title: string;
    public question: string;
    public answer: string;
    public shouldSwap: boolean;

    public sourceFile: string;
    public sourceLineNumber: number;

    constructor(question?: string, answer?: string) {
        this.question = question;
        this.answer = answer;
    }


    static parse(input: string, context: Context): Entry {

        let parts: string[] = input.split(context.separator);

        if (parts.length != 2) {
            throw new Error('Error parsing input ' + input + ' parsed parts are ' + JSON.stringify(parts, null, 2));
        }

        let result: Entry = new Entry();
        result.question = parts[0];
        result.answer = parts[1];
        result.title = context.title.slice(0);
        result.shouldSwap = context.shouldSwap;


        return result;

    }

    toString() {
        return JSON.stringify(this);
    }
}



export class Entries {

    static loadLines(filepath: string, callback: (err: any, lines: string[]) => void) {
        fs.readFile(filepath, (err, buffer) => {
            if (err) {
                return callback(err, null);
            }

            let lines: string[] = buffer.toString('utf8').split(/\r\n|\n/);
            callback(null, lines);

        });

    }



    static loadEntries(filepath: string, callback: (error: any, entries: Entry[]) => void): void {

        let context: Context = new Context();

        if (!filepath) {
            return callback(new Error('Filepath cannot be empty'), null);
        }
        fs.exists(filepath, (exists: boolean) => {
            if (!exists) {
                return callback(new Error('Filepath ' + filepath + ' does not exist'), null);
            }

            this.loadLines(filepath, (err: any, lines: string[]) => {

                if (err) {
                    return callback(err, null);
                }

                let result: Entry[] = [];

                for (let i = 0; i < lines.length; i++) {
                    try {
                        let line: string = lines[i];
                        if (utils.isNullOrWhitespace(line)) {
                            continue;
                        }
                        if (line.indexOf('#!') == 0) {
                            context.update(line);
                        } else if (line.indexOf('#') == 0) {
                            // comment ignoring

                        } else {
                            let entry: Entry = Entry.parse(line, context);
                            entry.sourceLineNumber = i;
                            entry.sourceFile = filepath;
                            result.push(entry);
                        }

                    } catch (e) {
                        return callback(new Error(`${filepath} line ${i}: ${e.message}`), null);
                    }
                }
                callback(null, result);
            });
        });

    }



    static buildExportLine(title: string, question: string, answer: string): string {
        let result: string = '';
        if (!utils.isNullOrEmpty(title)) {
            result = `${title}: ${question}\t${answer}`;
        } else {
            result = `${question}\t${answer}`;
        }
        return result;
    }

    static exportEntries(entries: Entry[]): string {

        let result: string = '';

        entries.forEach(entry => {

            result += this.buildExportLine(entry.title, entry.question, entry.answer) + '\n';

            if (entry.shouldSwap) {
                result += this.buildExportLine(entry.title, entry.answer, entry.question) + '\n';
            }
        });
        return result;


    }

}