// server/index.js

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});