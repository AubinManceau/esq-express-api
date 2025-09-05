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
