import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles, Fingerprint, Shield, Scan } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'Test User' },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || 'Payment failed');
      } else if (paymentResult.paymentIntent.status === 'succeeded') {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-900/50 to-zinc-900/20 blur-3xl -z-10 rounded-[3rem]" />
      
      <Card className="w-full max-w-3xl mx-auto overflow-hidden border-0 shadow-[0_0_50px_rgba(0,0,0,0.25)] bg-black/40 backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        
        <CardHeader className="space-y-8 pt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -inset-4 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-lg"
              />
              <div className="relative bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <div className="space-y-4 text-center">
            <CardTitle className="text-4xl font-bold tracking-tight text-white">
              Secure Payment
            </CardTitle>
            <CardDescription className="text-xl text-zinc-400">
              Complete your purchase with our encrypted system
            </CardDescription>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4">
            {[
              { icon: Shield, text: "Bank-level Security" },
              { icon: Fingerprint, text: "Biometric Verification" },
              { icon: Scan, text: "Instant Processing" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <item.icon className="h-6 w-6 text-white/80" />
                <span className="text-sm text-zinc-400">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative p-8 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '18px',
                        color: '#ffffff',
                        '::placeholder': {
                          color: '#9ca3af',
                        },
                        iconColor: '#ffffff',
                      },
                    },
                  }}
                />
                <motion.div 
                  className="absolute right-8 top-8"
                  animate={{ 
                    opacity: [0.5, 1],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Lock className="h-6 w-6 text-white/80" />
                </motion.div>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 backdrop-blur-xl">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="text-base font-medium">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Alert className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    <AlertDescription className="text-base font-medium text-emerald-500">
                      Payment successful! Thank you for your purchase.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="px-8 pb-12">
            <Button 
              type="submit" 
              size="lg"
              className={cn(
                "w-full text-lg py-7 rounded-2xl transition-all duration-500",
                "bg-white text-black hover:bg-zinc-200",
                "shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(255,255,255,0.35)]",
                success && "bg-emerald-500 hover:bg-emerald-600",
                "relative overflow-hidden"
              )}
              disabled={!stripe || processing || success}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent"
                animate={{
                  x: ["0%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {processing ? (
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ opacity: [0.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </motion.div>
              ) : success ? (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Payment Complete
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-3 font-semibold"
                  whileHover={{ scale: 1.02 }}
                >
                  <Lock className="h-6 w-6" />
                  Pay Securely
                </motion.div>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default CheckoutForm;