/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />


import quizfeed = require('../lib/quizfeed');


import should = require('should');
import assert = require('assert');

import _ = require('lodash');



describe('quizfeed.Entry', function () {


    let server;

    before(function (done) {
		console.log('before ');
        // server = app.listen(port, function (err, result) {
        //     if (err) {
        //         done(err);
        //     } else {
        //         done();
        //     }
        // });
		done();
    });

    after(function (done) {
        // server.close();
		console.log('done');
        done();
    });


    it('should exist', function (done) {
        let entry: quizfeed.Entry = new quizfeed.Entry('q', 'a');
        done();
    });

    it('should be able to init question and answer', function (done) {
        let entry: quizfeed.Entry = new quizfeed.Entry('q', 'a');
        // assert.equal(entry.question, 'q', 'question not matching ');
        // assert.equal(entry.answer, 'a', 'answer not matching ');

        // assert.equal(entry.toString(), 'hello');
        done();
    });
});





describe('quizfeed.Option', function () {

    it('should exist', function (done) {
        let option: quizfeed.Option = new quizfeed.Option();
        done();
    });

    it('should be able to parse simple options ', function(done) {
        let option: quizfeed.Option = quizfeed.Option.parse('#![hello]');
        // assert.deepEqual(option, new quizfeed.Option('hello', null));
        done();
    });

    it('should throw error when parse empty options ', function(done) {
        // assert.throws(() => {quizfeed.Option.parse('');}, Error);
        done();
    });



    it('should throw error when parse invalid options ', function(done) {
        // assert.throws(() => {quizfeed.Option.parse('#![hello]11');}, Error);
        // assert.throws(() => {quizfeed.Option.parse('abc#![hello]11');}, Error);
        // assert.throws(() => {quizfeed.Option.parse('abc#![]11');}, Error);
        done();
    });

    it('should be able to parse advanced options', function(done) {
        //let option: quizfeed.Option = quizfeed.Option.parse('#![option(test)]');
        // assert.deepEqual(option, new quizfeed.Option('option', 'test'));
        done();
    });



});




describe('quizfeed.Context', function () {


    let server;

    before(function (done) {
		console.log('before ');
        // server = app.listen(port, function (err, result) {
        //     if (err) {
        //         done(err);
        //     } else {
        //         done();
        //     }
        // });
		done();
    });

    after(function (done) {
        // server.close();
		console.log('done');
        done();
    });

	it('should parse swap option', function(done) {
		let context: quizfeed.Context = new quizfeed.Context();

		context.shouldSwap = false;
		context.update('#![swap(true)]');

		assert.equal(context.shouldSwap, true);

		context.update('#![swap(false)]');

		assert.equal(context.shouldSwap, false);

		done();

	});

	it('should parse "title" option', function(done) {

		let context: quizfeed.Context = new quizfeed.Context();

		context.title = 'Sample title';
		context.update('#![title("New title")]');

		assert.equal(context.title, 'New title');

		context.update('#![title("")]');
		assert.equal(context.title, '');
		done();



	});


	it('should parse "separator" option', function(done) {

		let context: quizfeed.Context = new quizfeed.Context();

		context.separator = /abc/;
		context.update('#![separator(" ")]');

		assert.equal(context.separator.source, / /.source);

		context.update('#![separator(/abc/)]');
		assert.equal(context.separator.source, /abc/.source);

		context.update('#![separator($abc)]');
		assert.equal(context.separator.source, /\$abc/.source);




		done();


	});



});



