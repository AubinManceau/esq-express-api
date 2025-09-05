import redis from "../config/redisClient.js";

const cacheMiddleware = (keyPrefix, ttl = 60) => {
  return async (req, res, next) => {
    try {
      const key = keyPrefix + JSON.stringify(req.params) + JSON.stringify(req.query);

      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redis.setex(key, ttl, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
}

export default cacheMiddleware;
