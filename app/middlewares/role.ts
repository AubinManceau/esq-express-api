import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

export default (allowedRolesId: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const roles = (req.auth as any)?.roles;
            if (!roles || roles.length === 0) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Role non autorisé.',
                });
            }
            const hasRole = roles.some((role: any) => allowedRolesId.includes(role.roleId));
            if (!hasRole) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Role non autorisé.',
                });
            }
            next();
        } catch (error) {
            return res.status(403).json({
                status: 'error',
                message: 'Role non autorisé.',
            });
        }
    };
};
