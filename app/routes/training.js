import express from 'express';
import trainingCtrl from '../controllers/trainingController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

/**
 * @swagger
 * tags:
 *   name: Entraînements
 *   description: Gestion des entraînements
 */
const router = express.Router();

/**
 * @swagger
 * /trainings/user:
 *   get:
 *     summary: Récupérer les entraînements à venir pour l'utilisateur connecté, regroupés par catégorie
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entraînements récupérés avec succès
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
 *                   example: Entrainements à venir récupérés avec succès!
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       trainings:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             type:
 *                               type: string
 *                               description: Type d'entraînement (match ou entraînement)
 *                             date:
 *                               type: string
 *                               format: date
 *                             startTime:
 *                               type: string
 *                               format: time
 *                             status:
 *                               type: string
 *                             responses:
 *                               type: object
 *                               properties:
 *                                 present:
 *                                   type: integer
 *                                 pending:
 *                                   type: integer
 *                                 absent:
 *                                   type: integer
 *       404:
 *         description: Catégorie(s) de l'utilisateur non trouvée(s)
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
 *                   example: Catégorie(s) de l'utilisateur non trouvée(s).
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des entraînements
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
 *                   example: Erreur interne du serveur lors de la récupération des entrainements.
 */
router.get('/user', auth, trainingCtrl.getTrainingsByUser);
/**
 * @swagger
 * /trainings/{id}:
 *   get:
 *     summary: Récupérer les détails d'un entraînement spécifique
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'entraînement
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrainement récupéré avec succès
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
 *                   example: Entrainement récupéré avec succès!
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                       description: Type d'entraînement (match ou entraînement)
 *                     date:
 *                       type: string
 *                       format: date
 *                     startTime:
 *                       type: string
 *                       format: time
 *                     status:
 *                       type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     responses:
 *                       type: object
 *                       properties:
 *                         present:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         absent:
 *                           type: integer
 *       404:
 *         description: Entrainement non trouvé
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
 *                   example: Entrainement non trouvé.
 *       500:
 *         description: Erreur interne du serveur lors de la récupération de l'entraînement
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
 *                   example: Erreur interne du serveur lors de la récupération de l'entrainement.
 */
router.get('/:id', auth, trainingCtrl.getTraining);
/**
 * @swagger
 * /trainings:
 *   get:
 *     summary: Récupérer tous les entraînements
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entrainements récupérés avec succès
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
 *                   example: Entrainements récupérés avec succès!
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       startTime:
 *                         type: string
 *                         format: time
 *                       status:
 *                         type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       responses:
 *                         type: object
 *                         properties:
 *                           present:
 *                             type: integer
 *                           pending:
 *                             type: integer
 *                           absent:
 *                             type: integer
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des entrainements
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
 *                   example: Erreur interne du serveur lors de la récupération des entrainements.
 */
router.get('/', auth, role([4]), trainingCtrl.getTrainings);
/**
 * @swagger
 * /trainings:
 *   post:
 *     summary: Créer un nouvel entraînement
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - date
 *               - startTime
 *               - categoryId
 *             properties:
 *               type:
 *                 type: string
 *                 example: "match"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-01"
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "18:30"
 *               status:
 *                 type: string
 *                 example: "planned"
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Entrainement créé avec succès
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
 *                   example: Entrainement créé avec succès!
 *                 data:
 *                   type: object
 *                   properties:
 *                     training:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date
 *                         startTime:
 *                           type: string
 *                           format: time
 *                         status:
 *                           type: string
 *                         category:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *       400:
 *         description: Requête invalide, champs manquants ou catégorie non trouvée
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
 *                   example: Type, Date, Heure et une catégorie sont requis.
 *       500:
 *         description: Erreur interne du serveur lors de la création de l'entrainement
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
 *                   example: Erreur interne du serveur lors de la création de l'entrainement.
 */
router.post('/', auth, role([2, 4]), trainingCtrl.createTraining);
/**
 * @swagger
 * /trainings/{id}:
 *   patch:
 *     summary: Mettre à jour un entraînement existant
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entraînement à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "entrainement"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-05"
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *               status:
 *                 type: string
 *                 example: "planned"
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Entrainement modifié avec succès
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
 *                   example: Entrainement modifié avec succès!
 *                 data:
 *                   type: object
 *                   properties:
 *                     training:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date
 *                         startTime:
 *                           type: string
 *                           format: time
 *                         status:
 *                           type: string
 *                         category:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *       404:
 *         description: Entrainement ou catégorie non trouvée
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
 *                   example: Entrainement non trouvé.
 *       500:
 *         description: Erreur interne du serveur lors de la modification
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
 *                   example: Erreur interne du serveur lors de la modification de l'entrainement.
 */
router.patch('/:id', auth, role([2, 4]), trainingCtrl.updateTraining);
/**
 * @swagger
 * /trainings/{id}/status/{status}:
 *   patch:
 *     summary: Mettre à jour le statut de présence d'un utilisateur pour un entraînement
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entraînement
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [present, absent, pending]
 *         description: Nouveau statut de l'utilisateur
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
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
 *                   example: Statut mis à jour avec succès.
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainingId:
 *                       type: integer
 *                       example: 5
 *                     userId:
 *                       type: integer
 *                       example: 3
 *                     status:
 *                       type: string
 *                       example: present
 *       400:
 *         description: Statut invalide
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
 *                   example: Statut invalide. Les statuts autorisés sont: present, absent, pending.
 *       404:
 *         description: Enregistrement introuvable
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
 *                   example: Aucune réponse d'utilisateur trouvée pour cet entrainement.
 *       500:
 *         description: Erreur serveur
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
 *                   example: Erreur serveur lors de la mise à jour du statut.
 */
router.patch('/:id/status/:status', auth, trainingCtrl.updateTrainingUserStatus);
/**
 * @swagger
 * /trainings/{id}:
 *   delete:
 *     summary: Supprimer un entraînement
 *     tags: [Entraînements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entraînement à supprimer
 *     responses:
 *       200:
 *         description: Entraînement supprimé avec succès
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
 *                   example: Entrainement supprimé avec succès!
 *       404:
 *         description: Entraînement non trouvé
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
 *                   example: Entrainement non trouvé.
 *       500:
 *         description: Erreur serveur lors de la suppression
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
 *                   example: Erreur interne du serveur lors de la suppression de l'entrainement.
 */
router.delete('/:id', auth, role([2, 4]), trainingCtrl.deleteTraining);

export default router;