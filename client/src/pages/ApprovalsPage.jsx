// client/src/pages/ApprovalsPage.jsx

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, History } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper component for the Pending table
const PendingApprovalsTable = ({ approvals, onAction, loading }) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader><TableRow><TableHead>Submitted By</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {loading ? ( <TableRow><TableCell colSpan={5} className="text-center">Loading approvals...</TableCell></TableRow>
        ) : approvals.length > 0 ? (
          approvals.map(({ id, expense }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{expense.submitter.name}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: expense.currency }).format(expense.amount)}</TableCell>
              <TableCell>{format(new Date(expense.date), 'dd MMM, yyyy')}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onAction(id, 'REJECTED')}><XCircle className="h-4 w-4 mr-2 text-red-500" /> Reject</Button>
                <Button variant="outline" size="sm" onClick={() => onAction(id, 'APPROVED')}><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Approve</Button>
              </TableCell>
            </TableRow>
          ))
        ) : ( <TableRow><TableCell colSpan={5} className="text-center">No pending approvals.</TableCell></TableRow> )}
      </TableBody>
    </Table>
  </div>
);

// Helper component for the History table
const HistoryApprovalsTable = ({ history, loading }) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader><TableRow><TableHead>Submitted By</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actioned On</TableHead></TableRow></TableHeader>
      <TableBody>
        {loading ? ( <TableRow><TableCell colSpan={5} className="text-center">Loading history...</TableCell></TableRow>
        ) : history.length > 0 ? (
          history.map(({ id, status, updatedAt, expense }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{expense.submitter.name}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: expense.currency }).format(expense.amount)}</TableCell>
              <TableCell>
                <Badge variant={status === 'APPROVED' ? 'default' : 'destructive'} className={status === 'APPROVED' ? 'bg-green-600' : ''}>{status}</Badge>
              </TableCell>
              <TableCell>{format(new Date(updatedAt), 'dd MMM, yyyy')}</TableCell>
            </TableRow>
          ))
        ) : ( <TableRow><TableCell colSpan={5} className="text-center">No approval history.</TableCell></TableRow> )}
      </TableBody>
    </Table>
  </div>
);


const ApprovalsPage = () => {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, historyRes] = await Promise.all([
        axios.get('http://localhost:3001/api/approvals', { headers }),
        axios.get('http://localhost:3001/api/approvals/history', { headers }),
      ]);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      toast.error('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (stepId, status) => {
    const actionVerb = status === 'APPROVED' ? 'Approving' : 'Rejecting';
    const promise = axios.post(
      `http://localhost:3001/api/approvals/${stepId}`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
    ).then(() => fetchData()); // Re-fetch both lists on success

    toast.promise(promise, {
      loading: `${actionVerb} expense...`,
      success: `Expense ${status.toLowerCase()}!`,
      error: 'Action failed.',
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Approvals</h1>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <PendingApprovalsTable approvals={pending} onAction={handleAction} loading={loading} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <HistoryApprovalsTable history={history} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalsPage;