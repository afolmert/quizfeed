/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />




import fs = require('fs');
import _ = require('lodash');


import utils = require('./utils');


const OPTION_SHOULD_SWAP: string = 'swap';

const OPTION_SEPARATOR: string = 'separator';

const OPTION_TITLE: string = 'title';


function error(filename: string, lineno: number, message: string) {
    console.error('ERROR: ' + filename + ': ' + lineno + ': ' + message);
    process.exit(1);

}

function warning(filename: string, lineno: number, message: string) {
    console.error('WARNING: ' + filename + ': ' + lineno + ': ' + message);

}


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

        var result: Option = new Option();

        if (utils.isNullOrWhitespace(input)) {
            throw new Error('Non-empty input expected');
        }

        input = input.trim();

        if (!utils.startsWith(input, '#![') || !utils.endsWith(input, ']')) {
            throw new Error('Invalid syntax: ' + input);
        }

        input = input.substr(3, input.length - 4);

        if (input.indexOf('(') >= 0) {

            var regexp: RegExp = /^([a-zA-Z]+)\((.+)\)$/;

            var match = regexp.exec(input);

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

        var result: RegExp;
        input = utils.stripQuotes(input);
        if (utils.startsWith(input, '/') && utils.endsWith(input, '/')) {
            result = new RegExp(input.substr(1, input.length - 2));
        } else {
            result = new RegExp(utils.escapeRegExp(input));
        }
        return result;

    }

    update(input: string) {

        var option: Option = Option.parse(input);

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

    constructor(question?: string, answer?: string) {
        this.question = question;
        this.answer = answer;
    }


    static parse(input: string, context: Context): Entry {

        var parts: string[] = input.split(context.separator);

        if (parts.length != 2) {
            throw new Error('Error parsing input ' + input + ' parsed parts are ' + JSON.stringify(parts, null, 2));
        }

        var result: Entry = new Entry();
        result.question = parts[0];
        result.answer = parts[1];
        result.title = context.title.slice(0);
        result.shouldSwap = context.shouldSwap;


        return result;

    }

    toString() {
        return `Entry: ${this.title}: ${this.question} ${this.answer} SWAP: ${this.shouldSwap}`;
    }
}



export class Entries {

    static loadLines(filepath: string): string[] {
        var content: string = fs.readFileSync(filepath, 'utf8');

        var lines: string[] = content.split(/\r\n|\n/);
        return lines;
    }



    static loadEntries(filepath: string): Entry[] {

        var context: Context = new Context();

        if (!filepath) {
            throw new Error('filepath cannot be empty');
        }
        if (!fs.existsSync(filepath)) {
            throw new Error(`filepath ${filepath} is not a file`);
        }

        var result: Entry[] = [];
        var lines: string[] = this.loadLines(filepath);

        for (var i = 0; i < lines.length; i++) {
            try {
                var line: string = lines[i];
                if (utils.isNullOrWhitespace(line)) {
                    continue;
                }
                if (line.indexOf('#!') == 0) {
                    context.update(line);
                } else if (line.indexOf('#') == 0) {
                    // comment ignoring

                } else {
                    var entry: Entry = Entry.parse(line, context);
                    result.push(entry);
                }

            } catch (e) {
                error(filepath, i, e.message);
            }
        }
        return result;
    }


    static buildExportLine(title: string, question: string, answer: string): string {
        var result: string = '';
        if (!utils.isNullOrEmpty(title)) {
            result = `${title}: ${question}\t${answer}`;
        } else {
            result = `${question}\t${answer}`;
        }
        return result;
    }

    static exportEntries(entries: Entry[]): string {

        var result: string = '';

        entries.forEach(entry => {

            result += this.buildExportLine(entry.title, entry.question, entry.answer) + '\n';

            if (entry.shouldSwap) {
                result += this.buildExportLine(entry.title, entry.answer, entry.question) + '\n';
            }

        });

        return result;


    }

}