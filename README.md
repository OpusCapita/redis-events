# ocbesbn-redis-events
[![Coverage Status](https://coveralls.io/repos/github/OpusCapita/redis-events/badge.svg?branch=master&rand=2)](https://coveralls.io/github/OpusCapita/redis-events?branch=master&rand=1)
![Build status](https://circleci.com/gh/OpusCapita/redis-events.svg?style=shield&circle-token=0db8535ca279a541e26aea88b0dd14fbd46e4790)

This module provides simplified access to the publish/subscribe system provided by Redis. To have a look at the full API, please visit the related [wiki page](https://github.com/OpusCapita/redis-events/wiki).

### Minimum setup
First got to your local code directory and run:
```
npm install ocbesbn-redis-events
```
To go with the minimum setup, you need to have access to a running Consul server to get your endpoint configuration and a Redis server that is registered in consul.

If all this is set up, go to you code and add the following command:

```JS
const RedisEvents = require('ocbesbn-redis-events');

var events = new Events({ consul : { host : '{{your-consul-host}}' } });

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
