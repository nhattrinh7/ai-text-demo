'use client';

import { useState, Suspense } from 'react';
import { verifyEmail, resendVerificationCode } from '~/app/actions/auth';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyForm() {
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || '';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    formData.append('email', email);

    const result = await verifyEmail(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/login');
    }
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setError('');
    setMessage('');

    const result = await resendVerificationCode(email);
    if (result?.error) {
      setError(result.error);
    } else {
      setMessage('A new 6-digit code has been sent to your email.');
    }
    setResending(false);
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a 6-digit code to {email}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {message && (
            <div className="text-green-600 text-sm text-center font-medium">
              {message}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="code" className="sr-only">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-center tracking-widest text-2xl"
                placeholder="000000"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">
            Didn't receive the code or it expired?{' '}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
