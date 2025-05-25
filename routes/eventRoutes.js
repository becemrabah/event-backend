import express from 'express';
import { z } from 'zod';
import Event from '../models/Event.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();


const eventSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La date doit être une date valide",
  }),
  lieu: z.string().min(1, "Le lieu est obligatoire"),
  nbParticipants: z.number().int().nonnegative("Le nombre de participants doit être positif"),
});

router.post('/events', verifyToken, async (req, res) => {
  try {
    const parsedData = eventSchema.safeParse(req.body);

    if (!parsedData.success) {
        console.log('result:', result)
      return res.status(400).json({ message: "Données invalides", errors: parsedData.error.issues  });
    }

    const { titre, date, lieu, nbParticipants } = parsedData.data;

    const event = new Event({
      titre,
      date: new Date(date),
      lieu,
      nbParticipants,
      userId: req.user.id,
    });

    await event.save();

    res.status(201).json({ message: 'Événement créé avec succès', event });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/events', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      message: 'Liste des événements récupérée avec succès',
      events,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements :', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});
router.delete('/events/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const event = await Event.findOne({ _id: eventId, userId });

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé ou accès refusé' });
    }

    await Event.deleteOne({ _id: eventId });

    res.status(200).json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

export default router;
