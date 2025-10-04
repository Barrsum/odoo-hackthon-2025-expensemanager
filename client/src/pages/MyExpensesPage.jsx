// client/src/pages/MyExpensesPage.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from "@/lib/utils"; // <-- THIS IS THE FIX. THIS LINE WAS MISSING.

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

// A more powerful status function
const getExpenseStatus = (expense) => {
  if (expense.status === 'APPROVED') {
    if (expense.approvedAmount !== null && expense.approvedAmount < expense.amount) {
      return { text: 'PARTIALLY APPROVED', variant: 'warning' };
    }
    return { text: 'APPROVED', variant: 'success' };
  }
  if (expense.status === 'REJECTED') {
    return { text: 'REJECTED', variant: 'destructive' };
  }
  return { text: 'PENDING', variant: 'outline' };
};

const MyExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyExpenses = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/expenses/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(res.data);
      } catch (error) { toast.error('Failed to fetch your expense history.'); }
      finally { setLoading(false); }
    };
    fetchMyExpenses();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Expense History</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? ( <TableRow><TableCell colSpan={4} className="text-center">Loading your expenses...</TableCell></TableRow>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => {
                  const statusInfo = getExpenseStatus(expense);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {statusInfo.text === 'PARTIALLY APPROVED' ? (
                            <>
                              <span className="font-bold text-green-500">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: expense.currency }).format(expense.approvedAmount)}</span>
                              <span className="text-xs text-muted-foreground line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: expense.currency }).format(expense.amount)}</span>
                            </>
                          ) : (
                            <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: expense.currency }).format(expense.amount)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(expense.date), 'dd MMM, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={statusInfo.variant} 
                          className={cn({
                            'bg-green-600 text-white': statusInfo.variant === 'success',
                            'bg-yellow-500 text-black': statusInfo.variant === 'warning',
                          })}
                        >
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : ( <TableRow><TableCell colSpan={4} className="text-center">You haven't submitted any expenses yet.</TableCell></TableRow> )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyExpensesPage;