import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prismaService';
import multer from 'multer';
import path from 'path';

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use path.resolve for absolute path that works in production
    const uploadsPath = path.resolve(__dirname, '../../uploads/logos');
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Business signup endpoint
export const businessSignup = async (req: Request, res: Response) => {
  try {
    const { email, password, businessName } = req.body;
    const logoFile = req.file;

    // Validate required fields
    if (!email || !password || !businessName) {
      return res.status(400).json({
        error: 'Email, password, and business name are required'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { name: email } // Using name field for email temporarily
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name: businessName,
        brandColor: '#6366f1', // Default brand color
        logoUrl: logoFile ? `/uploads/logos/${logoFile.filename}` : null
      }
    });

    // Create user (business owner)
    const user = await prisma.user.create({
      data: {
        name: email, // Using name field for email temporarily
        role: 'VENUE_ADMIN',
        venueId: venue.id
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, venueId: venue.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Business account created successfully',
      user: {
        id: user.id,
        email: user.name,
        role: user.role
      },
      venue: {
        id: venue.id,
        name: venue.name,
        logoUrl: venue.logoUrl
      },
      token
    });

  } catch (error) {
    console.error('Business signup error:', error);
    res.status(500).json({
      error: 'Failed to create business account'
    });
  }
};

// Get business profile
export const getBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        menuItems: true,
        tables: true
      }
    });

    if (!venue) {
      return res.status(404).json({
        error: 'Venue not found'
      });
    }

    res.json({ venue });

  } catch (error) {
    console.error('Get business profile error:', error);
    res.status(500).json({
      error: 'Failed to get business profile'
    });
  }
};

// Update business profile
export const updateBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { name, brandColor } = req.body;
    const logoFile = req.file;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (brandColor) updateData.brandColor = brandColor;
    if (logoFile) updateData.logoUrl = `/uploads/logos/${logoFile.filename}`;

    const venue = await prisma.venue.update({
      where: { id: venueId },
      data: updateData
    });

    res.json({
      message: 'Business profile updated successfully',
      venue
    });

  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({
      error: 'Failed to update business profile'
    });
  }
};

// Create menu item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { category, name, priceCents } = req.body;

    if (!category || !name || !priceCents) {
      return res.status(400).json({
        error: 'Category, name, and price are required'
      });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        venueId,
        category,
        name,
        priceCents: parseInt(priceCents)
      }
    });

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      error: 'Failed to create menu item'
    });
  }
};

// Get menu items
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: { 
        venueId,
        active: true
      },
      orderBy: { category: 'asc' }
    });

    res.json({ menuItems });

  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      error: 'Failed to get menu items'
    });
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const { category, name, priceCents, active } = req.body;

    const updateData: any = {};
    if (category) updateData.category = category;
    if (name) updateData.name = name;
    if (priceCents) updateData.priceCents = parseInt(priceCents);
    if (active !== undefined) updateData.active = active;

    const menuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: updateData
    });

    res.json({
      message: 'Menu item updated successfully',
      menuItem
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      error: 'Failed to update menu item'
    });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;

    await prisma.menuItem.delete({
      where: { id: menuItemId }
    });

    res.json({
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      error: 'Failed to delete menu item'
    });
  }
};

// Export multer middleware for file uploads
export { upload };
