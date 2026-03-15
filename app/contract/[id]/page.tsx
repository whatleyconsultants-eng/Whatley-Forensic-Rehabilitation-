'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Contract {
  id: string;
  documentUrl: string;
  status: string;
  acceptedAt: string | null;
  createdAt: string;
}

export default function ContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        setError('Contract not found');
        return;
      }

      const data = await response.json();
      setContract(data);
    } catch (error) {
      setError('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!agreed) {
      alert('Please check the box to agree to the terms');
      return;
    }

    setAccepting(true);
    setError('');

    try {
      const response = await fetch(`/api/contracts/${contractId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Contract signed successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to accept contract');
      }
    } catch (error) {
      setError('Failed to accept contract');
    } finally {
      setAccepting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download contract');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Contract not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAccepted = contract.status === 'accepted';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Service Agreement</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {isAccepted && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  You signed this contract on {new Date(contract.acceptedAt!).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contract Viewer */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Contract Document</h2>
              <button
                onClick={handleDownload}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="p-6">
            <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={contract.documentUrl}
                className="w-full h-full"
                title="Contract Document"
              />
            </div>
          </div>

          {/* Acceptance Section */}
          {!isAccepted && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agree"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agree" className="font-medium text-gray-700">
                      I have read and agree to the terms of this service agreement
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}

                <button
                  onClick={handleAccept}
                  disabled={!agreed || accepting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {accepting ? 'Signing...' : 'Sign Agreement'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By signing, you electronically accept the terms of this agreement. 
                  Your IP address and timestamp will be recorded for verification purposes.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
