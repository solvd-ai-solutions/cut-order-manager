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
        <button onClick={onBack} className="btn-base bg-white text-black outline-black hover:outline-mint hover:bg-mint hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div>
          <h1 className="text-4xl font-bold text-black">
            INVENTORY MANAGER
          </h1>
          <p className="text-lg text-gray-600">Track stock levels and manage materials</p>
        </div>
      </div>

      {/* Critical Reorder Alerts */}
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
                  Critical stock levels detected. Click below to generate purchase orders.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseOrders(true)}
                className="btn-base btn-coral"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                ORDER NOW
              </button>
              <button
                onClick={generateReorderReport}
                className="btn-base btn-sm bg-white text-coral outline-coral hover:outline-black hover:bg-coral hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Selection Controls */}
      <div className="card-base p-6 hover:outline-lavender">
        <div className="flex items-center gap-3 mb-6">
          <CheckSquare className="h-6 w-6 text-lavender" />
          <h3 className="text-2xl font-semibold text-black">BULK MATERIAL SELECTION ({selectedMaterials.size} selected)</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleSelectAll}
              className="btn-base btn-sm bg-white text-lavender outline-lavender hover:outline-black hover:bg-lavender hover:text-white"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Select All ({materials.length})
            </button>
            <button
              onClick={handleSelectLowStock}
              className="btn-base btn-sm bg-white text-coral outline-coral hover:outline-black hover:bg-coral hover:text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Select Low Stock ({reorderAlerts.length})
            </button>
            <button
              onClick={handleSelectNone}
              className="btn-base btn-sm bg-white text-black outline-black hover:outline-black hover:bg-black hover:text-white"
            >
              <Square className="h-4 w-4 mr-2" />
              Clear Selection
            </button>
          </div>
          
          <button
            onClick={handleBulkReorder}
            disabled={selectedMaterials.size === 0}
            className="btn-base btn-mint font-bold"
          >
            <Lock className="h-4 w-4 mr-2" />
            Reorder Selected Inventory ({selectedMaterials.size})
          </button>
        </div>
        
        {selectedMaterials.size > 0 && (
          <div className="mt-6 p-6 bg-white rounded-lg outline-2 outline-black outline-offset-0" style={{outlineStyle: 'solid'}}>
            <h4 className="text-lg font-semibold text-black mb-3">SELECTED FOR REORDER:</h4>
            <div className="flex flex-wrap gap-2">
              {getSelectedMaterials().map(material => (
                <span key={material.id} className="inline-flex items-center px-3 py-1 rounded-sm bg-white text-lavender text-sm font-medium outline-2 outline-lavender outline-offset-0" style={{outlineStyle: 'solid'}}>
                  {material.name} ({material.supplier})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Supplier Ordering Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Order All Card */}
        <div className="card-base p-6 cursor-pointer hover:outline-coral">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-coral rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">QUICK ORDER ALL</h3>
            <p className="text-base text-gray-600 mb-6">Order all low stock items at once</p>
            <button
              onClick={() => setShowPurchaseOrders(true)}
              disabled={reorderAlerts.length === 0}
              className="btn-base btn-coral w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order All ({reorderAlerts.length})
            </button>
          </div>
        </div>

        {/* Generate Report Card */}
        <div className="card-base p-6 cursor-pointer hover:outline-lavender">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-lavender rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">GENERATE REPORT</h3>
            <p className="text-base text-gray-600 mb-6">Create printable reorder report</p>
            <button
              onClick={generateReorderReport}
              disabled={reorderAlerts.length === 0}
              className="btn-base bg-white text-lavender outline-lavender hover:outline-black hover:bg-lavender hover:text-white w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Add Material Card */}
        <div className="card-base p-6 cursor-pointer hover:outline-mint">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-mint rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">ADD MATERIAL</h3>
            <p className="text-base text-gray-600 mb-6">Add new materials to inventory</p>
            <button
              onClick={openAddDialog}
              className="btn-base bg-white text-mint outline-mint hover:outline-black hover:bg-mint hover:text-white w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </button>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <Card className="bg-white border-solv-thick border-black transition-colors duration-200 rounded-lg">
        <CardHeader className="bg-white border-b border-black">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-black uppercase">
              <Warehouse className="h-5 w-5 text-[#A6FFE2]" />
              Materials Inventory
            </CardTitle>
            <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openAddDialog}
                  className="bg-[#A6FFE2] text-black border border-[#A6FFE2] hover:bg-white hover:text-[#A6FFE2]"
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
                <div key={material.id} className="border-solv border-black rounded-lg p-6 bg-white transition-colors duration-200 cursor-pointer">
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
                          className="bg-[#FF8C82] text-white border border-[#FF8C82] hover:bg-white hover:text-[#FF8C82] text-xs"
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
            <DialogTitle className="flex items-center gap-2 text-black uppercase">
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
              <Label htmlFor="password" className="text-black font-semibold uppercase">Manager Password</Label>
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
                className="flex-1 bg-[#FF8C82] text-white border border-[#FF8C82] hover:bg-white hover:text-[#FF8C82]"
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