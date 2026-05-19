import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { paymentAPI } from '@/services/api';
import {
  Lock,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

type CardType = 'visa' | 'mastercard' | 'verve' | 'unknown';

function detectCard(number: string): CardType {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^(5061|6500|6501)/.test(n)) return 'verve';
  return 'unknown';
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// Simulated card number that "works" in mock mode
const DEMO_CARD = '4111 1111 1111 1111';
const DEMO_EXPIRY = '12/28';
const DEMO_CVV = '123';
const DEMO_NAME = 'TEST USER';

export default function PaymentMock() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cvvFocused, setCvvFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseId, setCourseId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const cardType = detectCard(cardNumber);

  // Countdown after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown === 0) {
      if (courseId) navigate(`/lesson/${courseId}`);
      else navigate('/dashboard');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, courseId, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 16) errs.cardNumber = 'Enter a valid 16-digit card number.';
    if (expiry.length < 5) errs.expiry = 'Enter a valid expiry date (MM/YY).';
    if (cvv.length < 3) errs.cvv = 'CVV must be at least 3 digits.';
    if (!cardName.trim()) errs.cardName = 'Enter the name on the card.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (!reference) return;
    if (!validate()) return;

    setStatus('processing');
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2200));

    try {
      const response = await paymentAPI.verify(reference);
      const cId = response.data?.courseId;
      const cIdStr = (cId?._id || cId)?.toString() ?? null;
      setCourseId(cIdStr);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const fillDemo = () => {
    setCardNumber(DEMO_CARD);
    setExpiry(DEMO_EXPIRY);
    setCvv(DEMO_CVV);
    setCardName(DEMO_NAME);
    setErrors({});
  };

  if (!reference) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#D91A1A] mx-auto mb-4" />
          <p className="text-[#F8F8F0]/60">Invalid payment session.</p>
          <Link to="/library" className="mt-4 inline-block text-sm text-[#D91A1A] hover:underline">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  // ── SUCCESS STATE ──────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Animated check */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl text-[#F8F8F0] mb-2">Payment Successful!</h1>
          <p className="text-[#F8F8F0]/50 mb-8">
            Your enrollment has been confirmed. You now have full access to the course.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#F8F8F0]/40">Reference</span>
              <span className="text-[#F8F8F0]/80 font-mono text-xs">{reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F8F8F0]/40">Status</span>
              <span className="text-green-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
              </span>
            </div>
          </div>

          <div className="bg-[#D91A1A]/10 border border-[#D91A1A]/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-[#D91A1A] mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Redirecting to your course...</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D91A1A] rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[#F8F8F0]/40 w-6 text-right">{countdown}s</span>
            </div>
          </div>

          <button
            onClick={() => courseId ? navigate(`/lesson/${courseId}`) : navigate('/dashboard')}
            className="w-full py-3.5 bg-[#D91A1A] hover:bg-[#b81616] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Start Learning Now
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-[#D91A1A]" />
          </div>
          <h1 className="font-serif text-3xl text-[#F8F8F0] mb-2">Payment Failed</h1>
          <p className="text-[#F8F8F0]/50 mb-8">
            We couldn't verify your payment. Please try again or contact support.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStatus('form')}
              className="w-full py-3.5 bg-[#D91A1A] hover:bg-[#b81616] text-white rounded-xl font-semibold transition-all"
            >
              Try Again
            </button>
            <Link
              to="/library"
              className="w-full py-3.5 border border-white/10 text-[#F8F8F0]/60 hover:text-[#F8F8F0] rounded-xl text-sm transition-colors text-center"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── PROCESSING STATE ───────────────────────────────────────────
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#D91A1A]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#D91A1A] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#F8F8F0]/40" />
            </div>
          </div>
          <h2 className="font-serif text-2xl text-[#F8F8F0] mb-2">Processing Payment</h2>
          <p className="text-[#F8F8F0]/40 text-sm">
            Please wait while we securely process your transaction...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#F8F8F0]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  // ── CARD FORM ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F8F8F0]">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#F8F8F0]/60 hover:text-[#F8F8F0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 text-xs">
            <Lock className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400/80">Secured by Paystack</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-[#F8F8F0]/50 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            Test / Sandbox Mode
          </div>
          <h1 className="font-serif text-3xl text-[#F8F8F0] mb-1">Complete Payment</h1>
          <p className="text-[#F8F8F0]/40 text-sm">
            Reference: <span className="font-mono text-[#F8F8F0]/60">{reference}</span>
          </p>
        </div>

        {/* Demo fill banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-amber-300 font-medium mb-1">Test Mode Active</p>
            <p className="text-amber-400/60 text-xs">
              No real charges will be made.{' '}
              <button
                onClick={fillDemo}
                className="underline text-amber-300 hover:text-amber-200"
              >
                Use test card details
              </button>
            </p>
          </div>
        </div>

        {/* Visual Card Preview */}
        <div className="mb-6">
          <div
            className={`relative h-44 rounded-2xl p-6 overflow-hidden transition-all duration-500 ${
              cvvFocused
                ? 'bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]'
                : 'bg-gradient-to-br from-[#1e0e0e] via-[#1a0a2e] to-[#001B71]'
            }`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/30" />
              <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-2 border-white/20" />
            </div>

            {cvvFocused ? (
              // CVV side
              <div className="flex flex-col justify-between h-full">
                <div className="h-8 bg-black/60 -mx-6 mt-2" />
                <div className="flex justify-end mt-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded px-4 py-2 text-sm font-mono tracking-widest">
                    {cvv || '•••'}
                  </div>
                </div>
                <p className="text-[#F8F8F0]/30 text-xs">CVV</p>
              </div>
            ) : (
              // Card front
              <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 rounded-sm bg-amber-300/80 flex items-center justify-center">
                    <div className="w-6 h-4 rounded-sm bg-amber-500/80" />
                  </div>
                  <div className="text-right">
                    <span className="text-[#F8F8F0]/60 text-xs font-bold uppercase tracking-widest">
                      {cardType === 'visa' ? 'VISA' :
                       cardType === 'mastercard' ? 'MASTERCARD' :
                       cardType === 'verve' ? 'VERVE' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-xl text-[#F8F8F0] tracking-widest mb-3">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[#F8F8F0]/30 text-[10px] uppercase tracking-widest mb-0.5">Card Holder</p>
                      <p className="text-sm font-medium text-[#F8F8F0] truncate max-w-[180px]">
                        {cardName || 'YOUR NAME'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#F8F8F0]/30 text-[10px] uppercase tracking-widest mb-0.5">Expires</p>
                      <p className="text-sm font-medium text-[#F8F8F0]">{expiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 space-y-5">
          {/* Card Number */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F8F8F0]/40 mb-2">
              Card Number
            </label>
            <div className="relative">
              <input
                id="card-number-input"
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={`w-full bg-white/5 border ${
                  errors.cardNumber ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3.5 text-[#F8F8F0] font-mono text-sm placeholder:text-[#F8F8F0]/20 focus:outline-none focus:border-[#D91A1A]/60 transition-colors pr-12`}
              />
              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8F8F0]/20" />
            </div>
            {errors.cardNumber && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
              </p>
            )}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F8F8F0]/40 mb-2">
                Expiry Date
              </label>
              <input
                id="card-expiry-input"
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className={`w-full bg-white/5 border ${
                  errors.expiry ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3.5 text-[#F8F8F0] font-mono text-sm placeholder:text-[#F8F8F0]/20 focus:outline-none focus:border-[#D91A1A]/60 transition-colors`}
              />
              {errors.expiry && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.expiry}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F8F8F0]/40 mb-2">
                CVV
              </label>
              <input
                id="card-cvv-input"
                type="text"
                inputMode="numeric"
                placeholder="•••"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onFocus={() => setCvvFocused(true)}
                onBlur={() => setCvvFocused(false)}
                className={`w-full bg-white/5 border ${
                  errors.cvv ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3.5 text-[#F8F8F0] font-mono text-sm placeholder:text-[#F8F8F0]/20 focus:outline-none focus:border-[#D91A1A]/60 transition-colors`}
              />
              {errors.cvv && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.cvv}
                </p>
              )}
            </div>
          </div>

          {/* Name on Card */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F8F8F0]/40 mb-2">
              Name on Card
            </label>
            <input
              id="card-name-input"
              type="text"
              placeholder="JOHN DOE"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              className={`w-full bg-white/5 border ${
                errors.cardName ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-4 py-3.5 text-[#F8F8F0] font-mono text-sm placeholder:text-[#F8F8F0]/20 focus:outline-none focus:border-[#D91A1A]/60 transition-colors tracking-wider`}
            />
            {errors.cardName && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.cardName}
              </p>
            )}
          </div>

          {/* Pay Button */}
          <button
            id="pay-now-btn"
            onClick={handlePay}
            className="w-full py-4 rounded-xl bg-[#D91A1A] hover:bg-[#b81616] text-white font-bold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#D91A1A]/20 hover:shadow-[#D91A1A]/40 hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            <Lock className="w-4 h-4" />
            Pay Securely
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <p className="text-xs text-[#F8F8F0]/30">
              Your card details are encrypted and never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
