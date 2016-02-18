/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
var utils = require('../lib/utils');
var assert = require('assert');
describe('utils.shuffleArray', function () {
    it('changes items order  ', function (done) {
        var origArr = [1, 2, 3, 4, 5, 6];
        var inputArr = origArr.slice(0);
        var arr = utils.shuffleArray(inputArr);
        assert.deepEqual(arr, inputArr);
        var sameCount = 0;
        for (var i = 1; i < origArr.length; i++) {
            assert.ok(arr.indexOf(origArr[i]) >= 0, 'Expected element ' + origArr[i] + 'missing ');
            if (arr.indexOf(origArr[i]) == i) {
                sameCount++;
            }
        }
        assert.ok(sameCount < origArr.length, 'At least one item was shuffled');
        assert.equal(arr.length, origArr.length, 'Length do not match');
        done();
    });
});
describe('utils.endsWith', function () {
    it('should return true for valid cases', function (done) {
        assert.equal(utils.endsWith("sample'", "'"), true);
        assert.equal(utils.endsWith("abcd", "cd"), true);
        done();
    });
    it('should return false for invalid cases', function (done) {
        assert.equal(utils.endsWith("sample'", "\""), false);
        assert.equal(utils.endsWith("abcd", "a"), false);
        done();
    });
    it('should return true for empty suffixes', function (done) {
        assert.equal(utils.endsWith("test", ""), true);
        done();
    });
    it('should return false for empty strings', function (done) {
        assert.equal(utils.endsWith("", "a"), false);
        done();
    });
});
describe('utils.startsWith', function () {
    it('should return true for valid cases', function (done) {
        assert.equal(utils.startsWith("'sample'", "'"), true);
        assert.equal(utils.startsWith("abcd", "ab"), true);
        done();
    });
    it('should return false for invalid cases', function (done) {
        assert.equal(utils.startsWith("'sample", "\""), false);
        assert.equal(utils.startsWith("abcd", "d"), false);
        done();
    });
    it('should return true for empty suffixes', function (done) {
        assert.equal(utils.startsWith("test", ""), true);
        done();
    });
    it('should return false for empty strings', function (done) {
        assert.equal(utils.startsWith("", "a"), false);
        done();
    });
});
describe('utils.stripQuotes', function () {
    it('should strip single quotes', function (done) {
        assert.equal(utils.stripQuotes("'ala'"), "ala");
        done();
    });
    it('should strip multiple quotes', function (done) {
        assert.equal(utils.stripQuotes("'\"'ala'\"'"), "ala");
        done();
    });
    it('should strip double quotes', function (done) {
        assert.equal(utils.stripQuotes("\"ala\""), "ala");
        done();
    });
    it('should ignore empty strings', function (done) {
        assert.equal(utils.stripQuotes(""), "");
        done();
    });
    it('should ignore non-matching quotes', function (done) {
        assert.equal(utils.stripQuotes("'ala\""), "'ala\"");
        done();
    });
});
