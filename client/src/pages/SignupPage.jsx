// client/src/pages/SignupPage.jsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Define the validation schema for our form
const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  name: z.string().min(2, "Your name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  currency: z.string().min(2, "Please select a currency."),
});

const SignupPage = () => {
  const navigate = useNavigate();

  // Set up our form using react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      name: "",
      email: "",
      password: "",
      currency: "INR", // Default currency
    },
  });

  // This function will be called when the form is submitted
  const onSubmit = async (values) => {
    try {
      // Show a loading toast
      const promise = axios.post("http://localhost:3001/api/auth/signup", values);

      toast.promise(promise, {
        loading: 'Creating your account...',
        success: (response) => {
          // Navigate to the login page on success
          setTimeout(() => navigate('/login'), 1500); // Wait a bit so user can see message
          return `Welcome, ${response.data.user.name}! Account created.`;
        },
        error: (error) => {
          // Return the error message from the server
          return error.response?.data?.error || "Signup failed. Please try again.";
        },
      });
    } catch (error) {
      console.error("Signup submission error", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border border-border/20">
        <CardHeader>
          <CardTitle className="text-2xl">Create your Account</CardTitle>
          <CardDescription>Enter your details to get started with expense management.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl><Input placeholder="Your Company Inc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john.doe@company.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a currency" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;