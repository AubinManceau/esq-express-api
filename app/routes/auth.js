import express from 'express';
import authCtrl from '../controllers/authController.js';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Création d'un utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - rolesId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: "+33612345678"
 *               rolesId:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *               categoriesId:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [5, 6]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Utilisateur créé avec succès!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         phone:
 *                           type: string
 *                           example: "+33612345678"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-08-26T10:15:30Z"
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Requête invalide
 *       409:
 *         description: Conflit (email déjà utilisé)
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/confirm', authCtrl.definePassword);

export default router;