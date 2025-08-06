import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Package, AlertTriangle, Download, Edit, Plus, Warehouse, TrendingDown, ShoppingCart, Send, Zap, FileText, CheckSquare, Square, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { dataStore } from '../services/dataStore';
import { Material, ReorderAlert } from '../types';
import { PurchaseOrderModal } from './PurchaseOrderModal';

interface InventoryManagerProps {
  onBack: () => void;
}

export function InventoryManager({ onBack }: InventoryManagerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [reorderAlerts, setReorderAlerts] = useState<ReorderAlert[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [showPurchaseOrders, setShowPurchaseOrders] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [showBulkReorderDialog, setShowBulkReorderDialog] = useState(false);
  const [reorderPassword, setReorderPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Form states for adding/editing materials
  const [formData, setFormData] = useState({
    name: '',
    type: 'wood' as 'wood' | 'metal' | 'other',
    unitCost: '',
    currentStock: '',
    reorderThreshold: '',
    supplier: '',
  });

  // Predefined password for reordering (in a real app, this would be encrypted/hashed)
  const REORDER_PASSWORD = 'MANAGER2024';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMaterials = dataStore.getMaterials();
    const alerts = dataStore.getReorderAlerts();
    setMaterials(allMaterials);
    setReorderAlerts(alerts);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'wood',
      unitCost: '',
      currentStock: '',
      reorderThreshold: '',
      supplier: '',
    });
  };

  const handleMaterialSelection = (materialId: string, checked: boolean) => {
    const newSelected = new Set(selectedMaterials);
    if (checked) {
      newSelected.add(materialId);
    } else {
      newSelected.delete(materialId);
    }
    setSelectedMaterials(newSelected);
  };

  const handleSelectAll = () => {
    const allMaterialIds = new Set(materials.map(m => m.id));
    setSelectedMaterials(allMaterialIds);
  };

  const handleSelectNone = () => {
    setSelectedMaterials(new Set());
  };

  const handleSelectLowStock = () => {
    const lowStockIds = new Set(
      materials
        .filter(m => m.currentStock <= m.reorderThreshold)
        .map(m => m.id)
    );
    setSelectedMaterials(lowStockIds);
  };

  const getSelectedMaterials = () => {
    return materials.filter(m => selectedMaterials.has(m.id));
  };

  const handleBulkReorder = () => {
    if (selectedMaterials.size === 0) {
      alert('Please select materials to reorder');
      return;
    }
    setShowBulkReorderDialog(true);
    setReorderPassword('');
    setPasswordError('');
  };

  const confirmBulkReorder = () => {
    if (reorderPassword !== REORDER_PASSWORD) {
      setPasswordError('Incorrect password. Please contact your manager.');
      return;
    }

    setPasswordError('');
    const selectedMaterialsData = getSelectedMaterials();
    
    // Group by supplier and generate orders
    const supplierOrders = new Map<string, Material[]>();
    selectedMaterialsData.forEach(material => {
      if (!supplierOrders.has(material.supplier)) {
        supplierOrders.set(material.supplier, []);
      }
      supplierOrders.get(material.supplier)!.push(material);
    });

    // Generate purchase orders for each supplier
    let totalOrderValue = 0;
    const orderNumbers: string[] = [];

    supplierOrders.forEach((materials, supplier) => {
      const orderNumber = `PO-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      orderNumbers.push(orderNumber);

      let supplierTotal = 0;
      const orderItems = materials.map(material => {
        const suggestedQuantity = Math.max(
          material.reorderThreshold * 2, 
          (material.reorderThreshold - material.currentStock) + material.reorderThreshold
        );
        const itemTotal = suggestedQuantity * material.unitCost;
        supplierTotal += itemTotal;
        return {
          material,
          quantity: suggestedQuantity,
          cost: itemTotal
        };
      });

      totalOrderValue += supplierTotal;

      // Generate and print purchase order
      const printContent = `
        <html>
          <head>
            <title>Bulk Purchase Order - ${orderNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                max-width: 800px; 
                margin: 0 auto;
                background: white;
              }
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                border-bottom: 3px solid #000; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
              }
              .company-info {
                text-align: left;
              }
              .order-info {
                text-align: right;
              }
              .order-number {
                background: #000;
                color: white;
                padding: 10px 20px;
                font-size: 18px;
                font-weight: bold;
                border-radius: 4px;
              }
              .supplier-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left;
              }
              th { 
                background-color: #f8f9fa; 
                font-weight: bold;
              }
              .total-row {
                background-color: #e8f5e8;
                font-weight: bold;
              }
              .urgent {
                color: #d73527;
                font-weight: bold;
              }
              .authorized {
                background: #d4edda;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-info">
                <h1>🛠️ HARDWARE STORE</h1>
                <p>Custom Cut & Order Division</p>
                <p>123 Main Street, Hardware City, HC 12345</p>
                <p>Phone: (555) 123-4567</p>
              </div>
              <div class="order-info">
                <div class="order-number">PO: ${orderNumber}</div>
                <p style="margin-top: 10px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div class="supplier-info">
              <h2>📦 SUPPLIER INFORMATION</h2>
              <p><strong>Company:</strong> ${supplier}</p>
              <p><strong>Order Type:</strong> Bulk Reorder (Manager Authorized)</p>
              <p><strong>Priority:</strong> ${materials.some(m => m.currentStock <= m.reorderThreshold * 0.5) ? '<span class="urgent">URGENT - Critical Stock Levels</span>' : 'Standard'}</p>
            </div>

            <div class="authorized">
              <h3>✅ MANAGER AUTHORIZATION</h3>
              <p><strong>Authorized by:</strong> Store Manager</p>
              <p><strong>Authorization Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Bulk Order:</strong> ${materials.length} materials selected for reorder</p>
            </div>

            <h2>📋 ORDER DETAILS</h2>
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Type</th>
                  <th>Current Stock</th>
                  <th>Order Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map(item => `
                  <tr>
                    <td><strong>${item.material.name}</strong></td>
                    <td style="text-transform: capitalize;">${item.material.type}</td>
                    <td>${item.material.currentStock} ft</td>
                    <td>${item.quantity} ft</td>
                    <td>$${item.material.unitCost.toFixed(2)}</td>
                    <td>$${item.cost.toFixed(2)}</td>
                    <td>${item.material.currentStock <= item.material.reorderThreshold * 0.5 ? '<span class="urgent">CRITICAL</span>' : 'SELECTED'}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="5"><strong>SUPPLIER TOTAL</strong></td>
                  <td><strong>$${supplierTotal.toFixed(2)}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div style="margin: 30px 0; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107;">
              <h3>📋 SPECIAL INSTRUCTIONS</h3>
              <p>• This is a manager-authorized bulk reorder</p>
              <p>• Please confirm availability and delivery timeline</p>
              <p>• Contact us immediately if any items are out of stock</p>
              <p>• Standard delivery address: Hardware Store Loading Dock</p>
              <p>• Preferred delivery time: Monday-Friday, 8AM-4PM</p>
              ${materials.some(m => m.currentStock <= m.reorderThreshold * 0.5) ? 
                '<p class="urgent">• ⚠️ URGENT: Critical stock items included</p>' : ''}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p><strong>Manager Authorization:</strong> Bulk reorder approved via secure system</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>This purchase order was generated through the Cut & Order Manager system with proper authorization.</p>
            </div>
          </body>
        </html>
      `;

      // Print the purchase order
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    });

    // Show success message
    alert(`✅ Bulk Reorder Successful!\n\n` +
          `📋 Orders Generated: ${orderNumbers.length}\n` +
          `📦 Materials Ordered: ${selectedMaterialsData.length}\n` +
          `💰 Total Value: $${totalOrderValue.toFixed(2)}\n\n` +
          `Order Numbers:\n${orderNumbers.join('\n')}\n\n` +
          `Purchase orders have been printed and are ready to send to suppliers.`);

    // Clear selections and close dialog
    setSelectedMaterials(new Set());
    setShowBulkReorderDialog(false);
    setReorderPassword('');
  };

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      type: material.type,
      unitCost: material.unitCost.toString(),
      currentStock: material.currentStock.toString(),
      reorderThreshold: material.reorderThreshold.toString(),
      supplier: material.supplier,
    });
  };

  const openAddDialog = () => {
    setIsAddingMaterial(true);
    resetForm();
  };

  const closeAddDialog = () => {
    setIsAddingMaterial(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setEditingMaterial(null);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.unitCost || !formData.currentStock || !formData.reorderThreshold || !formData.supplier.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const materialData = {
      name: formData.name.trim(),
      type: formData.type,
      unitCost: parseFloat(formData.unitCost),
      currentStock: parseFloat(formData.currentStock),
      reorderThreshold: parseFloat(formData.reorderThreshold),
      supplier: formData.supplier.trim(),
    };

    if (editingMaterial) {
      // Update existing material
      const updatedMaterials = materials.map(m =>
        m.id === editingMaterial.id ? { ...materialData, id: editingMaterial.id } : m
      );
      dataStore.saveMaterials(updatedMaterials);
      closeEditDialog();
    } else {
      // Add new material
      const newMaterial: Material = {
        ...materialData,
        id: Date.now().toString(),
      };
      const updatedMaterials = [...materials, newMaterial];
      dataStore.saveMaterials(updatedMaterials);
      closeAddDialog();
    }

    loadData();
  };

  const updateStock = (materialId: string, newStock: number) => {
    dataStore.updateMaterialStock(materialId, newStock);
    loadData();
  };

  const quickOrderMaterial = (material: Material) => {
    const suggestedQuantity = Math.max(material.reorderThreshold * 2, (material.reorderThreshold - material.currentStock) + material.reorderThreshold);
    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    
    const printContent = `
      <html>
        <head>
          <title>Quick Purchase Order - ${orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 600px; 
              margin: 0 auto;
              background: white;
            }
            .header { 
              text-align: center;
              border-bottom: 3px solid #000; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .order-number {
              background: #000;
              color: white;
              padding: 10px 20px;
              font-size: 18px;
              font-weight: bold;
              border-radius: 4px;
              display: inline-block;
              margin: 10px 0;
            }
            .supplier-info, .order-details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .urgent {
              color: #d73527;
              font-weight: bold;
            }
            .total {
              background: #e8f5e8;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛠️ HARDWARE STORE</h1>
            <div class="order-number">QUICK ORDER: ${orderNumber}</div>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="supplier-info">
            <h2>📦 SUPPLIER</h2>
            <p><strong>Company:</strong> ${material.supplier}</p>
            <p><strong>Order Type:</strong> Quick Restock</p>
            <p><strong>Priority:</strong> ${material.currentStock <= material.reorderThreshold * 0.5 ? '<span class="urgent">URGENT - Critical Stock</span>' : 'Standard'}</p>
          </div>

          <div class="order-details">
            <h2>📋 ORDER DETAILS</h2>
            <p><strong>Material:</strong> ${material.name}</p>
            <p><strong>Type:</strong> ${material.type}</p>
            <p><strong>Current Stock:</strong> ${material.currentStock} ft</p>
            <p><strong>Reorder Threshold:</strong> ${material.reorderThreshold} ft</p>
            <p><strong>Order Quantity:</strong> ${suggestedQuantity} ft</p>
            <p><strong>Unit Cost:</strong> $${material.unitCost.toFixed(2)}/ft</p>
          </div>

          <div class="total">
            TOTAL ORDER VALUE: $${(suggestedQuantity * material.unitCost).toFixed(2)}
          </div>

          <div style="margin: 30px 0; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <h3>📋 INSTRUCTIONS</h3>
            <p>• Please confirm availability and delivery timeline</p>
            <p>• Contact Hardware Store at (555) 123-4567 for any questions</p>
            <p>• Standard delivery address: Hardware Store Loading Dock</p>
            ${material.currentStock <= material.reorderThreshold * 0.5 ? 
              '<p class="urgent">• ⚠️ URGENT: This item is critically low in stock</p>' : ''}
          </div>

          <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
            <p>Generated by Cut & Order Manager System</p>
            <p>${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReorderReport = () => {
    if (reorderAlerts.length === 0) {
      alert('No materials need reordering');
      return;
    }

    const reportContent = `
      <html>
        <head>
          <title>Reorder Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 12px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .urgent { background-color: #ffe6e6; }
            .footer { margin-top: 30px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏪 HARDWARE STORE</h1>
            <h2>REORDER REPORT</h2>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Type</th>
                <th>Current Stock</th>
                <th>Reorder Threshold</th>
                <th>Supplier</th>
                <th>Unit Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reorderAlerts.map(alert => {
                const material = materials.find(m => m.id === alert.materialId);
                const isUrgent = alert.currentStock <= alert.reorderThreshold * 0.5;
                return `
                  <tr ${isUrgent ? 'class="urgent"' : ''}>
                    <td><strong>${alert.materialName}</strong></td>
                    <td>${material?.type || 'N/A'}</td>
                    <td>${alert.currentStock} ft</td>
                    <td>${alert.reorderThreshold} ft</td>
                    <td>${alert.supplier}</td>
                    <td>$${material?.unitCost || 'N/A'}/ft</td>
                    <td>${isUrgent ? '🚨 URGENT' : '⚠️ LOW'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <h3>📋 Action Required:</h3>
            <p>Please contact the suppliers listed above to reorder these materials immediately.</p>
            <p><strong>Urgent items</strong> (highlighted in red) require immediate attention.</p>
            <p>This report was generated automatically by the Cut & Order Manager system.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStockStatus = (material: Material) => {
    if (material.currentStock <= material.reorderThreshold * 0.5) {
      return <Badge variant="destructive" className="animate-pulse">🚨 Critical</Badge>;
    } else if (material.currentStock <= material.reorderThreshold) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (material.currentStock <= material.reorderThreshold * 1.5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Warning</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-300">In Stock</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wood': return '🪵';
      case 'metal': return '🔩';
      default: return '📦';
    }
  };

  const getReorderMaterials = () => {
    return materials.filter(material => material.currentStock <= material.reorderThreshold);
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
            Inventory Manager
          </h1>
          <p className="text-gray-600">Track stock levels and manage materials</p>
        </div>
      </div>

      {/* Critical Reorder Alerts */}
      {reorderAlerts.length > 0 && (
        <Alert className="border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
          <AlertDescription className="text-red-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">
                  🚨 URGENT: {reorderAlerts.length} material(s) need immediate reordering!
                </span>
                <p className="text-sm mt-1">
                  Critical stock levels detected. Click below to generate purchase orders.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPurchaseOrders(true)}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg animate-pulse"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  ORDER NOW
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateReorderReport}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Bulk Selection Controls */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <CheckSquare className="h-6 w-6" />
            Bulk Material Selection ({selectedMaterials.size} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All ({materials.length})
              </Button>
              <Button
                onClick={handleSelectLowStock}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Select Low Stock ({reorderAlerts.length})
              </Button>
              <Button
                onClick={handleSelectNone}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Square className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
            
            <Button
              onClick={handleBulkReorder}
              disabled={selectedMaterials.size === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold"
            >
              <Lock className="h-4 w-4 mr-2" />
              Reorder Selected Inventory ({selectedMaterials.size})
            </Button>
          </div>
          
          {selectedMaterials.size > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Selected for Reorder:</h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedMaterials().map(material => (
                  <Badge key={material.id} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {material.name} ({material.supplier})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Ordering Section */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <ShoppingCart className="h-6 w-6" />
            Supplier Ordering Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-orange-800 mb-2">Quick Order All</h3>
              <p className="text-sm text-orange-700 mb-4">Order all low stock items at once</p>
              <Button
                onClick={() => setShowPurchaseOrders(true)}
                disabled={reorderAlerts.length === 0}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order All ({reorderAlerts.length})
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-blue-800 mb-2">Generate Report</h3>
              <p className="text-sm text-blue-700 mb-4">Create printable reorder report</p>
              <Button
                onClick={generateReorderReport}
                disabled={reorderAlerts.length === 0}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-green-800 mb-2">Add Material</h3>
              <p className="text-sm text-green-700 mb-4">Add new materials to inventory</p>
              <Button
                onClick={openAddDialog}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          </div>

          {reorderAlerts.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-3">📋 Materials Needing Immediate Attention:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {reorderAlerts.map(alert => (
                  <div key={alert.materialId} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-red-800">{alert.materialName}</h5>
                      <Badge variant="destructive" className="text-xs">
                        {alert.currentStock <= alert.reorderThreshold * 0.5 ? '🚨 Critical' : 'Low'}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-1">
                      Stock: {alert.currentStock}ft / Threshold: {alert.reorderThreshold}ft
                    </p>
                    <p className="text-xs text-red-600">Supplier: {alert.supplier}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Warehouse className="h-5 w-5 text-blue-600" />
              Materials Inventory
            </CardTitle>
            <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openAddDialog}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                  <DialogDescription>
                    Add a new material to your inventory system. Fill in all required fields.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Material name"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wood">🪵 Wood</SelectItem>
                        <SelectItem value="metal">🔩 Metal</SelectItem>
                        <SelectItem value="other">📦 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unitCost">Unit Cost ($)</Label>
                      <Input
                        id="unitCost"
                        type="number"
                        step="0.01"
                        value={formData.unitCost}
                        onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                        placeholder="0.00"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentStock">Current Stock (ft)</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                        placeholder="0"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reorderThreshold">Reorder Threshold (ft)</Label>
                    <Input
                      id="reorderThreshold"
                      type="number"
                      value={formData.reorderThreshold}
                      onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                      placeholder="0"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Supplier name"
                      className="border-gray-300"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSubmit} className="flex-1">
                      Add Material
                    </Button>
                    <Button variant="outline" onClick={closeAddDialog}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {materials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No materials in inventory</p>
              </div>
            ) : (
              materials.map(material => (
                <div key={material.id} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedMaterials.has(material.id)}
                        onCheckedChange={(checked) => handleMaterialSelection(material.id, !!checked)}
                        className="w-5 h-5"
                      />
                      <span className="text-2xl">{getTypeIcon(material.type)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {material.type} • ${material.unitCost}/ft • Supplier: {material.supplier}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStockStatus(material)}
                      {material.currentStock <= material.reorderThreshold && (
                        <Button
                          size="sm"
                          onClick={() => quickOrderMaterial(material)}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-xs animate-pulse"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Quick Order
                        </Button>
                      )}
                      <Dialog open={editingMaterial?.id === material.id} onOpenChange={(open) => !open && closeEditDialog()}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(material)} className="hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Material</DialogTitle>
                            <DialogDescription>
                              Update the details for {material.name}. Changes will be saved immediately.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-gray-300"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-type">Type</Label>
                              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="wood">🪵 Wood</SelectItem>
                                  <SelectItem value="metal">🔩 Metal</SelectItem>
                                  <SelectItem value="other">📦 Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-unitCost">Unit Cost ($)</Label>
                                <Input
                                  id="edit-unitCost"
                                  type="number"
                                  step="0.01"
                                  value={formData.unitCost}
                                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                                  className="border-gray-300"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-currentStock">Current Stock (ft)</Label>
                                <Input
                                  id="edit-currentStock"
                                  type="number"
                                  value={formData.currentStock}
                                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                                  className="border-gray-300"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="edit-reorderThreshold">Reorder Threshold (ft)</Label>
                              <Input
                                id="edit-reorderThreshold"
                                type="number"
                                value={formData.reorderThreshold}
                                onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                                className="border-gray-300"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-supplier">Supplier</Label>
                              <Input
                                id="edit-supplier"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                className="border-gray-300"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button onClick={handleSubmit} className="flex-1">
                                Save Changes
                              </Button>
                              <Button variant="outline" onClick={closeEditDialog}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                      <p className="text-lg font-bold text-gray-900">{material.currentStock} ft</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Reorder Threshold</p>
                      <p className="text-lg font-bold text-gray-900">{material.reorderThreshold} ft</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Supplier</p>
                      <p className="text-sm font-semibold text-gray-900">{material.supplier}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Quick Update</p>
                      <Input
                        type="number"
                        placeholder="New stock"
                        className="text-sm h-8 border-gray-300"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseFloat((e.target as HTMLInputElement).value);
                            if (!isNaN(value) && value >= 0) {
                              updateStock(material.id, value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Reorder Confirmation Dialog */}
      <Dialog open={showBulkReorderDialog} onOpenChange={setShowBulkReorderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <Lock className="h-5 w-5" />
              Manager Authorization Required
            </DialogTitle>
            <DialogDescription>
              You are about to reorder {selectedMaterials.size} materials. This action requires manager authorization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Authorization Required</h4>
              <p className="text-sm text-red-700 mb-3">
                This will generate purchase orders for {selectedMaterials.size} selected materials and send them to suppliers.
              </p>
              <div className="text-xs text-red-600">
                Selected materials: {getSelectedMaterials().map(m => m.name).join(', ')}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-red-800 font-semibold">Manager Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter manager password"
                value={reorderPassword}
                onChange={(e) => setReorderPassword(e.target.value)}
                className={`border-red-300 ${passwordError ? 'border-red-500' : ''}`}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
              <p className="text-xs text-gray-600 mt-1">
                Contact your store manager if you don't have the authorization password.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={confirmBulkReorder}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                Authorize & Reorder
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBulkReorderDialog(false);
                  setReorderPassword('');
                  setPasswordError('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Order Modal */}
      <PurchaseOrderModal
        isOpen={showPurchaseOrders}
        onClose={() => setShowPurchaseOrders(false)}
        materials={materials}
        reorderMaterials={getReorderMaterials()}
      />
    </div>
  );
}