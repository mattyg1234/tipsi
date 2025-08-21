import express from 'express';
import { prisma } from '../services/prismaService';

const router = express.Router();

// DJ tap-in/out endpoint
router.post('/tap', async (req, res) => {
  try {
    const { venueId, djId, action } = req.body;

    if (!venueId || !djId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action === 'start') {
      // End any existing active session for this venue
      await prisma.dJSession.updateMany({
        where: {
          venueId,
          active: true
        },
        data: {
          active: false,
          endedAt: new Date()
        }
      });

      // Start new session
      const session = await prisma.dJSession.create({
        data: {
          venueId,
          djId,
          active: true,
          startedAt: new Date()
        },
        include: {
          dj: true,
          venue: true
        }
      });

      res.json({
        success: true,
        message: `DJ ${session.dj.name} started session at ${session.venue.name}`,
        session
      });
    } else if (action === 'end') {
      // End current session
      const session = await prisma.dJSession.updateMany({
        where: {
          venueId,
          djId,
          active: true
        },
        data: {
          active: false,
          endedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'DJ session ended',
        sessionsUpdated: session.count
      });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "start" or "end"' });
    }
  } catch (error) {
    console.error('Error in DJ tap:', error);
    res.status(500).json({ error: 'Failed to process DJ tap' });
  }
});

// Get current DJ session for a venue
router.get('/session/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;

    const session = await prisma.dJSession.findFirst({
      where: {
        venueId,
        active: true
      },
      include: {
        dj: true
      }
    });

    res.json({
      hasActiveSession: !!session,
      session: session || null
    });
  } catch (error) {
    console.error('Error getting DJ session:', error);
    res.status(500).json({ error: 'Failed to get DJ session' });
  }
});

export default router;
