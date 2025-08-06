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
          <h1 className="text-4xl font-bold text-black uppercase">
            Cut & Order Manager
          </h1>
          <p className="text-lg text-gray-600">Hardware Store Management System</p>
        </div>
        <Button 
          onClick={onNewJob} 
          size="lg" 
          className="bg-[#A6FFE2] text-black border border-[#A6FFE2] hover:bg-white hover:text-[#A6FFE2] transition-all duration-200"
        >
          <Scissors className="mr-2 h-5 w-5" />
          New Cut Job
        </Button>
      </div>

      {/* Critical Inventory Alerts */}
      {reorderAlerts.length > 0 && (
        <Alert className="border border-[#FF8C82] bg-white">
          <AlertTriangle className="h-6 w-6 text-[#FF8C82]" />
          <AlertDescription className="text-black">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">
                  🚨 URGENT: {reorderAlerts.length} material(s) need immediate reordering!
                </span>
                <p className="text-sm mt-1">
                  Critical stock levels detected. Order supplies now to avoid service interruptions.
                </p>
              </div>
              <Button
                onClick={onManageInventory}
                className="bg-[#FF8C82] text-white border border-[#FF8C82] hover:bg-white hover:text-[#FF8C82]"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Cut Job Card */}
        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200 rounded-lg cursor-pointer" onClick={onNewJob}>
          <CardHeader className="text-center p-6">
            <div className="mx-auto w-16 h-16 bg-[#A6FFE2] rounded-full flex items-center justify-center mb-4">
              <Scissors className="h-8 w-8 text-black" />
            </div>
            <CardTitle className="text-black uppercase">Create Cut Job</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Start a new cutting job for customers</p>
            <Button className="bg-[#A6FFE2] text-black border border-[#A6FFE2] hover:bg-white hover:text-[#A6FFE2]">
              New Job
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Management Card */}
        <Card className={`bg-white border-solv-thick border-black transition-colors duration-200 rounded-lg cursor-pointer`} onClick={onManageInventory}>
          <CardHeader className="text-center p-6">
            <div className={`mx-auto w-16 h-16 ${reorderAlerts.length > 0 ? 'bg-[#FF8C82]' : 'bg-[#A6FFE2]'} rounded-full flex items-center justify-center mb-4 relative`}>
              <Warehouse className="h-8 w-8 text-white" />
              {reorderAlerts.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF8C82] rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs font-bold">{reorderAlerts.length}</span>
                </div>
              )}
            </div>
            <CardTitle className="text-black uppercase">
              Inventory Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {reorderAlerts.length > 0 
                ? `${reorderAlerts.length} materials need reordering!`
                : 'Manage stock levels and suppliers'
              }
            </p>
            <Button 
              className={reorderAlerts.length > 0 
                ? 'bg-[#FF8C82] text-white border border-[#FF8C82] hover:bg-white hover:text-[#FF8C82]' 
                : 'bg-white text-[#A6FFE2] border border-[#A6FFE2] hover:bg-[#A6FFE2] hover:text-black'
              }
            >
              Manage Inventory
            </Button>
          </CardContent>
        </Card>

        {/* Job Manager Card */}
        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200 rounded-lg cursor-pointer" onClick={onViewJobs}>
          <CardHeader className="text-center p-6">
            <div className="mx-auto w-16 h-16 bg-[#C5A6FF] rounded-full flex items-center justify-center mb-4 relative">
              <Eye className="h-8 w-8 text-white" />
              {pendingJobs.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C5A6FF] rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs font-bold">{pendingJobs.length}</span>
                </div>
              )}
            </div>
            <CardTitle className="text-black uppercase">Job Manager</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {pendingJobs.length > 0 
                ? `${pendingJobs.length} pending jobs to process`
                : 'View and manage all cutting jobs'
              }
            </p>
            <Button className="bg-white text-[#C5A6FF] border border-[#C5A6FF] hover:bg-[#C5A6FF] hover:text-white">
              View Jobs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200 rounded-lg cursor-pointer" onClick={onViewJobs}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black uppercase">Completed Today</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-[#A6FFE2]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{completedJobs.length}</div>
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
            <div className="text-3xl font-bold text-black">{pendingJobs.length}</div>
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
            <div className="text-3xl font-bold text-black">
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
            <div className="text-3xl font-bold text-black">${totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              From completed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Quick Actions */}
      {reorderAlerts.length > 0 && (
        <Card className="bg-white border border-[#FF8C82] transition-colors duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black uppercase">
              <ShoppingCart className="h-5 w-5" />
              Inventory Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-black font-medium">
                  🚨 {reorderAlerts.length} materials critically low in stock
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Items: {reorderAlerts.map(alert => alert.materialName).join(', ')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onManageInventory}
                  className="bg-[#FF8C82] text-white border border-[#FF8C82] hover:bg-white hover:text-[#FF8C82]"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Supplies
                </Button>
                <Button
                  variant="outline"
                  onClick={onManageInventory}
                  className="border-[#FF8C82] text-[#FF8C82] hover:bg-[#FF8C82] hover:text-white"
                >
                  <Warehouse className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Jobs */}
        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200">
          <CardHeader className="bg-white border-b border-black p-6">
            <CardTitle className="flex items-center gap-2 text-black uppercase">
              <Clock className="h-5 w-5 text-[#C5A6FF]" />
              Latest Cut Job
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending jobs</p>
                <Button onClick={onNewJob} className="mt-4 bg-[#A6FFE2] text-black border border-[#A6FFE2] hover:bg-white hover:text-[#A6FFE2]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.slice(0, 1).map(job => (
                  <div 
                    key={job.id} 
                    className="p-6 bg-white rounded-lg border-solv-thick border-black transition-colors duration-200 cursor-pointer"
                    onClick={onViewJobs}
                  >
                    <div className="space-y-2">
                      <p className="font-semibold text-black">Customer: {job.customerName}</p>
                      <p className="text-sm text-gray-600">
                        Material: {job.material.name} - {job.length}ft × {job.quantity} pieces
                      </p>
                      <p className="text-sm text-gray-600">Total: ${job.totalCost.toFixed(2)}</p>
                      {job.orderCode && (
                        <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border">
                          Code: {job.orderCode}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {pendingJobs.length > 1 && (
                  <Button variant="outline" onClick={onViewJobs} className="w-full mt-4 border-[#C5A6FF] text-[#C5A6FF] hover:bg-[#C5A6FF] hover:text-white">
                    View All {pendingJobs.length} Pending Jobs
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Alert */}
        <Card className="bg-white border-solv-thick border-black rounded-lg transition-colors duration-200">
          <CardHeader className="bg-white border-b border-black p-6">
            <CardTitle className="flex items-center gap-2 text-black uppercase">
              <Package className="h-5 w-5 text-[#FF8C82]" />
              Inventory Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {reorderAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">All inventory levels good</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reorderAlerts.slice(0, 1).map(alert => (
                  <div 
                    key={alert.materialId} 
                    className="p-6 bg-white rounded-lg border-solv-thick border-black transition-colors duration-200 cursor-pointer"
                    onClick={onManageInventory}
                  >
                    <div className="space-y-2">
                      <p className="font-semibold text-black">Pine 2×4 - Stock: 12ft</p>
                      <p className="text-sm text-gray-600">Threshold: 20ft</p>
                      <p className="text-sm text-[#FF8C82] font-semibold">Reorder needed</p>
                    </div>
                  </div>
                ))}
                {reorderAlerts.length > 1 && (
                  <Button variant="outline" onClick={onManageInventory} className="w-full mt-4 border-[#FF8C82] text-[#FF8C82] hover:bg-[#FF8C82] hover:text-white">
                    View All {reorderAlerts.length} Alerts
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}