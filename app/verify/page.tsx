'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    router.push(`/verify/${certificateId.trim()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-400 mb-2">
          Certificate Verification
        </h1>
        <p className="text-gray-400 mb-6">
          Enter the certificate ID to verify its authenticity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="certificateId" className="block text-sm font-medium text-gray-300 mb-1">
              Certificate ID
            </label>
            <input
              type="text"
              id="certificateId"
              value={certificateId}
              onChange={(e) => {
                setCertificateId(e.target.value);
                setError('');
              }}
              placeholder="Enter certificate ID"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Verify Certificate
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-700">
          <p className="text-sm text-gray-400 text-center">
            Example: Enter a certificate ID like &quot;CERT-2024-001&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
