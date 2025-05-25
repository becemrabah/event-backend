import express from 'express';
import verifyToken from '../middlewares/authMiddleware.js';
import Event from '../models/Event.js';

const router = express.Router();


router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

   
    const events = await Event.find({ userId });

  
    const totalEvents = events.length;
    const totalParticipants = events.reduce((acc, event) => acc + (event.nbParticipants || 0), 0);

    res.status(200).json({
      message: 'Statistiques récupérées avec succès',
      totalEvents,
      totalParticipants,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

export default router;
