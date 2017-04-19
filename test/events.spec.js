'use strict'

const assert = require('assert');
const RedisEvents = require('../index.js');

describe('RedisEvents', () =>
{
    it('#1', done =>
    {
        var result = {
            message : null,
            channel : null
        };

        var events = new RedisEvents();

        events.subscribe('test', (message, channel) =>
        {
            result.message = message;
            result.channel = channel
        })
        .then(() => events.emit('Hello, world!', 'test'))
        .delay(500)
        .finally(() =>
        {
            assert.equal(result.message, 'Hello, world!');
            assert.equal(result.channel, 'test');

            events.unsubscribe('test');
            events.disposeSubscriber();

            done();
        });
    });

    it('#2', done =>
    {
        var result = {
            message : null,
            channel : null,
            pattern : null
        };

        var events = new RedisEvents();

        events.contextify({ test : true });
        events.subscribe('test/*', (message, channel, pattern) =>
        {
            result.message = message;
            result.channel = channel
            result.pattern = pattern;
        })
        .then(() => events.emit({ text : 'Hello, world!' }, 'test/crap'))
        .delay(500)
        .finally(() =>
        {
            assert.equal(result.message.text, 'Hello, world!');
            assert.equal(result.message.test, true);
            assert.equal(result.channel, 'test/crap');
            assert.equal(result.pattern, 'test/*');

            events.unsubscribe('test/*');
            events.unsubscribe();

            events.disposeEmitter();
            events.disposeSubscriber();

            done();
        });
    });

    it('#3', done =>
    {
        var result = {
            message : null,
            channel : null,
            pattern : null
        };

        var events = new RedisEvents();

        events.subscribe('test/*', (message, channel, pattern) =>
        {
            result.message = message;
            result.channel = channel
            result.pattern = pattern;
        })
        .then(() => events.emit('Hello, world!', 'test/crap'))
        .delay(500)
        .tap(() =>
        {
            assert.equal(result.message, 'Hello, world!');
            assert.equal(result.channel, 'test/crap');
            assert.equal(result.pattern, 'test/*');

            result = { };
        })
        .then(() => events.emit('Hello, crap!', 'test/crap/more'))
        .delay(500)
        .finally(() =>
        {
            assert.equal(result.message, 'Hello, crap!');
            assert.equal(result.channel, 'test/crap/more');
            assert.equal(result.pattern, 'test/*');

            events.disposeAll();

            done();
        });
    });

    it('#5', done =>
    {
        var result = {
            message : null,
            channel : null
        };

        var events = new RedisEvents();

        events.subscribe('test', (message, channel) =>
        {
            result.message = message;
            result.channel = channel
        })
        .then(() => events.emit('Hello, world!', 'test/different'))
        .delay(500)
        .finally(() =>
        {
            assert.equal(result.message, undefined);
            assert.equal(result.channel, undefined);

            events.disposeSubscriber();
            events.unsubscribe('test');

            done();
        });
    });

    it('#6', done =>
    {
        var error;

        var events = new RedisEvents();

        events.subscribe(null, (message, channel) =>
        {
            result.message = message;
            result.channel = channel
        })
        .catch(e => error = e)
        .finally(() =>
        {
            assert.notEqual(error, undefined);
            events.disposeAll();

            done();
        });
    });

    it('#7', done =>
    {
        var error;
        var events = new RedisEvents();

        events.subscribe('test', (message, channel) =>
        {
            result.message = message;
            result.channel = channel
        })
        .then(() =>
        {
            var innerResult = true;

            return events.subscribe('test', (message, channel) => { })
            .then(success => innerResult = success)
            .finally(() => assert.equal(innerResult, false))
        })
        .then(() => events.emit('Hello, world!'))
        .catch(e => error = e)
        .finally(() =>
        {
            assert.notEqual(error, undefined);
            events.disposeAll();

            done();
        });
    });

    it('#8', done =>
    {
        var result = {
            message : null,
            channel : null
        };

        var events = new RedisEvents({ defaultEmitChannel : 'test' });

        events.subscribe('test', (message, channel) =>
        {
            result.message = message;
            result.channel = channel
        })
        .then(() => events.emit('Hello, world!'))
        .delay(500)
        .finally(() =>
        {
            assert.equal(result.message, 'Hello, world!');
            assert.equal(result.channel, 'test');

            events.unsubscribe('test');
            events.disposeSubscriber();

            done();
        });
    });
});
