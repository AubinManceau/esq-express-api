import redis from "../config/redisClient.js";
import { Request, Response, NextFunction } from 'express';

const cacheMiddleware = (keyPrefix: string, ttl: number = 60) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = keyPrefix + JSON.stringify(req.params) + JSON.stringify(req.query);

            const cached = await redis.get(key);
            if (cached) {
                return res.json(JSON.parse(cached));
            }

            const originalJson = res.json.bind(res);
            res.json = (data: any) => {
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
