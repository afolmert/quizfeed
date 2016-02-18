/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />
var fs = require('fs');
var utils = require('./utils');
var OPTION_SHOULD_SWAP = 'swap';
var OPTION_SEPARATOR = 'separator';
var OPTION_TITLE = 'title';
function error(filename, lineno, message) {
    console.error('ERROR: ' + filename + ': ' + lineno + ': ' + message);
    process.exit(1);
}
var Option = (function () {
    function Option(name, value) {
        this.name = name;
        this.value = value;
    }
    Option.prototype.toString = function () {
        return "Option " + this.name + ": " + this.value;
    };
    Option.prototype.equals = function (other) {
        return this.name == other.name && this.value == other.value;
    };
    Option.parse = function (input) {
        var result = new Option();
        if (utils.isNullOrWhitespace(input)) {
            throw new Error('Non-empty input expected');
        }
        input = input.trim();
        if (!utils.startsWith(input, '#![') || !utils.endsWith(input, ']')) {
            throw new Error('Invalid syntax: ' + input);
        }
        input = input.substr(3, input.length - 4);
        if (input.indexOf('(') >= 0) {
            var regexp = /^([a-zA-Z]+)\((.+)\)$/;
            var match = regexp.exec(input);
            if (match != null) {
                result.name = match[1];
                result.value = match[2];
            }
            else {
                throw new Error('Cannot parse option: ' + input);
            }
        }
        else {
            result.name = input;
            result.value = null;
        }
        return result;
    };
    return Option;
})();
exports.Option = Option;
var Context = (function () {
    function Context() {
        this.shouldSwap = false;
        this.separator = /\t/;
        this.title = '';
    }
    Context.isContextLine = function (input) {
        return false;
    };
    Context.parseSeparator = function (input) {
        var result;
        input = utils.stripQuotes(input);
        if (utils.startsWith(input, '/') && utils.endsWith(input, '/')) {
            result = new RegExp(input.substr(1, input.length - 2));
        }
        else {
            result = new RegExp(utils.escapeRegExp(input));
        }
        return result;
    };
    Context.prototype.update = function (input) {
        var option = Option.parse(input);
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
    };
    Context.prototype.toString = function () {
        return "Context: title " + this.title + " shouldSwap " + this.shouldSwap + " separator " + this.separator;
    };
    return Context;
})();
exports.Context = Context;
var Entry = (function () {
    function Entry(question, answer) {
        this.question = question;
        this.answer = answer;
    }
    Entry.parse = function (input, context) {
        var parts = input.split(context.separator);
        if (parts.length != 2) {
            throw new Error('Error parsing input ' + input + ' parsed parts are ' + JSON.stringify(parts, null, 2));
        }
        var result = new Entry();
        result.question = parts[0];
        result.answer = parts[1];
        result.title = context.title.slice(0);
        result.shouldSwap = context.shouldSwap;
        return result;
    };
    Entry.prototype.toString = function () {
        return "Entry: " + this.title + ": " + this.question + " " + this.answer + " SWAP: " + this.shouldSwap;
    };
    return Entry;
})();
exports.Entry = Entry;
var Entries = (function () {
    function Entries() {
    }
    Entries.loadLines = function (filepath) {
        var content = fs.readFileSync(filepath, 'utf8');
        var lines = content.split(/\r\n|\n/);
        return lines;
    };
    Entries.loadEntries = function (filepath) {
        var context = new Context();
        if (!filepath) {
            throw new Error('filepath cannot be empty');
        }
        if (!fs.existsSync(filepath)) {
            throw new Error("filepath " + filepath + " is not a file");
        }
        var result = [];
        var lines = this.loadLines(filepath);
        for (var i = 0; i < lines.length; i++) {
            try {
                var line = lines[i];
                if (utils.isNullOrWhitespace(line)) {
                    continue;
                }
                if (line.indexOf('#!') == 0) {
                    context.update(line);
                }
                else if (line.indexOf('#') == 0) {
                }
                else {
                    var entry = Entry.parse(line, context);
                    result.push(entry);
                }
            }
            catch (e) {
                error(filepath, i, e.message);
            }
        }
        return result;
    };
    Entries.buildExportLine = function (title, question, answer) {
        var result = '';
        if (!utils.isNullOrEmpty(title)) {
            result = title + ": " + question + "\t" + answer;
        }
        else {
            result = question + "\t" + answer;
        }
        return result;
    };
    Entries.exportEntries = function (entries) {
        var _this = this;
        var result = '';
        entries.forEach(function (entry) {
            result += _this.buildExportLine(entry.title, entry.question, entry.answer) + '\n';
            if (entry.shouldSwap) {
                result += _this.buildExportLine(entry.title, entry.answer, entry.question) + '\n';
            }
        });
        return result;
    };
    return Entries;
})();
exports.Entries = Entries;