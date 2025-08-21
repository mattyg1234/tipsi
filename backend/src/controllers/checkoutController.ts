import express from 'express';

const router = express.Router();

// Success page after payment
router.get('/success', (req, res) => {
  const { session_id } = req.query;
  
  res.render('success', {
    sessionId: session_id,
    message: 'Payment successful! Your order has been received.'
  });
});

// Cancel page if payment was cancelled
router.get('/cancel', (req, res) => {
  res.render('cancel', {
    message: 'Payment was cancelled. You can try again anytime.'
  });
});

export default router;
