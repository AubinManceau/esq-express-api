import express from 'express';
import authCtrl from '../controllers/authController.js';

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs
 */

const router = express.Router();

router.post('/signup', authCtrl.signup);
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
 *                 description: Liste des IDs de rôles à attribuer à l'utilisateur. Certains rôles nécessitent des catégories.
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *               categoriesId:
 *                 type: array
 *                 description: Liste des IDs de catégories correspondantes aux rôles nécessitant une catégorie (ex: rôle 1 ou 2)
 *                 items:
 *                   type: integer
 *                 example: [5]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès et email de confirmation envoyé
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
 *                           nullable: true
 *                           example: "+33612345678"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-08-26T10:15:30Z"
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Requête invalide (champs manquants, rôle ou catégorie invalide)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Nom, Prénom, Email et au moins un rôle sont requis.
 *       409:
 *         description: Conflit (email déjà utilisé)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Un utilisateur avec cet email existe déjà.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Erreur interne du serveur lors de la création de l'utilisateur.
 */
router.post('/login', authCtrl.login);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MotDePasse123!"
 *     responses:
 *       200:
 *         description: Connexion réussie
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
 *                   example: Connexion réussie
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
 *                           nullable: true
 *                           example: "+33612345678"
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               roleId:
 *                                 type: integer
 *                                 example: 1
 *                               roleName:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Admin
 *                               categoryId:
 *                                 type: integer
 *                                 nullable: true
 *                                 example: 5
 *                               categoryName:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Football
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Requête invalide (email ou mot de passe manquant)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Email et mot de passe sont requis.
 *       401:
 *         description: Identifiants incorrects ou compte non activé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Identifiants incorrects ou compte non activé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Erreur interne du serveur lors de la tentative de connexion.
 */
router.post('/confirm', authCtrl.definePassword);
/**
 * @swagger
 * /confirm:
 *   post:
 *     summary: Définition du mot de passe et activation du compte
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Token reçu par email pour activer le compte
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MotDePasse123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "MotDePasse123!"
 *     responses:
 *       200:
 *         description: Mot de passe défini et compte activé
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
 *                   example: Votre compte est maintenant activé. Vous pouvez vous connecter.
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 10
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *       400:
 *         description: Requête invalide (champs manquants, mots de passe non identiques ou mot de passe non conforme)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Les mots de passe ne correspondent pas.
 *       401:
 *         description: Token invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Le lien d'activation a expiré. Veuillez demander un nouveau lien.
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Utilisateur non trouvé.
 *       409:
 *         description: Compte déjà activé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Ce compte est déjà activé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Erreur interne du serveur lors de l'activation du compte.
 */

export default router;