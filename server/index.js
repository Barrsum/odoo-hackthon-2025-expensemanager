// server/index.js

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from './authMiddleware.js';

// Initialize
const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-for-hackathon'; // In a real app, use a .env variable

// Middleware
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// 1. SIGNUP: Create a new Company and an Admin user
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { companyName, email, password, name, currency } = req.body;

    // --- Validation ---
    if (!companyName || !email || !password || !name || !currency) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // --- Check if user already exists ---
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // --- Hash the password ---
    const hashedPassword = await bcrypt.hash(password, 10); // Hash with a salt of 10 rounds

    // --- Create Company and User in a single transaction ---
    // This ensures that if one part fails, the whole operation is rolled back.
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN', // The first user is always an ADMIN
        company: {
          create: {
            name: companyName,
            currency: currency, // e.g., "USD"
          },
        },
      },
      // Include company info in the response
      include: {
        company: true,
      },
    });

    // --- Respond with success ---
    // We don't send the password back, even the hashed one.
    res.status(201).json({
      message: 'Company and Admin user created successfully!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        companyId: newUser.company.id,
        companyName: newUser.company.name,
      },
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
});

// 2. LOGIN: Authenticate a user and return a JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // --- Find the user by email ---
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Use a generic error message for security
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // --- Compare the provided password with the stored hash ---
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // --- If credentials are valid, create a JSON Web Token (JWT) ---
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token will be valid for 8 hours
    );

    // --- Respond with the token and user info ---
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// GET all users in the admin's company
app.get('/api/users', protect, async (req, res) => {
  try {
    // req.user is available because of the 'protect' middleware
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId },
      select: { id: true, name: true, email: true, role: true }, // Don't send password!
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT to update a user's role
app.put('/api/users/:id', protect, async (req, res) => {
  // Extra check: only an ADMIN can change roles
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized to perform this action' });
  }

  try {
    const { role } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});