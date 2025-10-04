// client/src/components/SubmitExpenseDialog.jsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the validation schema for the expense form
const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.string().min(2, "Please select a category."),
  date: z.date({ required_error: "A date for the expense is required." }),
  currency: z.string().min(2, "Please select a currency."),
});

export const SubmitExpenseDialog = ({ open, onOpenChange, onExpenseAdded }) => {
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      currency: "INR", // Default to INR as discussed
      date: new Date(),
    },
  });

  const onSubmit = async (values) => {
    const promise = () => new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post('http://localhost:3001/api/expenses', values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        onOpenChange(false); // Close the dialog
        form.reset(); // Reset the form for next time
        if (onExpenseAdded) onExpenseAdded(); // Callback to refresh the expenses list
        
        resolve(response.data);
      } catch (error) {
        reject(error.response?.data?.error || 'Failed to submit expense.');
      }
    });

    toast.promise(promise, {
      loading: 'Submitting expense...',
      success: 'Expense submitted successfully!',
      error: (err) => err,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit New Expense</DialogTitle>
          <DialogDescription>Fill in the details of your expense. Click submit when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Team Lunch" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem><FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Food">Food</SelectItem><SelectItem value="Travel">Travel</SelectItem><SelectItem value="Supplies">Supplies</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date of Expense</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover>
                <FormMessage /></FormItem>
              )} />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>Submit Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};