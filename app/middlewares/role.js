import 'dotenv/config';

export default (allowedRolesId) => {
    return (req, res, next) => {
        try {
            const roles = req.auth.roles;
            if (!roles || roles.length === 0) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Role non autorisé.',
                });
            }
            const hasRole = roles.some(role => allowedRolesId.includes(role.roleId));
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
