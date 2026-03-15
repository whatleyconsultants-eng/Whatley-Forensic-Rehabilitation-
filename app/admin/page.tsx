'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'contract' | 'invoice'>('invoice');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    lawyerEmail: '',
    invoiceNumber: '',
    amount: '',
    dueDate: '',
    file: null as File | null,
  });

  // Contract form state
  const [contractForm, setContractForm] = useState({
    lawyerEmail: '',
    file: null as File | null,
  });

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('lawyerEmail', invoiceForm.lawyerEmail);
      formData.append('invoiceNumber', invoiceForm.invoiceNumber);
      formData.append('amount', invoiceForm.amount);
      formData.append('dueDate', invoiceForm.dueDate);
      if (invoiceForm.file) {
        formData.append('file', invoiceForm.file);
      }

      const response = await fetch('/api/admin/upload-invoice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Invoice uploaded and email sent successfully!');
        setInvoiceForm({
          lawyerEmail: '',
          invoiceNumber: '',
          amount: '',
          dueDate: '',
          file: null,
        });
      } else {
        setError(data.error || 'Failed to upload invoice');
      }
    } catch (err) {
      setError('Failed to upload invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('lawyerEmail', contractForm.lawyerEmail);
      if (contractForm.file) {
        formData.append('file', contractForm.file);
      }

      const response = await fetch('/api/admin/upload-contract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Contract uploaded successfully!');
        setContractForm({
          lawyerEmail: '',
          file: null,
        });
      } else {
        setError(data.error || 'Failed to upload contract');
      }
    } catch (err) {
      setError('Failed to upload contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View as Lawyer
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('invoice')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'invoice'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Invoice
              </button>
              <button
                onClick={() => setActiveTab('contract')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'contract'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Contract
              </button>
            </nav>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Invoice Upload Form */}
            {activeTab === 'invoice' && (
              <form onSubmit={handleInvoiceSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lawyer Email
                  </label>
                  <input
                    type="email"
                    required
                    value={invoiceForm.lawyerEmail}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, lawyerEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="lawyer@firm.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="INV-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={invoiceForm.amount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1500.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice PDF
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Uploading...' : 'Upload Invoice & Send Email'}
                </button>
              </form>
            )}

            {/* Contract Upload Form */}
            {activeTab === 'contract' && (
              <form onSubmit={handleContractSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lawyer Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contractForm.lawyerEmail}
                    onChange={(e) =>
                      setContractForm({ ...contractForm, lawyerEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="lawyer@firm.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract PDF
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) =>
                      setContractForm({
                        ...contractForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Uploading...' : 'Upload Contract'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Upload invoices as PDF files only</li>
            <li>• An email notification will be sent to the lawyer automatically</li>
            <li>• Lawyers can view and pay invoices through their portal</li>
            <li>• All payments are processed securely through Stripe</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
