import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Printer, X } from 'lucide-react';

interface TicketPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    orderCode: string;
    customerName: string;
    materialName: string;
    length: number;
    quantity: number;
    totalCost: number;
    notes?: string;
    createdAt: Date;
    jobId?: string;
    status?: string;
    completedAt?: Date;
  };
}

export function TicketPreviewModal({ isOpen, onClose, ticket }: TicketPreviewModalProps) {
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Cut Job Ticket - ${ticket.orderCode}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              max-width: 400px; 
              margin: 0 auto;
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #000; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
              font-size: 18px;
              font-weight: bold;
            }
            .order-code {
              background: #000;
              color: white;
              padding: 15px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 4px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .details { 
              margin: 20px 0; 
              line-height: 1.8;
              font-size: 14px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px dotted #ccc;
            }
            .total {
              background: #f0f0f0;
              padding: 10px;
              margin: 15px 0;
              font-weight: bold;
              font-size: 16px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              text-align: center;
              color: #666;
            }
            .instructions {
              background: #fffacd;
              padding: 15px;
              margin: 20px 0;
              border-left: 4px solid #ffa500;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="header">🛠️ HARDWARE STORE<br/>CUT JOB TICKET</div>
          
          <div class="order-code">${ticket.orderCode}</div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Customer:</strong></span>
              <span>${ticket.customerName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Material:</strong></span>
              <span>${ticket.materialName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Length:</strong></span>
              <span>${ticket.length} ft</span>
            </div>
            <div class="detail-row">
              <span><strong>Quantity:</strong></span>
              <span>${ticket.quantity} pieces</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Length:</strong></span>
              <span>${(ticket.length * ticket.quantity).toFixed(2)} ft</span>
            </div>
            ${ticket.jobId ? `
            <div class="detail-row">
              <span><strong>Job ID:</strong></span>
              <span>#${ticket.jobId}</span>
            </div>
            ` : ''}
            ${ticket.status ? `
            <div class="detail-row">
              <span><strong>Status:</strong></span>
              <span>${ticket.status.toUpperCase()}</span>
            </div>
            ` : ''}
          </div>

          <div class="total">
            TOTAL: $${ticket.totalCost.toFixed(2)}
          </div>

          ${ticket.notes ? `
          <div class="instructions">
            <strong>Special Instructions:</strong><br/>
            ${ticket.notes}
          </div>
          ` : ''}

          <div class="instructions">
            <strong>🎯 FRONT REGISTER INSTRUCTIONS:</strong><br/>
            Present this ticket and order code <strong>${ticket.orderCode}</strong> to complete purchase. 
            Customer has been quoted $${ticket.totalCost.toFixed(2)} for this cut job.
          </div>

          <div class="footer">
            <strong>Created:</strong> ${ticket.createdAt.toLocaleDateString()} at ${ticket.createdAt.toLocaleTimeString()}<br/>
            ${ticket.completedAt ? `<strong>Completed:</strong> ${ticket.completedAt.toLocaleDateString()} at ${ticket.completedAt.toLocaleTimeString()}<br/>` : ''}
            Thank you for choosing our hardware store!
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🛠️ Cut Job Ticket
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Preview and print the cut job ticket for {ticket.customerName}. This ticket includes the order code and all job details for front register processing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Code Display */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 rounded-xl text-center shadow-lg">
            <p className="text-sm text-slate-300 mb-2">Order Code</p>
            <p className="text-3xl font-bold tracking-[0.3em] font-mono">
              {ticket.orderCode}
            </p>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Customer:</span>
                <p className="font-medium text-gray-900">{ticket.customerName}</p>
              </div>
              <div>
                <span className="text-gray-500">Material:</span>
                <p className="font-medium text-gray-900">{ticket.materialName}</p>
              </div>
              <div>
                <span className="text-gray-500">Length:</span>
                <p className="font-medium text-gray-900">{ticket.length} ft</p>
              </div>
              <div>
                <span className="text-gray-500">Quantity:</span>
                <p className="font-medium text-gray-900">{ticket.quantity} pieces</p>
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-green-700 font-medium text-sm">Total Cost</p>
              <p className="text-2xl font-bold text-green-800">${ticket.totalCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Notes */}
          {ticket.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Special Instructions</h4>
              <p className="text-yellow-700 text-sm">{ticket.notes}</p>
            </div>
          )}

          {/* Front Register Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🎯 Front Register Instructions</h4>
            <p className="text-blue-700 text-sm">
              Present this ticket and order code <strong>{ticket.orderCode}</strong> to complete purchase. 
              Customer has been quoted <strong>${ticket.totalCost.toFixed(2)}</strong> for this cut job.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handlePrint} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Printer className="h-4 w-4 mr-2" />
              Print Ticket
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close Preview
            </Button>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Created: {ticket.createdAt.toLocaleDateString()} at {ticket.createdAt.toLocaleTimeString()}
            {ticket.completedAt && (
              <>
                <br />
                Completed: {ticket.completedAt.toLocaleDateString()} at {ticket.completedAt.toLocaleTimeString()}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}