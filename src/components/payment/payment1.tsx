import Payment from "./payment";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_51QyuUQAlzb98dcXiqKOAprivh0Ms3PdVIlR74mAcwPfGxaHhPfUBek8zJ0o3SejlP0jniOCHePHsQP8YOrmzrO1s00LAPjBeRb');

export default function Payment1() {    
    return (
        <Elements stripe={stripePromise}>
        
            <Payment />
        </Elements>
    );
}