// client/src/components/SubmitExpenseDialog.jsx

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Upload, Sparkles, X, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.string().min(2, "Please select a category."),
  date: z.date({ required_error: "A date for the expense is required." }),
  currency: z.string().min(2, "Please select a currency."),
});

export const SubmitExpenseDialog = ({ open, onOpenChange, onExpenseAdded }) => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: "", amount: "", category: "", currency: "INR", date: new Date() },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // We need the part after "data:image/jpeg;base64,"
        const base64String = reader.result.split(',')[1];
        setImage({ file, name: file.name, base64: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutofill = async () => {
    if (!image) {
      toast.error("Please upload a receipt image first.");
      return;
    }
    setIsProcessing(true);
    toast.info("AI is analyzing your receipt... ✨ This may take a moment.");

    try {
      // --- THIS IS THE REAL API CALL ---
      const FIREBASE_FUNCTION_URL = "https://asia-south1-walmart-hackthon.cloudfunctions.net/analyzeReceipt2";
      
      const response = await axios.post(FIREBASE_FUNCTION_URL, {
        // Firebase callable functions expect the payload inside a `data` object
        data: { image: image.base64 } 
      });

      // The actual result is nested in `response.data.result.data`
      const data = response.data.result.data;
      
      // --- END OF REAL API CALL ---
      
      form.setValue('description', data.description || '', { shouldValidate: true });
      form.setValue('amount', data.amount || '', { shouldValidate: true });
      form.setValue('date', data.date ? new Date(data.date) : new Date(), { shouldValidate: true });
      form.setValue('category', data.category || '', { shouldValidate: true });
      toast.success("Fields auto-filled successfully!");

    } catch (error) {
      toast.error("AI analysis failed. Please fill manually.");
      console.error("AI Autofill Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleOpenChange = (isOpen) => {
    if(!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  }

  const onSubmit = async (values) => {
    const promise = () => new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post('http://localhost:3001/api/expenses', values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        handleOpenChange(false); // Close and reset the dialog
        if (onExpenseAdded) onExpenseAdded(); // Callback to refresh any lists
        
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit New Expense</DialogTitle>
          <DialogDescription>Add a receipt to auto-fill with AI, or enter the details manually.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Receipt Image (Optional)</Label>
              {!image ? (
                <div 
                  className="relative w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-2">Click to upload a receipt</span>
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                  />
                </div>
              ) : (
                <div className="relative w-full p-3 border rounded-lg flex items-center justify-between bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileImage className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium truncate">{image.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {image && (
              <Button type="button" variant="secondary" className="w-full" onClick={handleAutofill} disabled={isProcessing}>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                {isProcessing ? 'Analyzing Receipt...' : 'Auto-fill with AI ✨'}
              </Button>
            )}

            <div className="border-t border-border pt-4 space-y-4">
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Team Lunch" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => ( <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Food">Food</SelectItem><SelectItem value="Travel">Travel</SelectItem><SelectItem value="Supplies">Supplies</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of Expense</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || isProcessing}>Submit Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};