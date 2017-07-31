'use strict'

const extend = require('extend');
const configService = require('ocbesbn-config');
const Promise = require('bluebird');
const redis = require('redis');
const Logger = require('ocbesbn-logger');

/**
 * Module simplifying access to the publish/subscribe system provided by Redis.
 * @requires redis
 * @requires extend
 * @requires ocbesbn-config
 * @requires bluebird
 */

/**
 * Class providing publishing and subscribing Redis events.
 * @param {object} config - For a list of possible configuration values see [DefaultConfig]{@link DefaultConfig}.
 * @constructor
 */
var RedisEvents = function(config)
{
    this.config = extend(true, { }, RedisEvents.DefaultConfig, config);
    this.subscriptions = { };
    this.subscriber = null;
    this.emitter = null;
}

/**
 * This methods allows you to subscribe to one or more event channels. A *channel* can either be a full name of a
 * channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub). A *channel* or pattern can only be
 * subscribed once.
 *
 * Depending on whenever a full *channel* name or a channel pattern is passed, the *callback* registered
 * for the channel gets called with a different set of input parameters. Full channels get called with two
 * parameters (message, channel), patterns get called with three parameters (message, channel, pattern).
 *
 * @param {string} channel - Full name of a channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub).
 * @param {function} callback - Function to be called when a message for a channel arrives.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html} resolving with true if the subscription succeeded. Otherwise false or an error.
 */
RedisEvents.prototype.subscribe = function(channel, callback)
{
    if(channel && !this.hasSubscription(channel))
    {
        var config = this.config;
        var channelIsPattern = channel.indexOf('*') > -1;

        if(!this.subscriber)
        {
            this.subscriber = getNewClient(config).then(client =>
            {
                client.on('pmessage', (pattern, channel, message) => this.subscriptions[pattern](message && config.parser(message), channel, pattern));
                client.on('message', (channel, message) => this.subscriptions[channel](message && config.parser(message), channel));

                return client;
            });
        }

        return this.subscriber.then(client =>
        {
            this.subscriptions[channel] = callback;

            if(channelIsPattern)
                client.psubscribe(channel);
            else
                client.subscribe(channel);

            return true;
        });
    }
    else if(!channel)
    {
        return Promise.reject(new Error('Could not subscribe without a valid channel name.'));
    }
    else
    {
        return Promise.resolve(false);
    }
}

/**
 * This method allows you to unsubscribe from a previous subscribed *channel* or pattern.
 * @param {string} channel - Full name of a channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub).
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html} resolving with true or false.
 */
RedisEvents.prototype.unsubscribe = function(channel)
{
    if(channel)
    {
        if(this.hasSubscription(channel))
        {
            var channelIsPattern = channel.indexOf('*') > -1;

            if(channelIsPattern)
                return this.subscriber.then(client => client.punsubscribe(channel)).then(() => true);
            else
                return this.subscriber.then(client => client.unsubscribe(channel)).then(() => true);
        }
    }

    return Promise.resolve(false);
}

/**
 * Method for releasing all subscriptions and closing the connection to the Redis server.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html} resolving with true or false if there was no active connection.
 */
RedisEvents.prototype.disposeSubscriber = function()
{
    if(this.subscriber)
    {
        this.subscriptions = { };
        return this.subscriber.then(client => client.quit()).then(() => this.subscriber = null).then(() => true);
    }

    return Promise.resolve(false);
}

/**
 * Method raising an event on the passed *channel*. The *message* sent can be any serializable object. If the
 * instance of RedisEvents was constructed with a context or extended using the [contextify()]{@link RedisEvents#contextify}
 * method and the *message* parameter contains an object, the message gets extended with this context before
 * the event is raised.
 *
 * You might want to leave the *channel* parameter empty if the instance of RedisEvents was constructed passing
 * the defaultEmitChannel parameter found at [DefaultConfig]{@link DefaultConfig}.
 *
 * @param {object} message - JSON compatible JavaScript object.
 * @param {string} channel - Full name of the channe the event should be published at.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html} resolving with true when the event was published or rejecting with an error.
 */
