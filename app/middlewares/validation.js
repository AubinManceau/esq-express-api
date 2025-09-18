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
    body('phone').optional().isLength({ min: 10, max: 10 }).withMessage('Numéro de téléphone invalide'),
    body('firstName').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit être une chaîne de caractères'),
    body('lastName').optional().isString().isLength({ min: 2, max: 80 }).withMessage('Le nom doit être une chaîne de caractères'),
    body('isActive').optional().isBoolean().withMessage("Le champ 'isActive' doit être un booléen"),
    body('rolesCategories').optional().isArray().withMessage("Le champ 'rolesCategories' doit être un tableau"),
    body('rolesCategories.*.roleId').isInt().withMessage("Le champ 'roleId' dans 'rolesCategories' doit être un entier"),
    body('rolesCategories.*.categoryId')
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
    body('rolesCategories.*.roleId').isInt().withMessage("Le champ 'roleId' dans 'rolesCategories' doit être un entier"),
    body('rolesCategories.*.categoryId')
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
