import { Router } from 'express';
import {
  businessSignup,
  getBusinessProfile,
  updateBusinessProfile,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  upload
} from '../controllers/businessController';

const router = Router();

// Business signup (with logo upload)
router.post('/signup', upload.single('logo'), businessSignup);

// Business profile management
router.get('/profile/:venueId', getBusinessProfile);
router.put('/profile/:venueId', upload.single('logo'), updateBusinessProfile);

// Menu management
router.post('/:venueId/menu', createMenuItem);
router.get('/:venueId/menu', getMenuItems);
router.put('/menu/:menuItemId', updateMenuItem);
router.delete('/menu/:menuItemId', deleteMenuItem);

export default router;

