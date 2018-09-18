# ATTENTION

As this library is discontinued, we can provide you a better and more reliable alternative to use. Please have a look at [RedisEventClient](https://github.com/OpusCapita/redis-client#example-rediseventclient-pubsub) that is part of the [RedisClient](https://github.com/OpusCapita/redis-client) lib for OpusCapita Andariel.

---

# ocbesbn-redis-events
[![Coverage Status](https://coveralls.io/repos/github/OpusCapita/redis-events/badge.svg?branch=master&rand=2)](https://coveralls.io/github/OpusCapita/redis-events?branch=master&rand=1)
![Build status](https://circleci.com/gh/OpusCapita/redis-events.svg?style=shield&circle-token=33dde9a3e5bbe120832064948a3d073ba7a6ab15)

This module provides simplified access to the publish/subscribe system provided by Redis. It uses Consul in order to determine the required Redis server endpoint and further configurations. To have a look at the full API, please visit the related [wiki page](https://github.com/OpusCapita/redis-events/wiki).

### Minimum setup
First got to your local code directory and run:
```
npm install ocbesbn-redis-events
```
To go with the minimum setup, you need to have access to a running **Consul server** to get your endpoint configuration for Redis. In addition, a **Redis server** is required which has to be registered inside Consul. If Redis password **authentication** is required, Consul has to provide the configuration key **{{your-service-name}}/redis/password** where *{{your-service-name}}* is the least name of the directory your code runs in. If authentication is not used, you can set the **consul.redisPasswordKey** to null or false when creating a new instance of RedisEvents.

If all this is set up, go to you code and add the following lines:

```JS
const RedisEvents = require('ocbesbn-redis-events');

var events = new RedisEvents({ consul : { host : '{{your-consul-host}}' } });

// Subscribe to a channel by name.
events.subscribe('my-channel', console.log).then(() => events.emit('Hello, world!', 'my-channel'));
// - OR -
// Subscribe to a channel by pattern.
events.subscribe('my-channel.*', console.log).then(() => events.emit('Hello, world!', 'my-channel.sub-channel'));

// Close all Redis connections.
events.disposeAll();
```

### Default configuration

The default configuration object provides hints about what the module's standard behavior is like.

```JS
{
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
```
