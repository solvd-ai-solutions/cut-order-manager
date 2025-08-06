import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { dataStore } from '../services/dataStore';
import { CutJob } from '../types';
import { TicketPreviewModal } from './TicketPreviewModal';

interface JobManagerProps {
  onBack: () => void;
}

export function JobManager({ onBack }: JobManagerProps) {
  const [jobs, setJobs] = useState<CutJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<CutJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<CutJob | null>(null);
  const [showTicketPreview, setShowTicketPreview] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.orderCode && job.orderCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  const loadJobs = () => {
    const allJobs = dataStore.getJobs();
    // Sort by creation date, newest first
    allJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setJobs(allJobs);
  };

  const updateJobStatus = (jobId: string, status: CutJob['status']) => {
    dataStore.updateJobStatus(jobId, status);
    loadJobs();
    if (selectedJob && selectedJob.id === jobId) {
      const updatedJob = jobs.find(j => j.id === jobId);
      setSelectedJob(updatedJob || null);
    }
  };

  const getStatusBadge = (status: CutJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleShowTicket = (job: CutJob) => {
    setSelectedJob(job);
    setShowTicketPreview(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="btn-base bg-white text-black outline-black hover:outline-mint hover:bg-mint hover:text-white">
                        <span className="mr-2">⬅️</span>
          Back to Dashboard
        </button>
        <div>
          <h1 className="text-4xl font-bold text-black">
            JOB MANAGER
          </h1>
          <p className="text-lg text-gray-600">Manage and track all cutting jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Jobs List */}
        <div className="xl:col-span-2">
          <div className="card-base hover:outline-lavender">
            <div className="p-6 border-b-2 border-black">
              <h3 className="text-2xl font-semibold text-black mb-4">ALL JOBS</h3>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    placeholder="Search by customer, material, or order code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-10"
                  />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base w-40">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl text-gray-300 mx-auto mb-4 block">🔍</span>
                    <p className="text-gray-500">
                      {jobs.length === 0 ? 'No jobs found' : 'No jobs match your search'}
                    </p>
                  </div>
                ) : (
                  filteredJobs.map(job => (
                    <div
                      key={job.id}
                      className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedJob?.id === job.id 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{job.customerName}</h3>
                          <p className="text-sm text-gray-500">Job #{job.id}</p>
                          {job.orderCode && (
                            <p className="text-sm font-mono bg-white px-2 py-1 rounded border mt-1 inline-block">
                              {job.orderCode}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Material</p>
                          <p className="font-semibold">{job.material.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Specifications</p>
                          <p className="font-semibold">{job.length}ft × {job.quantity} pieces</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="font-semibold text-green-700">${job.totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="font-semibold">{job.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div>
          <div className="card-base sticky top-4 hover:outline-coral">
            <div className="p-6 border-b-2 border-black">
              <h3 className="text-2xl font-semibold text-black">JOB DETAILS</h3>
            </div>
            <div className="p-6">
              {selectedJob ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{selectedJob.customerName}</h3>
                    <p className="text-gray-500">Job #{selectedJob.id}</p>
                    {selectedJob.orderCode && (
                      <p className="text-lg font-mono bg-gradient-to-r from-slate-900 to-slate-700 text-white px-4 py-2 rounded-lg mt-2 tracking-widest">
                        {selectedJob.orderCode}
                      </p>
                    )}
                    <div className="mt-3">
                      {getStatusBadge(selectedJob.status)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Job Specifications</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Material:</span>
                          <span className="font-semibold">{selectedJob.material.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Length:</span>
                          <span className="font-semibold">{selectedJob.length} ft</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-semibold">{selectedJob.quantity} pieces</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Length:</span>
                          <span className="font-semibold">{(selectedJob.length * selectedJob.quantity).toFixed(2)} ft</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-3">Cost Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Material:</span>
                          <span className="font-semibold">${(selectedJob.totalCost - selectedJob.laborCost - selectedJob.wasteCost).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Labor:</span>
                          <span className="font-semibold">${selectedJob.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Waste:</span>
                          <span className="font-semibold">${selectedJob.wasteCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-200">
                          <span className="font-bold text-green-800">Total:</span>
                          <span className="font-bold text-green-800">${selectedJob.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">🕐</span>
                          <span className="text-blue-700">
                            Created: {selectedJob.createdAt.toLocaleDateString()} at {selectedJob.createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                        {selectedJob.completedAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-green-700">
                              Completed: {selectedJob.completedAt.toLocaleDateString()} at {selectedJob.completedAt.toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedJob.notes && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Special Instructions</h4>
                        <p className="text-yellow-700 text-sm">{selectedJob.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button 
                      onClick={() => handleShowTicket(selectedJob)}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <span className="mr-2">👁️</span>
                      View Ticket
                    </Button>

                    {selectedJob.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateJobStatus(selectedJob.id, 'completed')}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <span className="mr-2">✅</span>
                          Mark Complete
                        </Button>
                        <Button
                          onClick={() => updateJobStatus(selectedJob.id, 'cancelled')}
                          variant="destructive"
                          className="w-full"
                        >
                          <span className="mr-2">❌</span>
                          Cancel Job
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl text-gray-300 mx-auto mb-4 block">🔍</span>
                  <p className="text-gray-500">Select a job to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Preview Modal */}
      {selectedJob && (
        <TicketPreviewModal
          isOpen={showTicketPreview}
          onClose={() => setShowTicketPreview(false)}
          ticket={{
            orderCode: selectedJob.orderCode || 'N/A',
            customerName: selectedJob.customerName,
            materialName: selectedJob.material.name,
            length: selectedJob.length,
            quantity: selectedJob.quantity,
            totalCost: selectedJob.totalCost,
            notes: selectedJob.notes,
            createdAt: selectedJob.createdAt,
            jobId: selectedJob.id,
            status: selectedJob.status,
            completedAt: selectedJob.completedAt,
          }}
        />
      )}
    </div>
  );
}