RedisEvents.prototype.emit = function(message, channel)
{
    var config = this.config;
    channel = channel || config.defaultEmitChannel;

    if(channel)
    {
        var messageString = '';

        if(typeof message === 'object' && config.context)
            messageString = config.serializer(extend(true, { }, config.context, message));
        else
            messageString = config.serializer(message);

        if(!this.emitter)
            this.emitter = getNewClient(config);

        return this.emitter.then(client => client.publish(channel, messageString)).then(() => true);
    }
    else
    {
        return Promise.reject(new Error('Message could not be published without a valid channel name.'));
    }
}

/**
 * Method for closing the publishing connection to the Redis server.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html} resolving with true or false if there was no active connection.
 */
RedisEvents.prototype.disposeEmitter = function()
{
    if(this.emitter)
        return this.emitter.then(client => client.quit()).then(() => this.emitter = null).then(() => true);

    return Promise.resolve(false);
}

/**
 * Releases all subscriptions, publishing channels and Redis connections.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html} resolving with two results.
 */
RedisEvents.prototype.disposeAll = function()
{
    return Promise.all([ this.disposeSubscriber(), this.disposeEmitter() ]);
}

/**
 * Allows adding a default context to every event emitted if the message passed to the [emit()]{@link RedisEvents#emit}
 * method already is an object. You may also want to construct an instance of RedisEvents by passing the context
 * parameter to the constructor. For further information have a look at [DefaultConfig]{@link DefaultConfig}.
 */
RedisEvents.prototype.contextify = function(context)
{
    this.config.context = context || { };
}

/**
 * Checks whenever the passed *channel* or pattern already has an active subscription from the
 * current instance of RedisEvents. The *channel* can either be a full name of a
 * channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub).
 * @returns {boolean} Returns true if the *channel* is already registered; otherwise false.
 */
RedisEvents.prototype.hasSubscription = function(channel)
{
    return typeof this.subscriptions[channel] === 'function';
}

/**
 * Static object representing a default configuration set.
 *
 * @property {object} serializer - Function to use for serializing messages in order to send them.
 * @property {object} parser - Function to use for deserializing messages received.
 * @property {object} defaultEmitChannel - Full name of a channel to emit events to if the channel is not passed to the [emit()]{@link RedisEvents#emit} method.
 * @property {object} consul - Object for configuring consul related parameters.
 * @property {object} consul.host - Hostname of a consul server.
 * @property {object} consul.redisServiceName - Name of the enpoint for the Redis server in consul.
 * @property {object} consul.redisPasswordKey - Consul configuration key for Redis authorisation. Might be null or false if not desired to be used.
 * @property {object} context - Optional context object to automatically extend emitted messages.
 */
RedisEvents.DefaultConfig = {
    serializer : JSON.stringify,
    parser : JSON.parse,
    defaultEmitChannel : null,
    consul : {
        host : 'consul',
        redisServiceName  : 'redis',
        redisPasswordKey : 'redis/password'
    },
    context : {
    }
}

function getNewClient(config)
{
    var logger = new Logger({ context : { serviceName : configService.serviceName } });

    return configService.init({ host : config.consul.host }).then(consul =>
    {
        return Promise.props({
            ep : consul.getEndPoint(config.consul.redisServiceName),
            password : config.consul.redisPasswordKey && consul.get(config.consul.redisPasswordKey)
        });
    })
    .then(props =>
    {
        return new Promise((resolve, reject) =>
        {
            var client = redis.createClient({
                host : props.ep.host,
                port : props.ep.port,
                password : props.password
            });

            client.on('ready', () => resolve(client));
            client.on('error', err => reject(err));
            client.on('retry_strategy', info => 1000);
        });
    })
    .catch(err =>
    {
        logger.error('An error occured in RedisEvents: %j', err.message);
        throw err;
    });
}

module.exports = RedisEvents;
