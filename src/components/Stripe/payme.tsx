import React, { useState, useEffect } from 'react';
import CheckoutForm from './stripe';

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const amount = 5000; // Amount in cents (adjust as needed)

  useEffect(() => {
    console.log('Fetching clientSecret...');
    fetch('http://localhost:5000/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok: ' + res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Received data:', data);
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching clientSecret:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Payment Checkout</h2>
      {clientSecret ? (
        <CheckoutForm clientSecret={clientSecret} />
      ) : (
        <div>Error loading payment details.</div>
      )}
    </div>
  );
};

export default PaymentPage;
