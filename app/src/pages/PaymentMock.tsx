import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { paymentAPI } from '@/services/api';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentMock: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const reference = searchParams.get('reference');

  const handleSimulatePayment = async () => {
    if (!reference) return;
    setStatus('verifying');
    try {
      await paymentAPI.verify(reference);
      setStatus('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Verification failed:', error);
      setStatus('error');
    }
  };

  if (!reference) return <div className="p-8 text-center">Invalid payment session.</div>;

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-[#1A1A1A]/5 p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#001B71]/10 flex items-center justify-center">
            <CheckCircle2 className={`w-8 h-8 ${status === 'success' ? 'text-green-500' : 'text-[#001B71]'}`} />
          </div>
        </div>

        <h1 className="font-serif text-2xl text-[#1A1A1A] mb-2">
          {status === 'pending' && 'Simulate Payment'}
          {status === 'verifying' && 'Verifying Payment...'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'error' && 'Payment Failed'}
        </h1>
        
        <p className="text-[#6B6B6B] mb-8">
          {status === 'pending' && 'This is a development mock. Click below to simulate a successful transaction.'}
          {status === 'verifying' && 'Communicating with the secure backend...'}
          {status === 'success' && 'You have been successfully enrolled. Redirecting to dashboard...'}
          {status === 'error' && 'Something went wrong during verification. Please try again.'}
        </p>

        {status === 'pending' && (
          <Button 
            onClick={handleSimulatePayment}
            className="w-full bg-[#D91A1A] hover:bg-[#D91A1A]/90 text-white py-6"
          >
            Pay Now (Test Mode)
          </Button>
        )}

        {status === 'verifying' && (
          <div className="flex items-center justify-center gap-2 text-[#001B71]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Processing...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-600 font-medium">
            Redirecting in 3 seconds...
          </div>
        )}

        {status === 'error' && (
          <Button 
            onClick={() => navigate('/library')}
            variant="outline"
            className="w-full"
          >
            Back to Library
          </Button>
        )}

        <div className="mt-8 pt-6 border-t border-[#1A1A1A]/5">
          <p className="text-[10px] text-[#6B6B6B] uppercase tracking-widest font-medium">
            Transaction Reference: {reference}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMock;
