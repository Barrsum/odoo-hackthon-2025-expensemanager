// client/src/pages/LoginPage.jsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    const promise = axios.post("http://localhost:3001/api/auth/login", values);
    toast.promise(promise, {
      loading: 'Logging in...',
      success: (response) => {
        localStorage.setItem('authToken', response.data.token);
        navigate('/dashboard');
        return `Welcome back, ${response.data.user.name}!`;
      },
      error: (error) => error.response?.data?.error || "Login failed. Please try again.",
    });
  };

  return (
    <Card className="w-full max-w-md auth-card">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your email and password to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => ( 
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="john.doe@company.com" {...field} autoComplete="email" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => ( 
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} autoComplete="current-password" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Login</Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="underline">Sign up</Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;