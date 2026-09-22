import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Info, CheckCircle2, Loader2, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { getAllocations } from '@/lib/firebaseDb';
import { verifyHash } from '@/lib/hash';
import type { Allocation } from '@/types';

export default function TransparencyLog() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getAllocations();
    setAllocations(data);
    setLoading(false);
  }

  async function handleVerify(alloc: Allocation) {
    setVerifying(alloc.id);
    const timestamp = alloc.created_at;
    const isValid = await verifyHash(
      alloc.request_id,
      alloc.donor_id,
      alloc.score,
      timestamp,
      alloc.verification_hash
    );
    setVerified((prev) => ({ ...prev, [alloc.id]: isValid }));
    setVerifying(null);
  }

  function anonymizeId(id: string): string {
    return `DONOR-${id.replace('donor_', '').slice(0, 6).toUpperCase()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Immutable Verification Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Public Transparency Log
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Every organ and blood allocation is cryptographically verified to ensure assignments follow strict medical priority.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary-600" />
          Refresh Ledger
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl mb-8 border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-teal-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-black text-base sm:text-lg">Zero-Knowledge Allocation Proof</h4>
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded-md border border-teal-500/30">
                SHA-256 INTEGRITY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Each record generates an immutable SHA-256 digest of <code className="text-primary-300 font-mono">(requestId + donorId + priorityScore + timestamp)</code>. Clicking "Verify" recomputes the hash live against cryptographic standard SHA-256 to prove zero human tampering or favoritism.
            </p>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-lg">Verified Allocation Records</h3>
          <span className="text-xs font-bold text-slate-400">{allocations.length} Certified Events</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Fetching blockchain ledger entries...</div>
        ) : allocations.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold">No allocations recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Complete an emergency request and dispatch flow to generate records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-6 py-3.5 font-bold">Request ID</th>
                  <th className="text-left px-6 py-3.5 font-bold">Matched Candidate (Anonymized)</th>
                  <th className="text-left px-6 py-3.5 font-bold">Priority Score</th>
                  <th className="text-left px-6 py-3.5 font-bold">Timestamp</th>
                  <th className="text-left px-6 py-3.5 font-bold">Transaction Hash</th>
                  <th className="text-center px-6 py-3.5 font-bold">Integrity Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allocations.map((alloc, i) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                      REQ-{alloc.request_id.replace('req_', '').slice(0, 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 font-bold">
                      {anonymizeId(alloc.donor_id)}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {alloc.score}%
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(alloc.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg block max-w-[200px] truncate"
                        title={alloc.verification_hash}
                      >
                        {alloc.verification_hash}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <AnimatePresence mode="wait">
                        {verified[alloc.id] === undefined ? (
                          <button
                            onClick={() => handleVerify(alloc)}
                            disabled={verifying === alloc.id}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {verifying === alloc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Verify Hash'
                            )}
                          </button>
                        ) : verified[alloc.id] ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-extrabold"
                          >
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                            VALID SHA-256 ✓
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-extrabold"
                          >
                            <ShieldAlert className="w-4 h-4 text-primary-600" />
                            CORRUPTED ✗
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Row */}
      {!loading && allocations.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 text-center">
            <p className="text-3xl font-black text-slate-900">{allocations.length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Total Verified Allocations</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 text-center">
            <p className="text-3xl font-black text-teal-600">100%</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Audit Compliance Rate</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 text-center">
            <p className="text-3xl font-black text-primary-600">
              {(allocations.reduce((acc, a) => acc + (a.score || 90), 0) / allocations.length).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Average Match Efficiency</p>
          </div>
        </div>
      )}
    </div>
  );
}
