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
      select: { id: true, name: true, email: true, role: true, managerId: true },
    });
    res.json(users);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch users' }); }
});

app.get('/api/approvals', protect, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const whereClause = role === 'ADMIN' ? { status: 'PENDING' } : { approverId: userId, status: 'PENDING' };
    const approvals = await prisma.approvalStep.findMany({
      where: whereClause,
      include: { expense: { include: { submitter: { select: { name: true, email: true } } } } },
      orderBy: { expense: { date: 'desc' } },
    });
    res.json(approvals);
  } catch (error) {
    console.error("Fetch approvals error:", error);
    res.status(500).json({ error: 'Failed to fetch approvals.' });
  }
});

app.get('/api/approvals/history', protect, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const whereClause = role === 'ADMIN'
      ? { status: { in: ['APPROVED', 'REJECTED'] } }
      : { approverId: userId, status: { in: ['APPROVED', 'REJECTED'] } };

    const history = await prisma.approvalStep.findMany({
      where: whereClause,
      select: {
        id: true, status: true, updatedAt: true,
        expense: { 
          select: { 
            description: true, 
            amount: true, 
            approvedAmount: true, // <-- THIS IS THE CHANGE
            currency: true, 
            date: true, 
            submitter: { select: { name: true } } 
          } 
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ error: 'Failed to fetch approval history.' });
  }
});

app.get('/api/expenses/my', protect, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { submitterId: req.user.userId },
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (error) {
    console.error("Fetch my expenses error:", error);
    res.status(500).json({ error: 'Failed to fetch your expenses.' });
  }
});

app.get('/api/dashboard-stats', protect, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let stats = {};

    if (role === 'ADMIN') {
      const users = await prisma.user.count();
      const pendingExpenses = await prisma.expense.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } });
      const approvedThisMonth = await prisma.expense.aggregate({
        where: { status: 'APPROVED', updatedAt: { gte: startOfMonth } }, // Now works!
        _sum: { approvedAmount: true },
      });
      stats = {
        totalUsers: users,
        pendingAmount: pendingExpenses._sum.amount || 0,
        approvedThisMonth: approvedThisMonth._sum.approvedAmount || 0,
      };
    } else if (role === 'MANAGER') {
      const reports = await prisma.user.findMany({ where: { managerId: userId }, select: { id: true } });
      const reportIds = reports.map(r => r.id);
      
      const pendingForTeam = await prisma.expense.aggregate({ where: { submitterId: { in: reportIds }, status: 'PENDING' }, _sum: { amount: true } });
      const approvedForTeamThisMonth = await prisma.expense.aggregate({ where: { submitterId: { in: reportIds }, status: 'APPROVED', updatedAt: { gte: startOfMonth } }, _sum: { approvedAmount: true } }); // Now works!
      const expensesByCategory = await prisma.expense.groupBy({ by: ['category'], where: { submitterId: { in: reportIds } }, _sum: { amount: true } });

      stats = {
        teamSize: reportIds.length,
        pendingTeamAmount: pendingForTeam._sum.amount || 0,
        approvedTeamThisMonth: approvedForTeamThisMonth._sum.approvedAmount || 0,
        expensesByCategory: expensesByCategory.map(item => ({ name: item.category, value: item._sum.amount })),
      };
    } else { // EMPLOYEE
      const myExpenses = await prisma.expense.aggregate({ where: { submitterId: userId }, _sum: { amount: true, approvedAmount: true } });
      const myPending = await prisma.expense.count({ where: { submitterId: userId, status: 'PENDING' } });

      stats = {
        totalSubmitted: myExpenses._sum.amount || 0,
        totalApproved: myExpenses._sum.approvedAmount || 0,
        pendingCount: myPending,
      };
    }
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

// POST to approve or reject an expense (NOW WITH PARTIAL APPROVAL)
app.post('/api/approvals/:stepId', protect, async (req, res) => {
  try {
    const { stepId } = req.params;
    const { status, approvedAmount } = req.body; // Can now receive an approved amount
    const { userId, role } = req.user;

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const approvalStep = await prisma.approvalStep.findUnique({ 
      where: { id: stepId },
      include: { expense: true } // We need the original expense amount
    });

    if (role !== 'ADMIN' && approvalStep.approverId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to action this approval.' });
    }

    let finalApprovedAmount = null;
    if (status === 'APPROVED') {
      // If an approvedAmount is provided, use it. Otherwise, use the full original amount.
      finalApprovedAmount = approvedAmount ? parseFloat(approvedAmount) : approvalStep.expense.amount;
    }

    const [, updatedExpense] = await prisma.$transaction([
      prisma.approvalStep.update({
        where: { id: stepId },
        data: { status },
      }),
      prisma.expense.update({
        where: { id: approvalStep.expenseId },
        data: { 
          status,
          approvedAmount: finalApprovedAmount // Store the final approved amount
        },
      }),
    ]);
    
    res.json(updatedExpense);
  } catch (error) {
    console.error("Action approval error:", error);
    res.status(500).json({ error: 'Failed to action approval.' });
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