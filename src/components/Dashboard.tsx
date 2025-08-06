import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Package, Scissors, DollarSign, CheckCircle2, Clock, TrendingUp, Warehouse, ShoppingCart, Plus, Eye } from 'lucide-react';
import { dataStore } from '../services/dataStore';
import { CutJob, ReorderAlert } from '../types';

interface DashboardProps {
  onNewJob: () => void;
  onManageInventory: () => void;
  onViewJobs: () => void;
}

export function Dashboard({ onNewJob, onManageInventory, onViewJobs }: DashboardProps) {
  const [reorderAlerts, setReorderAlerts] = useState<ReorderAlert[]>([]);
  const [pendingJobs, setPendingJobs] = useState<CutJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<CutJob[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // Load dashboard data
    const alerts = dataStore.getReorderAlerts();
    const jobs = dataStore.getJobs();
    const pending = jobs.filter(job => job.status === 'pending');
    const completed = jobs.filter(job => job.status === 'completed');
    const revenue = completed.reduce((sum, job) => sum + job.totalCost, 0);

    setReorderAlerts(alerts);
    setPendingJobs(pending);
    setCompletedJobs(completed);
    setTotalRevenue(revenue);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-black">
            CUT & ORDER MANAGER
          </h1>
          <p className="text-lg text-gray-600">Hardware Store Management System</p>
        </div>
        <button 
          onClick={onNewJob} 
          className="btn-base btn-lg btn-coral"
        >
          <Scissors className="mr-2 h-5 w-5" />
          New Cut Job
        </button>
      </div>

      {/* Critical Inventory Alerts */}
      {reorderAlerts.length > 0 && (
        <div className="card-base p-6 hover:outline-coral">
          <div className="flex justify-between items-center">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-coral flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  🚨 URGENT: {reorderAlerts.length} material(s) need immediate reordering!
                </h3>
                <p className="text-base text-gray-600">
                  Critical stock levels detected. Order supplies now to avoid service interruptions.
                </p>
              </div>
            </div>
            <button
              onClick={onManageInventory}
              className="btn-base btn-coral"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order Now
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Cut Job Card */}
        <div className="card-base p-6 cursor-pointer hover:outline-mint" onClick={onNewJob}>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-mint rounded-full flex items-center justify-center mb-4">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Create Cut Job</h3>
            <p className="text-base text-gray-600 mb-6">Start a new cutting job for customers</p>
            <button className="btn-base btn-mint">
              New Job
            </button>
          </div>
        </div>

        {/* Inventory Management Card */}
        <div className={`card-base p-6 cursor-pointer ${reorderAlerts.length > 0 ? 'hover:outline-coral' : 'hover:outline-mint'}`} onClick={onManageInventory}>
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 ${reorderAlerts.length > 0 ? 'bg-coral' : 'bg-mint'} rounded-full flex items-center justify-center mb-4 relative`}>
              <Warehouse className="h-8 w-8 text-white" />
              {reorderAlerts.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-coral rounded-full flex items-center justify-center outline-2 outline-white outline-offset-0" style={{outlineStyle: 'solid'}}>
                  <span className="text-white text-xs font-bold">{reorderAlerts.length}</span>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-semibold mb-4">Inventory Manager</h3>
            <p className="text-base text-gray-600 mb-6">
              {reorderAlerts.length > 0 
                ? `${reorderAlerts.length} materials need reordering!`
                : 'Manage stock levels and suppliers'
              }
            </p>
            <button className={`btn-base ${reorderAlerts.length > 0 ? 'btn-coral' : 'btn-mint'}`}>
              Manage Inventory
            </button>
          </div>
        </div>

        {/* Job Manager Card */}
        <div className="card-base p-6 cursor-pointer hover:outline-lavender" onClick={onViewJobs}>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-lavender rounded-full flex items-center justify-center mb-4 relative">
              <Eye className="h-8 w-8 text-white" />
              {pendingJobs.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-lavender rounded-full flex items-center justify-center outline-2 outline-white outline-offset-0" style={{outlineStyle: 'solid'}}>
                  <span className="text-white text-xs font-bold">{pendingJobs.length}</span>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-semibold mb-4">Job Manager</h3>
            <p className="text-base text-gray-600 mb-6">
              {pendingJobs.length > 0 
                ? `${pendingJobs.length} pending jobs to process`
                : 'View and manage all cutting jobs'
              }
            </p>
            <button className="btn-base btn-lavender">
              View Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200 rounded-lg cursor-pointer" onClick={onViewJobs}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black uppercase">Completed Today</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-[#A6FFE2]" />
          </CardHeader>
          <CardContent>
                         <div className="text-3xl font-bold text-black inline-block px-4 py-2 rounded outline-2 outline-black outline-offset-0" style={{outlineStyle: 'solid'}}>{completedJobs.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Jobs finished today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200 rounded-lg cursor-pointer" onClick={onViewJobs}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black uppercase">Pending Jobs</CardTitle>
            <Clock className="h-5 w-5 text-[#C5A6FF]" />
          </CardHeader>
          <CardContent>
                         <div className="text-3xl font-bold text-black inline-block px-4 py-2 rounded outline-2 outline-black outline-offset-0" style={{outlineStyle: 'solid'}}>{pendingJobs.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Jobs waiting to be cut
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200 cursor-pointer" onClick={onManageInventory}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black uppercase">
              Low Stock Items
            </CardTitle>
            <Package className="h-5 w-5 text-[#FF8C82]" />
          </CardHeader>
          <CardContent>
                         <div className="text-3xl font-bold text-black inline-block px-4 py-2 rounded outline-2 outline-black outline-offset-0" style={{outlineStyle: 'solid'}}>
               {reorderAlerts.length}
             </div>
            <p className="text-xs text-gray-600 mt-1">
              Materials below threshold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black uppercase">Today's Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#A6FFE2]" />
          </CardHeader>
          <CardContent>
                         <div className="text-3xl font-bold text-black inline-block px-4 py-2 rounded outline-2 outline-black outline-offset-0" style={{outlineStyle: 'solid'}}>${totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              From completed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Quick Actions */}
      {reorderAlerts.length > 0 && (
        <div className="card-base p-6 hover:outline-coral">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-6 w-6 text-coral" />
            <h3 className="text-2xl font-semibold text-black">INVENTORY ACTIONS REQUIRED</h3>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-lg font-medium text-black">
                🚨 {reorderAlerts.length} materials critically low in stock
              </p>
              <p className="text-base text-gray-600 mt-1">
                Items: {reorderAlerts.map(alert => alert.materialName).join(', ')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onManageInventory}
                className="btn-base btn-coral"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Supplies
              </button>
              <button
                onClick={onManageInventory}
                className="btn-base bg-white text-coral outline-coral hover:outline-black hover:bg-coral hover:text-white"
              >
                <Warehouse className="h-4 w-4 mr-2" />
                Manage Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Cut Job */}
        <div className="card-base hover:outline-lavender">
          <div className="p-6 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-lavender" />
              <h3 className="text-2xl font-semibold text-black">LATEST CUT JOB</h3>
            </div>
          </div>
          <div className="p-6">
            {pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500 mb-6">No pending jobs</p>
                <button onClick={onNewJob} className="btn-base btn-mint">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.slice(0, 1).map(job => (
                  <div 
                    key={job.id} 
                    className="card-base p-6 cursor-pointer hover:outline-lavender"
                    onClick={onViewJobs}
                  >
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-black">Customer: {job.customerName}</p>
                      <p className="text-base text-gray-600">
                        Material: {job.material.name} - {job.length}ft × {job.quantity} pieces
                      </p>
                      <p className="text-base text-gray-600">Total: ${job.totalCost.toFixed(2)}</p>
                      {job.orderCode && (
                        <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded border">
                          Code: {job.orderCode}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {pendingJobs.length > 1 && (
                  <button onClick={onViewJobs} className="btn-base bg-white text-lavender outline-lavender hover:outline-black hover:bg-lavender hover:text-white w-full mt-4">
                    View All {pendingJobs.length} Pending Jobs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="card-base hover:outline-coral">
          <div className="p-6 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-coral" />
              <h3 className="text-2xl font-semibold text-black">INVENTORY ALERT</h3>
            </div>
          </div>
          <div className="p-6">
            {reorderAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500">All inventory levels good</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reorderAlerts.slice(0, 1).map(alert => (
                  <div 
                    key={alert.materialId} 
                    className="card-base p-6 cursor-pointer hover:outline-coral"
                    onClick={onManageInventory}
                  >
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-black">Pine 2×4 - Stock: 12ft</p>
                      <p className="text-base text-gray-600">Threshold: 20ft</p>
                      <p className="text-base text-coral font-semibold">Reorder needed</p>
                    </div>
                  </div>
                ))}
                {reorderAlerts.length > 1 && (
                  <button onClick={onManageInventory} className="btn-base bg-white text-coral outline-coral hover:outline-black hover:bg-coral hover:text-white w-full mt-4">
                    View All {reorderAlerts.length} Alerts
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}