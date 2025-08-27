import express from 'express';
import authCtrl from '../controllers/authController.js';
import auth from '../middleware/auth.js';

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs
 */
const router = express.Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Création d'un utilisateur avec attribution de rôles et catégories
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
 *                 nullable: true
 *                 example: "+33612345678"
 *               rolesId:
 *                 type: array
 *                 description: Liste des IDs de rôles. Certains rôles (1 ou 2) nécessitent des catégories.
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *               categoriesId:
 *                 type: array
 *                 description: Liste des IDs de catégories correspondant aux rôles qui en nécessitent
 *                 items:
 *                   type: integer
 *                 example: [5]
 *     responses:
 *       201:
 *         description: Utilisateur créé et email de confirmation envoyé
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
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+33612345678"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-27T10:15:30Z"
 *       400:
 *         description: Requête invalide (champs manquants, rôle ou catégorie incorrect)
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
router.post('/signup', authCtrl.signup);
/**
 * @swagger
 * /resend-confirmation/{id}:
 *   post:
 *     summary: Réenvoi de l'email de confirmation pour un utilisateur inactif
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur pour lequel le token doit être régénéré
 *         example: 10
 *     responses:
 *       200:
 *         description: Email de confirmation renvoyé avec succès
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
 *                   example: Nouveau token généré avec succès!
 *       400:
 *         description: Requête invalide (ID utilisateur manquant)
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
 *                   example: L'ID de l'utilisateur est requis.
 *       404:
 *         description: Utilisateur non trouvé ou déjà activé
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
 *                   example: Utilisateur non trouvé ou inactif.
 *       500:
 *         description: Erreur interne du serveur ou problème d'envoi d'email
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
 *                   example: Erreur interne du serveur lors de la génération du token.
 */
router.post('/resend-confirmation/:id', authCtrl.resendConfirmationEmail);
/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Rafraîchir le token d'accès avec un refresh token valide
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Refresh token valide pour obtenir un nouveau token d'accès
 *     responses:
 *       200:
 *         description: Nouveau token d'accès et refresh token générés avec succès
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
 *                   example: Nouveau token d'accès généré avec succès.
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Nouveau token d'accès (valide 15 min)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       description: Nouveau refresh token (valide 7 jours)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token manquant
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
 *                   example: Refresh token manquant.
 *       403:
 *         description: Refresh token invalide, expiré ou non valide en base
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
 *                   example: Refresh token invalide ou expiré.
 *       500:
 *         description: Erreur interne du serveur lors du rafraîchissement du token
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
 *                   example: Erreur interne du serveur lors du rafraîchissement du token d'accès.
 */
router.post('/refresh-token', authCtrl.refreshAccessToken);
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur (invalidation du refresh token)
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
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
 *                   example: Déconnexion réussie.
 *       400:
 *         description: ID utilisateur manquant dans le token d'authentification
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
 *                   example: L'ID utilisateur est requis pour la déconnexion.
 *       500:
 *         description: Erreur interne du serveur lors de la déconnexion
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
 *                   example: Erreur interne du serveur lors de la déconnexion.
 */
router.post('/logout', auth, authCtrl.logout);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur et génération des tokens d'accès et de refresh
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
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: Connexion réussie avec génération des tokens
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
 *                                 example: Admin
 *                               categoryId:
 *                                 type: integer
 *                                 example: 5
 *                               categoryName:
 *                                 type: string
 *                                 example: Category A
 *                     token:
 *                       type: string
 *                       description: Token d'accès JWT (15 min)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       description: Token de rafraîchissement JWT (7 jours)
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
router.post('/login', authCtrl.login);
/**
 * @swagger
 * /confirm:
 *   post:
 *     summary: Activation du compte et définition du mot de passe
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Token reçu par email pour activer le compte
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *                 description: Mot de passe respectant la politique de sécurité
 *               confirmPassword:
 *                 type: string
 *                 example: "Password123!"
 *                 description: Confirmation du mot de passe
 *     responses:
 *       200:
 *         description: Compte activé et mot de passe défini
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
 *       400:
 *         description: Requête invalide (champs manquants ou mots de passe non conformes)
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
router.post('/confirm', authCtrl.definePassword);
/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Envoi d'un email pour réinitialiser le mot de passe
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: Email de l'utilisateur pour lequel le mot de passe doit être réinitialisé
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé avec succès
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
 *                   example: Email de réinitialisation envoyé avec succès.
 *       400:
 *         description: Requête invalide (email manquant)
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
 *                   example: L'email est requis pour la réinitialisation du mot de passe.
 *       404:
 *         description: Aucun utilisateur actif trouvé avec cet email
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
 *                   example: Aucun utilisateur actif trouvé avec cet email.
 *       500:
 *         description: Erreur interne du serveur ou problème d'envoi d'email
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
 *                   example: Erreur interne du serveur lors de la réinitialisation du mot de passe.
 */
router.post('/forgot-password', authCtrl.forgotPassword);
/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Réinitialisation du mot de passe avec token
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Token reçu par email pour réinitialiser le mot de passe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *                 description: Nouveau mot de passe respectant la politique de sécurité
 *               confirmNewPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *                 description: Confirmation du nouveau mot de passe
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
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
 *                   example: Mot de passe réinitialisé avec succès.
 *       400:
 *         description: Requête invalide (champs manquants, mots de passe non conformes ou emails différents)
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
 *                   example: Les nouveaux mots de passe ne correspondent pas.
 *       401:
 *         description: Token invalide
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
 *                   example: Le token est invalide.
 *       404:
 *         description: Utilisateur non trouvé ou inactif
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
 *                   example: Utilisateur non trouvé ou inactif.
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
 *                   example: Erreur interne du serveur lors de la réinitialisation du mot de passe.
 */
router.post('/reset-password', authCtrl.resetPassword);
export default router;