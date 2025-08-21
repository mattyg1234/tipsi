import axios from 'axios';
import { Order, ProductType } from '@prisma/client';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

interface DailyStats {
  venueId: string;
  venueName: string;
  requests: number;
  shots: number;
  bottles: number;
  revenue: number;
  staffBonuses: number;
  djPayouts: number;
}

const sendTelegramMessage = async (message: TelegramMessage): Promise<boolean> => {
  if (!BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return false;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_BASE}${BOT_TOKEN}/sendMessage`, message, {
      timeout: 10000,
    });
    
    if (response.data.ok) {
      console.log(`Telegram message sent to chat ${message.chat_id}`);
      return true;
    } else {
      console.error('Telegram API error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
};

const sendWithRetry = async (message: TelegramMessage, maxRetries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const success = await sendTelegramMessage(message);
    if (success) return true;
    
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

export const sendOrderNotification = async (order: Order, tableNumber: number, venueName: string): Promise<void> => {
  const { productType, qty, amountCents, songText } = order;
  const amount = (amountCents / 100).toFixed(2);

  switch (productType) {
    case 'REQUEST':
      if (process.env.TELEGRAM_DJ_CHAT_ID) {
        const djMessage = `🎵 *New Song Request!*\n\n` +
          `📍 Venue: ${venueName}\n` +
          `🪑 Table: ${tableNumber}\n` +
          `💰 Amount: €${amount}\n` +
          `🎶 Song: *${songText || 'No song specified'}*`;
        
        await sendWithRetry({
          chat_id: process.env.TELEGRAM_DJ_CHAT_ID,
          text: djMessage,
          parse_mode: 'Markdown'
        });
      }
      break;

    case 'SHOTS':
      if (process.env.TELEGRAM_STAFF_CHAT_ID) {
        const staffBonus = (qty * 100) / 100; // €1 per shot
        const staffMessage = `🥃 *Shots Order!*\n\n` +
          `📍 Venue: ${venueName}\n` +
          `🪑 Table: ${tableNumber}\n` +
          `🥃 Quantity: ${qty} shot${qty > 1 ? 's' : ''}\n` +
          `💰 Total: €${amount}\n` +
          `💸 Your Bonus: €${staffBonus.toFixed(2)}`;
        
        await sendWithRetry({
          chat_id: process.env.TELEGRAM_STAFF_CHAT_ID,
          text: staffMessage,
          parse_mode: 'Markdown'
        });
      }
      break;

    case 'BOTTLE':
      if (process.env.TELEGRAM_VENUE_CHAT_ID) {
        const venueMessage = `🍾 *Bottle Order!*\n\n` +
          `📍 Venue: ${venueName}\n` +
          `🪑 Table: ${tableNumber}\n` +
          `🍾 Quantity: ${qty}\n` +
          `💰 Amount: €${amount}`;
        
        await sendWithRetry({
          chat_id: process.env.TELEGRAM_VENUE_CHAT_ID,
          text: venueMessage,
          parse_mode: 'Markdown'
        });
      }
      break;
  }
};

export const sendNightlySummary = async (stats: DailyStats[]): Promise<void> => {
  if (!process.env.TELEGRAM_VENUE_CHAT_ID) return;

  for (const stat of stats) {
    const summary = `📊 *Daily Summary - ${stat.venueName}*\n\n` +
      `🎵 Song Requests: ${stat.requests}\n` +
      `🥃 Shots: ${stat.shots}\n` +
      `🍾 Bottles: ${stat.bottles}\n` +
      `💰 Total Revenue: €${(stat.revenue / 100).toFixed(2)}\n` +
      `💸 Staff Bonuses: €${(stat.staffBonuses / 100).toFixed(2)}\n` +
      `🎵 DJ Payouts: €${(stat.djPayouts / 100).toFixed(2)}\n\n` +
      `📅 Generated at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`;

          await sendWithRetry({
        chat_id: process.env.TELEGRAM_VENUE_CHAT_ID,
        text: summary,
        parse_mode: 'Markdown'
      });
  }
};
