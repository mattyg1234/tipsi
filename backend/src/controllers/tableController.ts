import express from 'express';
import { prisma } from '../services/prismaService';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get table page with venue branding and product options
router.get('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        venue: {
          include: {
            menuItems: {
              where: { active: true },
              orderBy: { category: 'asc' }
            }
          }
        }
      }
    });

    if (!table) {
      return res.status(404).render('error', { 
        message: 'Table not found',
        error: 'This table does not exist or has been removed.'
      });
    }

    const { venue } = table;
    
    res.render('table', {
      table,
      venue,
      shotPrice: (parseInt(process.env.SHOT_PRICE_CENTS || '500') / 100).toFixed(2),
      requestPrice: (parseInt(process.env.DEFAULT_REQUEST_PRICE_CENTS || '500') / 100).toFixed(2)
    });
  } catch (error) {
    console.error('Error loading table:', error);
    res.status(500).render('error', { 
      message: 'Server Error',
      error: 'Unable to load table information.'
    });
  }
});

// Handle product form submissions
router.post('/:tableId/checkout', [
  body('productType').isIn(['REQUEST', 'SHOTS', 'BOTTLE']),
  body('qty').isInt({ min: 1, max: 100 }),
  body('songText').optional().isLength({ max: 200 }),
  body('menuItemId').optional().isString()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tableId } = req.params;
    const { productType, qty, songText, menuItemId } = req.body;

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { venue: true }
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Validate menu item for bottle orders
    let menuItemPrice: number | undefined;
    if (productType === 'BOTTLE' && menuItemId) {
      const menuItem = await prisma.menuItem.findFirst({
        where: { 
          id: menuItemId, 
          venueId: table.venueId,
          active: true 
        }
      });
      
      if (!menuItem) {
        return res.status(400).json({ error: 'Invalid menu item' });
      }
      menuItemPrice = menuItem.priceCents;
    }

    // Create checkout session
    const { createCheckoutSession } = await import('../services/stripeService');
    const session = await createCheckoutSession({
      venueId: table.venueId,
      tableId: table.id,
      productType,
      qty,
      songText,
      menuItemId,
      menuItemPrice
    });

    res.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
