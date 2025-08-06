import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Search, CheckCircle, XCircle, Eye, Clock, CheckCircle2 } from 'lucide-react';
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
        <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Job Manager
          </h1>
          <p className="text-gray-600">Manage and track all cutting jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Jobs List */}
        <div className="xl:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
              <CardTitle className="text-slate-800">All Jobs</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer, material, or order code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
            </CardContent>
          </Card>
        </div>

        {/* Job Details */}
        <div>
          <Card className="shadow-lg sticky top-4">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="text-slate-800">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700">
                            Created: {selectedJob.createdAt.toLocaleDateString()} at {selectedJob.createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                        {selectedJob.completedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                      <Eye className="h-4 w-4 mr-2" />
                      View Ticket
                    </Button>

                    {selectedJob.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateJobStatus(selectedJob.id, 'completed')}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button
                          onClick={() => updateJobStatus(selectedJob.id, 'cancelled')}
                          variant="destructive"
                          className="w-full"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Job
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a job to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
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