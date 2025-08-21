import Stripe from 'stripe';
import { ProductType } from '@prisma/client';

// Check if Stripe is configured
const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (isStripeConfigured) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2022-11-15',
    });
    console.log('✅ Stripe service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    stripe = null;
  }
} else {
  console.log('⚠️  Stripe not configured - payment features will be disabled');
}

export interface CheckoutSessionData {
  venueId: string;
  tableId: string;
  productType: ProductType;
  qty: number;
  songText?: string;
  menuItemId?: string;
  menuItemPrice?: number;
}

export const createCheckoutSession = async (data: CheckoutSessionData) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const {
    venueId,
    tableId,
    productType,
    qty,
    songText,
    menuItemId,
    menuItemPrice
  } = data;

  let amount: number;
  let description: string;
  let metadata: any = {
    venueId,
    tableId,
    productType,
    qty: qty.toString(),
  };

  switch (productType) {
    case 'REQUEST':
      amount = parseInt(process.env.DEFAULT_REQUEST_PRICE_CENTS || '500');
      description = `DJ Song Request${songText ? `: ${songText}` : ''}`;
      metadata.songText = songText || '';
      break;
    
    case 'SHOTS':
      amount = parseInt(process.env.SHOT_PRICE_CENTS || '500') * qty;
      description = `${qty} Shot${qty > 1 ? 's' : ''}`;
      break;
    
    case 'BOTTLE':
      if (!menuItemPrice) throw new Error('Menu item price required for bottle orders');
      amount = menuItemPrice * qty;
      description = `${qty}x Bottle Order`;
      metadata.menuItemId = menuItemId;
      break;
    
    default:
      throw new Error(`Unsupported product type: ${productType}`);
  }

  // Add platform fee
  const platformFee = parseInt(process.env.PLATFORM_FEE_CENTS || '100');
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: description,
            description: `Table ${tableId} - ${description}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/cancel`,
    metadata,
    // TODO: Add application_fee_amount and transfer_data for Stripe Connect
    // application_fee_amount: platformFee,
    // transfer_data: {
    //   destination: 'connected_account_id',
    // },
  });

  return session;
};

export const getStripeInstance = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
};

export const isStripeAvailable = () => isStripeConfigured && !!stripe;
