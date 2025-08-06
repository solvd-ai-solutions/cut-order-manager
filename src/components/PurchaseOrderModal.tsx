import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ShoppingCart, Printer, Send, X, Package, DollarSign } from 'lucide-react';
import { Material } from '../types';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  reorderMaterials?: Material[];
}

interface OrderItem {
  material: Material;
  suggestedQuantity: number;
  orderQuantity: number;
  totalCost: number;
}

interface SupplierOrder {
  supplier: string;
  items: OrderItem[];
  totalCost: number;
}

export function PurchaseOrderModal({ isOpen, onClose, materials, reorderMaterials = [] }: PurchaseOrderModalProps) {
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      generateSupplierOrders();
    }
  }, [isOpen, reorderMaterials]);

  const generateSupplierOrders = () => {
    // Group materials by supplier that need reordering
    const materialsBySupplier = new Map<string, OrderItem[]>();
    
    reorderMaterials.forEach(material => {
      // Calculate suggested quantity (2x threshold or current stock deficit)
      const deficit = material.reorderThreshold - material.currentStock;
      const suggestedQuantity = Math.max(material.reorderThreshold * 2, deficit + material.reorderThreshold);
      
      const orderItem: OrderItem = {
        material,
        suggestedQuantity,
        orderQuantity: suggestedQuantity,
        totalCost: suggestedQuantity * material.unitCost,
      };

      if (!materialsBySupplier.has(material.supplier)) {
        materialsBySupplier.set(material.supplier, []);
      }
      materialsBySupplier.get(material.supplier)!.push(orderItem);
    });

    // Convert to supplier orders
    const orders: SupplierOrder[] = Array.from(materialsBySupplier.entries()).map(([supplier, items]) => ({
      supplier,
      items,
      totalCost: items.reduce((sum, item) => sum + item.totalCost, 0),
    }));

    setSupplierOrders(orders);
    if (orders.length > 0) {
      setSelectedSupplier(orders[0].supplier);
    }
  };

  const updateOrderQuantity = (supplierIndex: number, itemIndex: number, quantity: number) => {
    const updatedOrders = [...supplierOrders];
    const item = updatedOrders[supplierIndex].items[itemIndex];
    item.orderQuantity = quantity;
    item.totalCost = quantity * item.material.unitCost;
    
    // Recalculate supplier total
    updatedOrders[supplierIndex].totalCost = updatedOrders[supplierIndex].items.reduce(
      (sum, item) => sum + item.totalCost, 0
    );
    
    setSupplierOrders(updatedOrders);
  };

  const printPurchaseOrder = (supplierOrder: SupplierOrder) => {
    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    const printContent = `
      <html>
        <head>
          <title>Purchase Order - ${orderNumber}</title>
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
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            .urgent {
              color: #d73527;
              font-weight: bold;
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
            <p><strong>Company:</strong> ${supplierOrder.supplier}</p>
            <p><strong>Order Type:</strong> Stock Replenishment</p>
            <p><strong>Priority:</strong> ${supplierOrder.items.some(item => item.material.currentStock <= item.material.reorderThreshold * 0.5) ? '<span class="urgent">URGENT - Critical Stock Levels</span>' : 'Standard'}</p>
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
              ${supplierOrder.items.map(item => `
                <tr>
                  <td><strong>${item.material.name}</strong></td>
                  <td style="text-transform: capitalize;">${item.material.type}</td>
                  <td>${item.material.currentStock} ft</td>
                  <td>${item.orderQuantity} ft</td>
                  <td>$${item.material.unitCost.toFixed(2)}</td>
                  <td>$${item.totalCost.toFixed(2)}</td>
                  <td>${item.material.currentStock <= item.material.reorderThreshold * 0.5 ? '<span class="urgent">CRITICAL</span>' : 'LOW STOCK'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>TOTAL ORDER VALUE</strong></td>
                <td><strong>$${supplierOrder.totalCost.toFixed(2)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div style="margin: 30px 0; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <h3>📋 SPECIAL INSTRUCTIONS</h3>
            <p>• Please confirm availability and delivery timeline</p>
            <p>• Contact us immediately if any items are out of stock</p>
            <p>• Standard delivery address: Hardware Store Loading Dock</p>
            <p>• Preferred delivery time: Monday-Friday, 8AM-4PM</p>
            ${supplierOrder.items.some(item => item.material.currentStock <= item.material.reorderThreshold * 0.5) ? 
              '<p class="urgent">• ⚠️ URGENT: Critical stock items need immediate attention</p>' : ''}
          </div>

          <div class="footer">
            <p><strong>Authorized by:</strong> Cut & Order Manager System</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>This purchase order was automatically generated based on current inventory levels.</p>
            <p>Please contact us at (555) 123-4567 if you have any questions about this order.</p>
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

  const sendPurchaseOrder = (supplierOrder: SupplierOrder) => {
    // In a real application, this would integrate with email service
    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    alert(`Purchase Order ${orderNumber} would be sent to ${supplierOrder.supplier}\n\nTotal: $${supplierOrder.totalCost.toFixed(2)}\nItems: ${supplierOrder.items.length}\n\nIn a real application, this would be sent via email.`);
  };

  const getTotalOrderValue = () => {
    return supplierOrders.reduce((sum, order) => sum + order.totalCost, 0);
  };

  const getUrgentItemsCount = () => {
    return supplierOrders.reduce((count, order) => 
      count + order.items.filter(item => item.material.currentStock <= item.material.reorderThreshold * 0.5).length, 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🛒 Purchase Orders
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Create and manage purchase orders for materials that need reordering. Review quantities and costs before sending orders to suppliers.
          </DialogDescription>
          
          {supplierOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-xl font-bold">{supplierOrders.reduce((sum, order) => sum + order.items.length, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-xl font-bold">${getTotalOrderValue().toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Suppliers</p>
                      <p className="text-xl font-bold">{supplierOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {supplierOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No materials need reordering at this time</p>
            </div>
          ) : (
            <div className="space-y-6">
              {supplierOrders.map((supplierOrder, supplierIndex) => (
                <Card key={supplierOrder.supplier} className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        {supplierOrder.supplier}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">
                          {supplierOrder.items.length} items
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          ${supplierOrder.totalCost.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {supplierOrder.items.map((item, itemIndex) => (
                        <div key={item.material.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h4 className="font-semibold">{item.material.name}</h4>
                              <p className="text-sm text-gray-600 capitalize">{item.material.type}</p>
                              {item.material.currentStock <= item.material.reorderThreshold * 0.5 && (
                                <Badge variant="destructive" className="text-xs animate-pulse">
                                  🚨 Critical
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <Label className="text-xs text-gray-500">Current Stock</Label>
                              <p className="font-medium">{item.material.currentStock} ft</p>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-gray-500">Suggested Qty</Label>
                              <p className="font-medium text-blue-600">{item.suggestedQuantity} ft</p>
                            </div>
                            
                            <div>
                              <Label htmlFor={`qty-${supplierIndex}-${itemIndex}`} className="text-xs text-gray-500">
                                Order Quantity
                              </Label>
                              <Input
                                id={`qty-${supplierIndex}-${itemIndex}`}
                                type="number"
                                min="0"
                                value={item.orderQuantity}
                                onChange={(e) => updateOrderQuantity(supplierIndex, itemIndex, parseInt(e.target.value) || 0)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs text-gray-500">Total Cost</Label>
                              <p className="font-bold text-green-700">${item.totalCost.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">${item.material.unitCost}/ft</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold">Supplier Total: ${supplierOrder.totalCost.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{supplierOrder.items.length} items</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => printPurchaseOrder(supplierOrder)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print PO
                        </Button>
                        
                        <Button
                          onClick={() => sendPurchaseOrder(supplierOrder)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Summary Actions */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">Order Summary</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <p className="text-blue-700">
                          <strong>Total Value:</strong> ${getTotalOrderValue().toFixed(2)}
                        </p>
                        <p className="text-blue-700">
                          <strong>Suppliers:</strong> {supplierOrders.length}
                        </p>
                        <p className="text-blue-700">
                          <strong>Total Items:</strong> {supplierOrders.reduce((sum, order) => sum + order.items.length, 0)}
                        </p>
                        {getUrgentItemsCount() > 0 && (
                          <p className="text-red-700 font-semibold">
                            <strong>🚨 Critical Items:</strong> {getUrgentItemsCount()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => supplierOrders.forEach(printPurchaseOrder)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print All POs
                      </Button>
                      
                      <Button
                        onClick={() => supplierOrders.forEach(sendPurchaseOrder)}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send All Orders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}