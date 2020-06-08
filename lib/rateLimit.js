const redis = require('redis');
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || '6379';
const rateLimitWindowMilliseconds = process.env.REQUEST_LIMIT_TIME || 60000;
const requestLimit = process.env.REQUEST_LIMIT || 5;




function getTokenBucket(ip, maxTokens)
{
    const redisClient = redis.createClient(redisPort, redisHost);
    return new Promise((resolve, reject) =>{
        redisClient.hgetall(ip, function (err, tokenBucket){
            if(err){
                reject(err);
            }else {
                if(tokenBucket)
                {
                    tokenBucket.tokens = parseFloat(tokenBucket.tokens);
                }
                else{
                    tokenBucket = {
                        tokens: maxTokens,
                        last: Date.now()
                      };                    
                }
                resolve(tokenBucket);
            }
        });
    })
}

function saveTokenBucket(ip, tokenBucket)
{
    const redisClient = redis.createClient(redisPort, redisHost);
    return new Promise((resolve, reject) =>{
        redisClient.hmset(ip, tokenBucket, function (err, resp) {
            if (err) {
              reject(err)
            } else {
              resolve();
            }
          });
    });
}

async function rateLimit(req, res, next) {
    try{
        const tokenBucket = await getTokenBucket(req.ip, requestLimit);
        const timestamp = Date.now();
        const elapsedMilliseconds = timestamp - tokenBucket.last;
        const refreshRate = requestLimit / rateLimitWindowMilliseconds;
        tokenBucket.tokens += elapsedMilliseconds * refreshRate;
        tokenBucket.tokens = Math.min(requestLimit, tokenBucket.tokens);
        tokenBucket.last = timestamp;

        if (tokenBucket.tokens >= 1) {
            tokenBucket.tokens -= 1;
            res.setHeader("X-RateLimit-Limit",requestLimit);
            res.setHeader("X-RateLimit-Remaining",tokenBucket.tokens);

            await saveTokenBucket(req.ip, tokenBucket);
            next();
          } else {
            res.setHeader("X-RateLimit-Limit",requestLimit);
            res.setHeader("X-RateLimit-Remaining",tokenBucket.tokens);
            await saveTokenBucket(req.ip, tokenBucket);
            res.status(429).json({
              error: "Too many requests per minute"
            });
          }

    }
    catch (err){
        next();
    }
}

module.exports = rateLimit;