import express from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../services/prismaService';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin venue page
router.get('/venue', async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        menuItems: {
          where: { active: true },
          orderBy: { category: 'asc' }
        },
        users: {
          where: { role: { in: ['VENUE_ADMIN', 'DJ', 'STAFF'] } }
        }
      }
    });

    res.render('admin/venue', { venues });
  } catch (error) {
    console.error('Error loading admin page:', error);
    res.status(500).render('error', { 
      message: 'Server Error',
      error: 'Unable to load admin information.'
    });
  }
});

// Create new venue
router.post('/venue', [
  body('name').isLength({ min: 1, max: 100 }),
  body('brandColor').isHexColor(),
  body('logo').optional()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, brandColor } = req.body;
    let logoUrl = null;

    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        brandColor,
        logoUrl
      }
    });

    res.json({ success: true, venue });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

// Add menu item
router.post('/venue/:venueId/menu', [
  body('category').isLength({ min: 1, max: 50 }),
  body('name').isLength({ min: 1, max: 100 }),
  body('priceCents').isInt({ min: 1 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { venueId } = req.params;
    const { category, name, priceCents } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        venueId,
        category,
        name,
        priceCents: parseInt(priceCents)
      }
    });

    res.json({ success: true, menuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Create demo venue with tables and users
router.post('/demo', async (req, res) => {
  try {
    // Create demo venue
    const venue = await prisma.venue.create({
      data: {
        name: 'Jumping Jacks',
        brandColor: '#dc2626',
        logoUrl: null
      }
    });

    // Create tables 1-40
    const tables = [];
    for (let i = 1; i <= 40; i++) {
      tables.push({
        venueId: venue.id,
        number: i,
        nfcUid: `demo-nfc-${i}`
      });
    }
    await prisma.table.createMany({ data: tables });

    // Create demo users
    const users = [
      {
        role: 'VENUE_ADMIN' as const,
        name: 'Jack Owner',
        venueId: venue.id,
        tgChatId: process.env.TELEGRAM_VENUE_CHAT_ID
      },
      {
        role: 'DJ' as const,
        name: 'DJ MixMaster',
        venueId: venue.id,
        tgChatId: process.env.TELEGRAM_DJ_CHAT_ID,
        connectId: 'acct_demo_dj'
      },
      {
        role: 'STAFF' as const,
        name: 'Shot Girl Sarah',
        venueId: venue.id,
        tgChatId: process.env.TELEGRAM_STAFF_CHAT_ID
      }
    ];

    for (const userData of users) {
      await prisma.user.create({ data: userData });
    }

    // Create demo menu items
    const menuItems = [
      { category: 'Bottles', name: 'Vodka Red Bull', priceCents: 2500 },
      { category: 'Bottles', name: 'Gin & Tonic', priceCents: 2200 },
      { category: 'Bottles', name: 'Whiskey Cola', priceCents: 2300 },
      { category: 'Bottles', name: 'Champagne', priceCents: 4500 }
    ];

    for (const itemData of menuItems) {
      await prisma.menuItem.create({
        data: {
          ...itemData,
          venueId: venue.id
        }
      });
    }

    res.json({
      success: true,
      message: 'Demo venue created successfully',
      venue: {
        id: venue.id,
        name: venue.name,
        tablesCount: 40,
        usersCount: 3,
        menuItemsCount: 4
      }
    });
  } catch (error) {
    console.error('Error creating demo venue:', error);
    res.status(500).json({ error: 'Failed to create demo venue' });
  }
});

// TODO: OCR menu builder endpoint
router.post('/venue/:venueId/menu-ocr', upload.single('menuImage'), (req, res) => {
  res.json({
    success: true,
    message: 'OCR menu parsing coming soon!',
    uploadedFile: req.file?.filename
  });
});

export default router;
