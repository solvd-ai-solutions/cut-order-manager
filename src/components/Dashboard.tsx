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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Cut & Order Manager
          </h1>
          <p className="text-lg text-muted-foreground">Hardware Store Management System</p>
        </div>
        <Button 
          onClick={onNewJob} 
          size="lg" 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Scissors className="mr-2 h-5 w-5" />
          New Cut Job
        </Button>
      </div>

      {/* Critical Inventory Alerts */}
      {reorderAlerts.length > 0 && (
        <Alert className="border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg animate-pulse">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertDescription className="text-red-800">
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
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
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
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onNewJob}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-blue-800">Create Cut Job</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-700 mb-4">Start a new cutting job for your customers</p>
            <Badge className="bg-blue-200 text-blue-800">Quick Start</Badge>
          </CardContent>
        </Card>

        {/* Inventory Management Card */}
        <Card className={`bg-gradient-to-br ${reorderAlerts.length > 0 ? 'from-red-50 to-orange-100 border-red-200' : 'from-green-50 to-emerald-100 border-green-200'} hover:shadow-xl transition-all duration-300 cursor-pointer group`} onClick={onManageInventory}>
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${reorderAlerts.length > 0 ? 'from-red-600 to-orange-600' : 'from-green-600 to-emerald-600'} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative`}>
              <Warehouse className="h-8 w-8 text-white" />
              {reorderAlerts.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{reorderAlerts.length}</span>
                </div>
              )}
            </div>
            <CardTitle className={reorderAlerts.length > 0 ? 'text-red-800' : 'text-green-800'}>
              Inventory Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className={`${reorderAlerts.length > 0 ? 'text-red-700' : 'text-green-700'} mb-4`}>
              {reorderAlerts.length > 0 
                ? `${reorderAlerts.length} materials need reordering!`
                : 'Manage stock levels and suppliers'
              }
            </p>
            <Badge className={reorderAlerts.length > 0 
              ? 'bg-red-200 text-red-800 animate-pulse' 
              : 'bg-green-200 text-green-800'
            }>
              {reorderAlerts.length > 0 ? '🚨 Action Required' : 'All Good'}
            </Badge>
          </CardContent>
        </Card>

        {/* Job Manager Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onViewJobs}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative">
              <Eye className="h-8 w-8 text-white" />
              {pendingJobs.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{pendingJobs.length}</span>
                </div>
              )}
            </div>
            <CardTitle className="text-purple-800">Job Manager</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-purple-700 mb-4">
              {pendingJobs.length > 0 
                ? `${pendingJobs.length} pending jobs to process`
                : 'View and manage all cutting jobs'
              }
            </p>
            <Badge className="bg-purple-200 text-purple-800">
              {pendingJobs.length > 0 ? 'Jobs Waiting' : 'Up to Date'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onViewJobs}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Pending Jobs</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{pendingJobs.length}</div>
            <p className="text-xs text-blue-600 mt-1">
              Jobs waiting to be cut
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onViewJobs}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed Jobs</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{completedJobs.length}</div>
            <p className="text-xs text-green-600 mt-1">
              Jobs finished today
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${reorderAlerts.length > 0 ? 'from-red-50 to-orange-100 border-red-200' : 'from-orange-50 to-yellow-100 border-orange-200'} hover:shadow-lg transition-all duration-300 cursor-pointer`} onClick={onManageInventory}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${reorderAlerts.length > 0 ? 'text-red-700' : 'text-orange-700'}`}>
              Low Stock Items
            </CardTitle>
            <Package className={`h-5 w-5 ${reorderAlerts.length > 0 ? 'text-red-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${reorderAlerts.length > 0 ? 'text-red-800' : 'text-orange-800'}`}>
              {reorderAlerts.length}
            </div>
            <p className={`text-xs mt-1 ${reorderAlerts.length > 0 ? 'text-red-600' : 'text-orange-600'}`}>
              Materials below threshold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-purple-600 mt-1">
              From completed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Quick Actions */}
      {reorderAlerts.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ShoppingCart className="h-5 w-5" />
              Inventory Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-orange-700 font-medium">
                  🚨 {reorderAlerts.length} materials critically low in stock
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Items: {reorderAlerts.map(alert => alert.materialName).join(', ')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onManageInventory}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Supplies
                </Button>
                <Button
                  variant="outline"
                  onClick={onManageInventory}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
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
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Pending Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No pending jobs</p>
                <Button onClick={onNewJob} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.slice(0, 5).map(job => (
                  <div 
                    key={job.id} 
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={onViewJobs}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{job.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {job.material.name} - {job.length}ft × {job.quantity}
                      </p>
                      {job.orderCode && (
                        <p className="text-xs font-mono bg-white px-2 py-1 rounded border">
                          Code: {job.orderCode}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                      ${job.totalCost.toFixed(2)}
                    </Badge>
                  </div>
                ))}
                {pendingJobs.length > 5 && (
                  <Button variant="outline" onClick={onViewJobs} className="w-full mt-4 hover:bg-blue-50">
                    View All {pendingJobs.length} Pending Jobs
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Jobs */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Recently Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {completedJobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No completed jobs yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedJobs.slice(0, 5).map(job => (
                  <div 
                    key={job.id} 
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={onViewJobs}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{job.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {job.material.name} - {job.length}ft × {job.quantity}
                      </p>
                      {job.orderCode && (
                        <p className="text-xs font-mono bg-white px-2 py-1 rounded border">
                          Code: {job.orderCode}
                        </p>
                      )}
                      {job.completedAt && (
                        <p className="text-xs text-green-600">
                          ✅ Completed {job.completedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ${job.totalCost.toFixed(2)}
                    </Badge>
                  </div>
                ))}
                {completedJobs.length > 5 && (
                  <Button variant="outline" onClick={onViewJobs} className="w-full mt-4 hover:bg-green-50">
                    View All {completedJobs.length} Completed Jobs
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