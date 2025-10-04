// client/src/pages/ApprovalsPage.jsx

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

// --- Helper for consistent status badges in History ---
const getHistoryStatus = (expense, status) => {
  if (status === 'APPROVED') {
    if (expense.approvedAmount !== null && expense.approvedAmount < expense.amount) {
      return { text: 'PARTIALLY APPROVED', variant: 'warning' };
    }
    return { text: 'APPROVED', variant: 'success' };
  }
  return { text: 'REJECTED', variant: 'destructive' };
};

// --- Helper Component for the Pending Approvals Table ---
const PendingApprovalsTable = ({ approvals, onApproveClick, onReject, loading }) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Submitted By</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow><TableCell colSpan={5} className="text-center">Loading pending approvals...</TableCell></TableRow>
        ) : approvals.length > 0 ? (
          approvals.map((approval) => (
            <TableRow key={approval.id}>
              <TableCell className="font-medium">{approval.expense.submitter.name}</TableCell>
              <TableCell>{approval.expense.description}</TableCell>
              <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: approval.expense.currency }).format(approval.expense.amount)}</TableCell>
              <TableCell>{format(new Date(approval.expense.date), 'dd MMM, yyyy')}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onReject(approval.id)}><XCircle className="h-4 w-4 mr-2 text-red-500" /> Reject</Button>
                <Button variant="outline" size="sm" onClick={() => onApproveClick(approval)}><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Approve</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow><TableCell colSpan={5} className="text-center">No pending approvals.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

// --- Helper Component for the Approval History Table ---
const HistoryApprovalsTable = ({ history, loading }) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Submitted By</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actioned On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow><TableCell colSpan={5} className="text-center">Loading history...</TableCell></TableRow>
        ) : history.length > 0 ? (
          history.map(({ id, status, updatedAt, expense }) => {
            const statusInfo = getHistoryStatus(expense, status);
            return (
              <TableRow key={id}>
                <TableCell className="font-medium">{expense.submitter.name}</TableCell>
                <TableCell>{expense.description}</TableCell>
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
                <TableCell>
                  <Badge variant={statusInfo.variant} className={cn({'bg-green-600 text-white': statusInfo.variant === 'success', 'bg-yellow-500 text-black': statusInfo.variant === 'warning'})}>
                    {statusInfo.text}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(updatedAt), 'dd MMM, yyyy')}</TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow><TableCell colSpan={5} className="text-center">No approval history.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

// --- Main Page Component ---
const ApprovalsPage = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedApproval, setSelectedApproval] = useState(null);
    const [approvalType, setApprovalType] = useState('full');
    const [partialAmount, setPartialAmount] = useState('');
    const [percentage, setPercentage] = useState(100);

    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [pendingRes, historyRes] = await Promise.all([
          axios.get('https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/approvals', { headers }),
          axios.get('https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/approvals/history', { headers }),
        ]);
        setPending(pendingRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        toast.error('Failed to fetch approval data.');
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
      if (approvalType === 'percentage' && selectedApproval) {
        const calculatedAmount = (selectedApproval.expense.amount * (percentage / 100)).toFixed(2);
        setPartialAmount(calculatedAmount);
      }
    }, [percentage, approvalType, selectedApproval]);
  
    useEffect(() => {
      if (approvalType === 'partial' && selectedApproval) {
        const calculatedPercentage = Math.round((parseFloat(partialAmount) / selectedApproval.expense.amount) * 100) || 0;
        setPercentage(calculatedPercentage > 100 ? 100 : calculatedPercentage);
      }
    }, [partialAmount, approvalType, selectedApproval]);
  
    const resetDialogState = () => {
      setSelectedApproval(null);
      setApprovalType('full');
      setPartialAmount('');
      setPercentage(100);
    };

    const handleReject = (stepId) => {
        const promise = axios.post( `https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/approvals/${stepId}`, { status: 'REJECTED' }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } } ).then(() => fetchData());
        toast.promise(promise, { loading: 'Rejecting expense...', success: 'Expense Rejected!', error: 'Action failed.' });
    };

    const handleConfirmApproval = () => {
        if (!selectedApproval) return;
        let finalApprovedAmount = null;
        if (approvalType !== 'full') {
            finalApprovedAmount = parseFloat(partialAmount);
            if (isNaN(finalApprovedAmount) || finalApprovedAmount <= 0 || finalApprovedAmount > selectedApproval.expense.amount) {
                toast.error("Please enter a valid amount less than or equal to the requested amount.");
                return;
            }
        }
        const promise = axios.post( `https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/approvals/${selectedApproval.id}`, { status: 'APPROVED', approvedAmount: finalApprovedAmount }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } } ).then(() => {
            fetchData();
            resetDialogState();
        });
        toast.promise(promise, { loading: 'Approving expense...', success: 'Expense Approved!', error: 'Action failed.' });
    };

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold mb-8">Approvals</h1>
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                        <PendingApprovalsTable approvals={pending} onApproveClick={setSelectedApproval} onReject={handleReject} loading={loading} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <HistoryApprovalsTable history={history} loading={loading} />
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={!!selectedApproval} onOpenChange={resetDialogState}>
                {selectedApproval && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Expense</DialogTitle>
                            <DialogDescription>
                                Request for <span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedApproval.expense.currency }).format(selectedApproval.expense.amount)}</span> by {selectedApproval.expense.submitter.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                            <RadioGroup defaultValue="full" onValueChange={setApprovalType} className="flex space-x-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="full" id="r1" /><Label htmlFor="r1">Full</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="partial" id="r2" /><Label htmlFor="r2">Partial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="percentage" id="r3" /><Label htmlFor="r3">Percentage</Label></div>
                            </RadioGroup>

                            {approvalType === 'partial' && (
                                <div className="space-y-2">
                                    <Label htmlFor="partialAmount">Partial Amount ({selectedApproval.expense.currency})</Label>
                                    <Input id="partialAmount" type="number" placeholder={`Max: ${selectedApproval.expense.amount}`} value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} />
                                </div>
                            )}
                            {approvalType === 'percentage' && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Approval Percentage</Label>
                                        <span className="text-sm font-medium w-24 text-right">{percentage}%</span>
                                    </div>
                                    <Slider defaultValue={[100]} value={[percentage]} max={100} step={1} onValueChange={(value) => setPercentage(value[0])} />
                                    <div className="text-right font-bold text-lg text-green-500">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedApproval.expense.currency }).format(partialAmount)}</div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={resetDialogState}>Cancel</Button>
                            <Button onClick={handleConfirmApproval}>Confirm Approval</Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
};

export default ApprovalsPage;