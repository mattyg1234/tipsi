import express from 'express';
import { prisma } from '../services/prismaService';
import { sendOrderNotification } from '../services/telegramService';
import { getStripeInstance } from '../services/stripeService';

const router = express.Router();

// Stripe webhook endpoint
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    const stripe = getStripeInstance();
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

const handleCheckoutCompleted = async (session: any) => {
  const { metadata } = session;
  const {
    venueId,
    tableId,
    productType,
    qty,
    songText,
    menuItemId
  } = metadata;

  // Determine routing for song requests
  let routedToConnectId: string | null = null;
  let staffBonusCents = 0;

  if (productType === 'REQUEST') {
    // Check if there's an active DJ session
    const activeDJSession = await prisma.dJSession.findFirst({
      where: {
        venueId,
        active: true
      },
      include: {
        dj: true
      }
    });

    if (activeDJSession?.dj.connectId) {
      routedToConnectId = activeDJSession.dj.connectId;
    }
  } else if (productType === 'SHOTS') {
    // Staff get €1 per shot
    staffBonusCents = qty * 100;
  }

  // Create order record
  const order = await prisma.order.create({
    data: {
      venueId,
      tableId,
      productType,
      qty: parseInt(qty),
      amountCents: session.amount_total,
      songText: songText || null,
      routedToConnectId,
      staffBonusCents,
      stripeSessionId: session.id,
      status: 'PAID'
    },
    include: {
      venue: true,
      table: true
    }
  });

  // Send Telegram notification
  try {
    await sendOrderNotification(order, order.table.number, order.venue.name);
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }

  console.log(`Order created: ${order.id} for ${productType} at table ${order.table.number}`);
};

export default router;
