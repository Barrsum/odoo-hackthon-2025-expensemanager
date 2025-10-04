// client/src/components/SubmitExpenseDialog.jsx

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Upload, Sparkles, X, FileImage, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";

const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.string().min(2, "Please select a category."),
  date: z.date({ required_error: "A date for the expense is required." }),
  currency: z.string().min(2, "Please select a currency."),
});

// A beautiful skeleton loader component for the AI processing state
const FormSkeleton = () => (
  <div className="space-y-4 pt-4">
    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
    </div>
  </div>
);

export const SubmitExpenseDialog = ({ open, onOpenChange, onExpenseAdded }) => {
  const [view, setView] = useState('upload'); // 'upload', 'preview', 'processing', 'form'
  const [image, setImage] = useState(null);
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
        const base64String = reader.result.split(',')[1];
        setImage({ file, name: file.name, base64: base64String, preview: URL.createObjectURL(file) });
        setView('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutofill = async () => {
    if (!image) { // This handles the user's request for an error message
        toast.error("Please upload a receipt image before using the AI feature.");
        return;
    }
    setView('processing');
    toast.info("AI is analyzing your receipt... ✨");

    try {
      const FIREBASE_FUNCTION_URL = "https://asia-south1-walmart-hackthon.cloudfunctions.net/analyzeReceipt2";
      const response = await axios.post(FIREBASE_FUNCTION_URL, { data: { image: image.base64 } });
      const data = response.data.result.data;
      
      form.setValue('description', data.description || '', { shouldValidate: true });
      form.setValue('amount', data.amount || '', { shouldValidate: true });
      form.setValue('date', data.date ? new Date(data.date) : new Date(), { shouldValidate: true });
      form.setValue('category', data.category || '', { shouldValidate: true });
      
      toast.success("Fields auto-filled! Please review.");
      setView('form');
    } catch (error) {
      toast.error("AI analysis failed. Please fill manually.");
      setView('form');
    }
  };

  const resetAll = () => {
    form.reset();
    setImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setView('upload');
  };
  
  const handleOpenChange = (isOpen) => {
    if(!isOpen) resetAll();
    onOpenChange(isOpen);
  }

  const onSubmit = async (values) => {
    const promise = () => new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post('https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/expenses', values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        handleOpenChange(false);
        if (onExpenseAdded) onExpenseAdded();
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
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit New Expense</DialogTitle>
          <DialogDescription>
            {view === 'upload' && "Upload a receipt to get started, or enter details manually."}
            {view === 'preview' && "Let AI analyze your receipt, or fill the form yourself."}
            {view === 'processing' && "The AI is working its magic... 🪄"}
            {view === 'form' && "Review the details and submit your expense."}
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            {/* STAGE 1: UPLOAD VIEW */}
            {view === 'upload' && (
              <div className="space-y-4 py-4">
                <div 
                  className="relative w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-md font-medium text-muted-foreground mt-2">Click to upload a receipt</span>
                  <Input ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                </div>
                <Button variant="link" className="w-full" onClick={() => setView('form')}>Or Enter Details Manually</Button>
              </div>
            )}

            {/* STAGE 2 & 3: PREVIEW & PROCESSING VIEW */}
            {(view === 'preview' || view === 'processing') && (
              <div className="space-y-4 py-4">
                <div className="w-full h-48 border rounded-lg flex items-center justify-center overflow-hidden bg-muted/20">
                  {image?.preview && <img src={image.preview} alt="Receipt preview" className="max-h-full max-w-full object-contain" />}
                </div>
                {view === 'processing' ? (
                  <FormSkeleton />
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button type="button" size="lg" className="w-full" onClick={handleAutofill}>
                      <Wand2 className="mr-2 h-5 w-5" /> Auto-fill with AI
                    </Button>
                    <div className="flex justify-between items-center">
                      <Button variant="link" size="sm" className="p-1" onClick={() => fileInputRef.current?.click()}>Change Image</Button>
                      <Button variant="link" size="sm" className="p-1" onClick={() => setView('form')}>Enter Manually instead</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 4: FORM VIEW */}
            {view === 'form' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Team Lunch" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="amount" render={({ field }) => ( <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Food">Food</SelectItem><SelectItem value="Travel">Travel</SelectItem><SelectItem value="Supplies">Supplies</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of Expense</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>Submit Expense</Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </motion.div>
        </AnimatePresence>

      </DialogContent>
    </Dialog>
  );
};