<a name="RedisEvents"></a>

## RedisEvents
**Kind**: global class  

* [RedisEvents](#RedisEvents)
    * [new RedisEvents(config)](#new_RedisEvents_new)
    * _instance_
        * [.subscribe(channel, callback)](#RedisEvents+subscribe) ⇒ <code>Promise</code>
        * [.unsubscribe(channel)](#RedisEvents+unsubscribe) ⇒ <code>Promise</code>
        * [.disposeSubscriber()](#RedisEvents+disposeSubscriber) ⇒ <code>Promise</code>
        * [.emit(message, channel)](#RedisEvents+emit) ⇒ <code>Promise</code>
        * [.disposeEmitter()](#RedisEvents+disposeEmitter) ⇒ <code>Promise</code>
        * [.disposeAll()](#RedisEvents+disposeAll) ⇒ <code>Promise</code>
        * [.contextify()](#RedisEvents+contextify)
        * [.hasSubscription()](#RedisEvents+hasSubscription) ⇒ <code>boolean</code>
    * _static_
        * [.DefaultConfig](#RedisEvents.DefaultConfig)

<a name="new_RedisEvents_new"></a>

### new RedisEvents(config)
Class providing publishing and subscribing Redis events.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | For a list of possible configuration values see [DefaultConfig](DefaultConfig). |

<a name="RedisEvents+subscribe"></a>

### redisEvents.subscribe(channel, callback) ⇒ <code>Promise</code>
This methods allows you to subscribe to one or more event channels. A *channel* can either be a full name of a
channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub). A *channel* or pattern can only be
subscribed once.

Depending on whenever a full *channel* name or a channel pattern is passed, the *callback* registered
for the channel gets called with a different set of input parameters. Full channels get called with two
parameters (message, channel), patterns get called with three parameters (message, channel, pattern).

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>Promise</code> - [Promise](http://bluebirdjs.com/docs/api-reference.html) resolving with true if the subscription succeeded. Otherwise false or an error.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Full name of a channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub). |
| callback | <code>function</code> | Function to be called when a message for a channel arrives. |

<a name="RedisEvents+unsubscribe"></a>

### redisEvents.unsubscribe(channel) ⇒ <code>Promise</code>
This method allows you to unsubscribe from a previous subscribed *channel* or pattern.

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>Promise</code> - [Promise](http://bluebirdjs.com/docs/api-reference.html) resolving with true or false.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Full name of a channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub). |

<a name="RedisEvents+disposeSubscriber"></a>

### redisEvents.disposeSubscriber() ⇒ <code>Promise</code>
Method for releasing all subscriptions and closing the connection to the Redis server.

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>Promise</code> - [Promise](http://bluebirdjs.com/docs/api-reference.html) resolving with true or false if there was no active connection.  
<a name="RedisEvents+emit"></a>

### redisEvents.emit(message, channel) ⇒ <code>Promise</code>
Method raising an event on the passed *channel*. The *message* sent can be any serializable object. If the
instance of RedisEvents was constructed with a context or extended using the [contextify()](#RedisEvents+contextify)
method and the *message* parameter contains an object, the message gets extended with this context before
the event is raised.

You might want to leave the *channel* parameter empty if the instance of RedisEvents was constructed passing
the defaultEmitChannel parameter found at [DefaultConfig](DefaultConfig).

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>Promise</code> - [Promise](http://bluebirdjs.com/docs/api-reference.html) resolving with true when the event was published or rejecting with an error.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | JSON compatible JavaScript object. |
| channel | <code>string</code> | Full name of the channe the event should be published at. |

<a name="RedisEvents+disposeEmitter"></a>

### redisEvents.disposeEmitter() ⇒ <code>Promise</code>
Method for closing the publishing connection to the Redis server.

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>Promise</code> - [Promise](http://bluebirdjs.com/docs/api-reference.html) resolving with true or false if there was no active connection.  
<a name="RedisEvents+disposeAll"></a>

### redisEvents.disposeAll() ⇒ <code>Promise</code>
Releases all subscriptions, publishing channels and Redis connections.

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>Promise</code> - [Promise](http://bluebirdjs.com/docs/api-reference.html) resolving with two results.  
<a name="RedisEvents+contextify"></a>

### redisEvents.contextify()
Allows adding a default context to every event emitted if the message passed to the [emit()](#RedisEvents+emit)
method already is an object. You may also want to construct an instance of RedisEvents by passing the context
parameter to the constructor. For further information have a look at [DefaultConfig](DefaultConfig).

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
<a name="RedisEvents+hasSubscription"></a>

### redisEvents.hasSubscription() ⇒ <code>boolean</code>
Checks whenever the passed *channel* or pattern already has an active subscription from the
current instance of RedisEvents. The *channel* can either be a full name of a
channel or a Redis [subscribe-pattern](https://redis.io/topics/pubsub).

**Kind**: instance method of <code>[RedisEvents](#RedisEvents)</code>  
**Returns**: <code>boolean</code> - Returns true if the *channel* is already registered; otherwise false.  
<a name="RedisEvents.DefaultConfig"></a>

### RedisEvents.DefaultConfig
Static object representing a default configuration set.

**Kind**: static property of <code>[RedisEvents](#RedisEvents)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| serializer | <code>object</code> | Function to use for serializing messages in order to send them. |
| parser | <code>object</code> | Function to use for deserializing messages received. |
| defaultEmitChannel | <code>object</code> | Full name of a channel to emit events to if the channel is not passed to the [emit()](#RedisEvents+emit) method. |
| consul | <code>object</code> | Object for configuring consul related parameters. |
| consul.host | <code>object</code> | Hostname of a consul server. |
| consul.redisServiceName | <code>object</code> | Name of the enpoint for the Redis server in consul. |
| consul.redisPasswordKey | <code>object</code> | Consul configuration key for Redis authorisation. |
| context | <code>object</code> | Optional context object to automatically extend emitted messages. |

