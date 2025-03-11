import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './stripe';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, DollarSign, ShoppingBag, Sparkles, CreditCard, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const stripePromise = loadStripe('your_publishable_key');

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const amount = 5000;

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 px-4">
        <Card className="border-0 shadow-2xl bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <Skeleton className="h-16 w-[400px] mx-auto bg-white/5" />
            <Skeleton className="h-8 w-[300px] mx-auto mt-6 bg-white/5" />
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5" />
            <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 px-4">
        <Alert variant="destructive" className="border-0 shadow-2xl bg-black/40 backdrop-blur-xl">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-xl">Payment Error</AlertTitle>
          <AlertDescription className="text-base mt-2">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute inset-0 " />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQ4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnptMC0xMmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-40" />
      
      <div className="relative max-w-6xl mx-auto py-20 px-4 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-center space-y-8"
        >
          <motion.div 
            className="flex items-center justify-center gap-6"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-3xl"
            />
            <div className="relative flex gap-4">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-6xl font-bold tracking-tighter text-white">
            Complete Your Purchase
          </h1>
          
          <p className="text-2xl text-zinc-400 max-w-2xl mx-auto">
            Secure payment processing with advanced encryption
          </p>

          <motion.div 
            className="flex items-center justify-center gap-4 pt-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <DollarSign className="h-8 w-8 text-white" />
              <span className="text-3xl font-bold text-white">{(amount / 100).toFixed(2)}</span>
              <Sparkles className="h-6 w-6 text-white/80 animate-pulse" />
            </div>
          </motion.div>
        </motion.div>

        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <Alert variant="destructive" className="max-w-3xl mx-auto border-0 shadow-2xl bg-black/40 backdrop-blur-xl">
            <AlertCircle className="h-6 w-6" />
            <AlertDescription className="text-base">Failed to initialize payment form.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;