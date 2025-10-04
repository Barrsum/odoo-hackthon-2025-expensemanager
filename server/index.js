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
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-for-hackathon';

// Middleware
app.use(cors());
app.use(express.json());

// --- AUTH ROUTES ---

// 1. SIGNUP (SIMPLIFIED)
// No longer needs companyName or currency. Creates a default company.
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user and a "Demo Company" at the same time
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        company: {
          create: {
            name: `${name}'s Company`, // Auto-generates a company name
            currency: 'INR', // Defaults to INR
          },
        },
      },
    });

    // Create and return a token for immediate login
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role, companyId: newUser.companyId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Company and Admin user created successfully!',
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
});

// 2. LOGIN (No changes needed)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// --- USER MANAGEMENT ROUTES (PROTECTED) ---

// GET all users in the admin's company
app.get('/api/users', protect, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        managerId: true // <-- THIS IS THE FIX. We now send the manager relationship.
      }, 
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT to update a user's role
app.put('/api/users/:id', protect, async (req, res) => {
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

// POST to create a new user (by an Admin)
app.post('/api/users', protect, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized to perform this action' });
  }
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: req.user.companyId,
      },
    });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST to create a new expense
app.post('/api/expenses', protect, async (req, res) => {
  try {
    const { description, amount, currency, category, date } = req.body;
    const submitterId = req.user.userId;

    // 1. Find the person who submitted the expense to get their manager
    const submitter = await prisma.user.findUnique({
      where: { id: submitterId },
      select: { managerId: true }
    });

    if (!submitter) {
      return res.status(404).json({ error: 'Submitter not found.' });
    }

    // 2. Use a transaction to create the expense and approval step together
    const newExpense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        currency,
        category,
        date: new Date(date),
        submitterId: submitterId,
        // If the user has a manager, create the first approval step immediately
        approvalSteps: submitter.managerId ? {
          create: [{
            approverId: submitter.managerId,
            step: 1,
            status: 'PENDING',
          }]
        } : undefined, // If no manager, no approval steps are created
      },
      include: {
        approvalSteps: true,
      }
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Expense submission error:", error);
    res.status(500).json({ error: 'Failed to submit expense.' });
  }
});

// PUT to assign a manager to an employee
app.put('/api/users/:employeeId/assign-manager', protect, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  try {
    const { managerId } = req.body;
    const { employeeId } = req.params;

    // TODO: Add checks to ensure both users are in the same company
    
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { managerId: managerId },
    });

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign manager.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});