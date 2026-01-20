import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            auth?: string | JwtPayload | { userId: number; roles?: any[] };
            cookies?: { [key: string]: string };
        }
    }
}
