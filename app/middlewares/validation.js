import { body, validationResult } from 'express-validator';

export const validateUpdateUser = [
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('phone').optional().isLength({ min: 10, max: 10 }).withMessage('Numéro de téléphone invalide'),
    body('firstName').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit être une chaîne de caractères'),
    body('lastName').optional().isString().isLength({ min: 2, max: 80 }).withMessage('Le nom doit être une chaîne de caractères'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateUserForAdmin = [
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('phone').optional({ checkFalsy: true }).isLength({ min: 10, max: 10 }).withMessage('Numéro de téléphone invalide'),
    body('firstName').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit être une chaîne de caractères'),
    body('lastName').optional().isString().isLength({ min: 2, max: 80 }).withMessage('Le nom doit être une chaîne de caractères'),
    body('isActive').optional().isBoolean().withMessage("Le champ 'isActive' doit être un booléen"),
    body('rolesCategories').optional().isArray().withMessage("Le champ 'rolesCategories' doit être un tableau"),
    body('rolesCategories.*.roleId').toInt().isInt().withMessage("Le champ 'roleId' dans 'rolesCategories' doit être un entier"),
    body('rolesCategories.*.categoryId').optional({ nullable: true, checkFalsy: true }).toInt()
        .custom((categoryId, { req, path }) => {
        const index = path.match(/\d+/)[0];
        const roleId = req.body.rolesCategories[index].roleId;

        if ([1, 2].includes(roleId)) {
            if (categoryId === undefined || categoryId === null) {
                throw new Error("Le champ 'categoryId' est obligatoire lorsque roleId vaut 1 ou 2");
            }
            if (!Number.isInteger(categoryId)) {
                throw new Error("Le champ 'categoryId' doit être un entier");
            }
        } else if (categoryId !== undefined && categoryId !== null) {
            if (!Number.isInteger(categoryId)) {
                throw new Error("Le champ 'categoryId' doit être un entier");
            }
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdatePassword = [
    body('oldPassword').exists().withMessage('Le mot de passe actuel est requis'),
    body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
    .matches(/\d/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
    
    body('confirmPassword')
        .exists()
        .withMessage('Le champ de confirmation est requis')
        .custom((confirmPassword, { req }) => {
            if (confirmPassword !== req.body.newPassword) {
                throw new Error('Le mot de passe de confirmation ne correspond pas au nouveau mot de passe');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateSignup = [
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('phone').optional().isLength({ min: 10, max: 10 }).withMessage('Numéro de téléphone invalide'),
    body('firstName').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit être une chaîne de caractères'),
    body('lastName').optional().isString().isLength({ min: 2, max: 80 }).withMessage('Le nom doit être une chaîne de caractères'),
    body('isActive').optional().isBoolean().withMessage("Le champ 'isActive' doit être un booléen"),
    body('rolesCategories').optional().isArray().withMessage("Le champ 'rolesCategories' doit être un tableau"),
    body('rolesCategories.*.roleId').toInt().isInt().withMessage("Le champ 'roleId' dans 'rolesCategories' doit être un entier"),
    body('rolesCategories.*.categoryId').optional({ nullable: true, checkFalsy: true }).toInt()
        .custom((categoryId, { req, path }) => {
        const index = path.match(/\d+/)[0];
        const roleId = req.body.rolesCategories[index].roleId;

        if ([1, 2].includes(roleId)) {
            if (categoryId === undefined || categoryId === null) {
                throw new Error("Le champ 'categoryId' est obligatoire lorsque roleId vaut 1 ou 2");
            }
            if (!Number.isInteger(categoryId)) {
                throw new Error("Le champ 'categoryId' doit être un entier");
            }
        } else if (categoryId !== undefined && categoryId !== null) {
            if (!Number.isInteger(categoryId)) {
                throw new Error("Le champ 'categoryId' doit être un entier");
            }
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateDefinePassword = [
    body('token').exists().withMessage('Le token est requis'),
    body('email').exists().isEmail().withMessage('Email invalide'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
    body('confirmPassword')
        .exists()
        .withMessage('Le champ de confirmation est requis')
        .custom((confirmPassword, { req }) => {
            if (confirmPassword !== req.body.password) {
                throw new Error('Le mot de passe de confirmation ne correspond pas au nouveau mot de passe');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateResetPassword = [
    body('token').exists().withMessage('Le token est requis'),
    body('email').exists().isEmail().withMessage('Email invalide'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
    body('confirmNewPassword')
        .exists()
        .withMessage('Le champ de confirmation est requis')
        .custom((confirmNewPassword, { req }) => {
            if (confirmNewPassword !== req.body.newPassword) {
                throw new Error('Le mot de passe de confirmation ne correspond pas au nouveau mot de passe');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateCreateArticle = [
    body('title').exists().isString().withMessage('Le titre est requis et doit être une chaîne de caractères'),
    body('content').exists().isJSON().withMessage('Le contenu est requis et doit être une chaîne de caractères'),
    body('status').exists().isIn(['draft', 'published', 'archived']).withMessage("Le statut est requis et doit être 'draft', 'published' ou 'archived'"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateArticle = [
    body('title').optional().isString().withMessage('Le titre doit être une chaîne de caractères'),
    body('content').optional().isJSON().withMessage('Le contenu doit être une chaîne de caractères'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage("Le statut doit être 'draft', 'published' ou 'archived'"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateCreateConvocation = [
    body('matchDate').exists().isISO8601().withMessage('La date du match est requise et doit être au format ISO 8601'),
    body('matchHour').exists().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage("L'heure du match est requise et doit être au format 'HH:mm'"),
    body('convocationHour').exists().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage("L'heure de convocation est requise et doit être au format 'HH:mm'"),
    body('location').exists().isString().withMessage('Le lieu est requis et doit être une chaîne de caractères'),
    body('teamId').exists().isInt().withMessage("L'identifiant de l'équipe est requis et doit être un entier"),
    body('userPlayerIds').exists().isArray().withMessage("Le champ 'userPlayerIds' est requis et doit être un tableau"),
    body('userPlayerIds.*').isInt().withMessage("Chaque identifiant dans 'userPlayerIds' doit être un entier"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateConvocation = [
    body('matchDate').optional().isISO8601().withMessage('La date du match doit être au format ISO 8601'),
    body('matchHour').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage("L'heure du match doit être au format 'HH:mm'"),
    body('convocationHour').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage("L'heure de convocation doit être au format 'HH:mm'"),
    body('location').optional().isString().withMessage('Le lieu doit être une chaîne de caractères'),
    body('teamId').optional().isInt().withMessage("L'identifiant de l'équipe doit être un entier"),
    body('userPlayerIds').optional().isArray().withMessage("Le champ 'userPlayerIds' doit être un tableau"),
    body('userPlayerIds.*').isInt().withMessage("Chaque identifiant dans 'userPlayerIds' doit être un entier"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateCreateTeam = [
    body('name').exists().isString().withMessage("Le nom de l'équipe est requis et doit être une chaîne de caractères"),
    body('categoryId').exists().isInt().withMessage("L'identifiant de la catégorie est requis et doit être un entier"),
    body('userCoachIds').exists().isArray({ min: 1 }).withMessage("Le champ 'userCoachIds' est requis et doit être un tableau non vide"),
    body('userCoachIds.*').isInt().withMessage("Chaque identifiant dans 'userCoachIds' doit être un entier"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateTeam = [
    body('name').optional().isString().withMessage("Le nom de l'équipe doit être une chaîne de caractères"),
    body('categoryId').optional().isInt().withMessage("L'identifiant de la catégorie doit être un entier"),
    body('userCoachIds').optional().isArray({ min: 1 }).withMessage("Le champ 'userCoachIds' doit être un tableau non vide"),
    body('userCoachIds.*').isInt().withMessage("Chaque identifiant dans 'userCoachIds' doit être un entier"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateCreateTraining = [
    body('date').exists().isISO8601().withMessage('La date de l\'entraînement est requise et doit être au format ISO 8601'),
    body('startTime').exists().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage("L'heure de début est requise et doit être au format 'HH:mm'"),
    body('type').exists().isIn(['match', 'training']).withMessage("Le type est requis et doit être 'match' ou 'training'"),
    body('categoryId').exists().isInt().withMessage("L'identifiant de la catégorie est requis et doit être un entier"),
    body('status').optional().isIn(['active', 'canceled']).withMessage("Le statut doit être 'active' ou 'canceled'"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateTraining = [
    body('date').optional().isISO8601().withMessage('La date de l\'entraînement doit être au format ISO 8601'),
    body('startTime').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage("L'heure de début doit être au format 'HH:mm'"),
    body('type').optional().isIn(['match', 'training']).withMessage("Le type doit être 'match' ou 'training'"),
    body('categoryId').optional().isInt().withMessage("L'identifiant de la catégorie doit être un entier"),
    body('status').optional().isIn(['active', 'canceled']).withMessage("Le statut doit être 'active' ou 'canceled'"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateSendPrivateMessage = [
    body('recipientId').exists().isInt().withMessage("L'identifiant du destinataire est requis et doit être un entier"),
    body('content').exists().isString().withMessage("Le contenu du message est requis et doit être une chaîne de caractères"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateCreateGroupChat = [
    body('name').exists().isString().withMessage("Le nom du groupe est requis et doit être une chaîne de caractères"),
    body('categoryId').optional().isInt().withMessage("L'identifiant de la catégorie doit être un entier"),
    body('roleId').optional().isInt().withMessage("L'identifiant du rôle doit être un entier"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateGroupChat = [
    body('name').optional().isString().withMessage("Le nom du groupe doit être une chaîne de caractères"),
    body('categoryId').optional().isInt().withMessage("L'identifiant de la catégorie doit être un entier"),
    body('roleId').optional().isInt().withMessage("L'identifiant du rôle doit être un entier"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];

export const validateSendGroupMessage = [
    body('content').exists().isString().withMessage("Le contenu du message est requis et doit être une chaîne de caractères"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        next();
    }
];
