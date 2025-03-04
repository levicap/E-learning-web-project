import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Test User', // Replace with actual user data
        },
      },
    });

    if (paymentResult.error) {
      setError(paymentResult.error.message);
    } else if (paymentResult.paymentIntent.status === 'succeeded') {
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
<CardElement options={{ style: { base: { fontSize: '18px', color: '#424770' } } }} />
<button type="submit" disabled={!stripe}>
        Pay
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Payment Successful!</div>}
    </form>
  );
};

export default CheckoutForm;
