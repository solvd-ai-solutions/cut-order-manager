import { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, User, Scissors, FileText } from 'lucide-react';
import { dataStore } from '../services/dataStore';
import { Material, CutJob } from '../types';

interface CutJobFormProps {
  onBack: () => void;
  onJobCreated: (job: CutJob) => void;
}

export function CutJobForm({ onBack, onJobCreated }: CutJobFormProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState('1');

  const [calculatedCost, setCalculatedCost] = useState(0);

  useEffect(() => {
    const allMaterials = dataStore.getMaterials();
    setMaterials(allMaterials);
    if (allMaterials.length > 0) {
      setSelectedMaterialId(allMaterials[0].id);
    }
  }, []);

  useEffect(() => {
    calculateCost();
  }, [selectedMaterialId, length, quantity]);

  const calculateCost = () => {
    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material || !length || !quantity) {
      setCalculatedCost(0);
      return;
    }

    const lengthNum = parseFloat(length);
    const quantityNum = parseInt(quantity);
    
    if (isNaN(lengthNum) || isNaN(quantityNum)) {
      setCalculatedCost(0);
      return;
    }

    // Pricing formula: (material cost + labor + waste allowance) * markup
    const materialCost = material.unitCost * lengthNum * quantityNum;
    const laborCost = quantityNum * 0.25; // $0.25 per cut
    const wasteAllowance = materialCost * 0.15; // 15% waste
    const subtotal = materialCost + laborCost + wasteAllowance;
    const markup = subtotal * 0.25; // 25% markup
    const total = subtotal + markup;

    setCalculatedCost(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !selectedMaterialId || !length || !quantity) {
      alert('Please fill in all fields');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;

    const lengthNum = parseFloat(length);
    const quantityNum = parseInt(quantity);

    // Check stock availability
    const totalNeeded = lengthNum * quantityNum;
    if (totalNeeded > material.currentStock) {
      alert(`Insufficient stock. Available: ${material.currentStock}ft, Needed: ${totalNeeded}ft`);
      return;
    }

    // Create job
    const orderCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    const newJob: CutJob = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      material,
      length: lengthNum,
      quantity: quantityNum,
      totalCost: calculatedCost,
      laborCost: quantityNum * 0.25,
      wasteCost: material.unitCost * lengthNum * quantityNum * 0.15,
      status: 'pending',
      createdAt: new Date(),
      orderCode,
    };

    // Update inventory
    dataStore.updateMaterialStock(selectedMaterialId, material.currentStock - totalNeeded);
    
    // Save job
    dataStore.saveJob(newJob);

    // Generate and print ticket
    generateTicket(newJob);
    
    onJobCreated(newJob);
  };

  const generateTicket = (job: CutJob) => {
    const ticketContent = `
      <html>
        <head>
          <title>Cut Job Ticket - ${job.orderCode}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              max-width: 400px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
              color: black;
            }
            .header { 
              text-align: center; 
              border: 2px solid black; 
              padding: 10px; 
              margin-bottom: 20px;
            }
            .order-code {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .section {
              border: 2px solid black;
              padding: 15px;
              margin: 10px 0;
            }
            .label { font-weight: bold; }
            .total {
              background: #f0f0f0;
              border: 2px solid black;
              padding: 15px;
              text-align: center;
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛠️ HARDWARE STORE</h1>
            <div class="order-code">${job.orderCode}</div>
            <p>${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
          </div>

          <div class="section">
            <p><span class="label">Customer:</span> ${job.customerName}</p>
            <p><span class="label">Material:</span> ${job.material.name}</p>
            <p><span class="label">Type:</span> ${job.material.type}</p>
            <p><span class="label">Length:</span> ${job.length} ft</p>
            <p><span class="label">Quantity:</span> ${job.quantity} pieces</p>
          </div>

          <div class="total">
            TOTAL: $${job.totalCost.toFixed(2)}
          </div>

          <div class="section">
            <h3>📋 CUTTING INSTRUCTIONS</h3>
            <p>• Cut ${job.quantity} pieces of ${job.material.name}</p>
            <p>• Each piece: ${job.length} feet long</p>
            <p>• Material type: ${job.material.type}</p>
            <p>• Handle with care</p>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 12px;">
            <p>Thank you for your business!</p>
            <p>Generated by Cut & Order Manager</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(ticketContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  return (
    <div className="h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-black p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="solv-button-secondary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 stroke-2" />
              Back
            </button>
            <div>
              <h1 className="solv-h1">Create Cut Job</h1>
              <p className="solv-body text-gray-600">Generate a new cutting order</p>
            </div>
          </div>
          <Scissors className="h-8 w-8 text-solv-teal stroke-2" />
        </div>
      </div>

      {/* Main Content - Single Viewport Grid */}
      <div className="h-[calc(100%-120px)] p-6 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="solv-card h-full overflow-auto">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-solv-teal stroke-2" />
              <h2 className="solv-h2">Job Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="solv-body font-semibold block mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="solv-input"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="solv-body font-semibold block mb-2">Material</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="solv-input"
                  required
                >
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} - ${material.unitCost}/ft (Stock: {material.currentStock}ft)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="solv-body font-semibold block mb-2">Length (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="solv-input"
                    placeholder="0.0"
                    required
                  />
                </div>
                <div>
                  <label className="solv-body font-semibold block mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="solv-input"
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="solv-button-primary w-full text-lg py-3"
                disabled={!customerName || !selectedMaterialId || !length || !quantity}
              >
                Create Job - ${calculatedCost.toFixed(2)}
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div className="space-y-6 h-full overflow-auto">
            {/* Cost Breakdown */}
            <div className="solv-card">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-solv-coral stroke-2" />
                <h2 className="solv-h2">Cost Breakdown</h2>
              </div>
              
              {selectedMaterial && length && quantity ? (
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="solv-body">Material Cost:</span>
                    <span className="solv-body">${(selectedMaterial.unitCost * parseFloat(length || '0') * parseInt(quantity || '1')).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="solv-body">Labor ($0.25/cut):</span>
                    <span className="solv-body">${(parseInt(quantity || '1') * 0.25).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="solv-body">Waste Allowance (15%):</span>
                    <span className="solv-body">${((selectedMaterial.unitCost * parseFloat(length || '0') * parseInt(quantity || '1')) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="solv-body">Markup (25%):</span>
                    <span className="solv-body">${(calculatedCost * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-black">
                    <span>TOTAL:</span>
                    <span>${calculatedCost.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="solv-body text-gray-500 text-center py-8">
                  Fill in the form to see cost breakdown
                </p>
              )}
            </div>

            {/* Job Summary */}
            <div className="solv-card">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-solv-lavender stroke-2" />
                <h2 className="solv-h2">Job Summary</h2>
              </div>
              
              {customerName && selectedMaterial && length && quantity ? (
                <div className="space-y-2">
                  <p className="solv-body"><strong>Customer:</strong> {customerName}</p>
                  <p className="solv-body"><strong>Material:</strong> {selectedMaterial.name}</p>
                  <p className="solv-body"><strong>Specifications:</strong> {length}ft × {quantity} pieces</p>
                  <p className="solv-body"><strong>Total Length:</strong> {(parseFloat(length) * parseInt(quantity)).toFixed(1)}ft</p>
                  <p className="solv-body"><strong>Stock After Cut:</strong> {(selectedMaterial.currentStock - (parseFloat(length || '0') * parseInt(quantity || '1'))).toFixed(1)}ft</p>
                </div>
              ) : (
                <p className="solv-body text-gray-500 text-center py-8">
                  Job details will appear here
                </p>
              )}
            </div>

            {/* Stock Warning */}
            {selectedMaterial && length && quantity && (
              <div className={`border-2 border-black rounded-lg p-4 ${
                (parseFloat(length) * parseInt(quantity)) > selectedMaterial.currentStock 
                ? 'bg-red-50' 
                : selectedMaterial.currentStock - (parseFloat(length) * parseInt(quantity)) < selectedMaterial.reorderThreshold
                ? 'bg-yellow-50'
                : 'bg-green-50'
              }`}>
                <p className="solv-body font-semibold mb-1">
                  {(parseFloat(length) * parseInt(quantity)) > selectedMaterial.currentStock 
                    ? '⚠️ Insufficient Stock' 
                    : selectedMaterial.currentStock - (parseFloat(length) * parseInt(quantity)) < selectedMaterial.reorderThreshold
                    ? '⚠️ Low Stock Warning'
                    : '✅ Stock Available'
                  }
                </p>
                <p className="solv-small">
                  Current stock: {selectedMaterial.currentStock}ft | 
                  Needed: {(parseFloat(length || '0') * parseInt(quantity || '1')).toFixed(1)}ft
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}