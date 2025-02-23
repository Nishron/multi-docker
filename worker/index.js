const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index) {
    if (index < 2) return 1;
    return fib(index -1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
    const index = parseInt(message);
    const fibValue = fib(index);

    redisClient.hset('values', message, fibValue, (err, res) => {
        if (err) {
            console.error(`Error storing Fibonacci result for index ${index}:`, err);
        } else {
            console.log(`Stored Fibonacci(${index}) = ${fibValue} in Redis.`);
        }
    });
});
sub.subscribe('insert');