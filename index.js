const redis = require("redis")

const client = redis.createClient();

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect().then( async a=>{
    client.hSet("randomid",
        "content", "fucking piss",
        "key", "fuck off",
        "created", "1847108234123"
    )
    const value = await client.hGetAll("randomid")
    console.log(value)
});