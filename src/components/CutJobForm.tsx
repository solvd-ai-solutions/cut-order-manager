import { useState, useEffect } from 'react';
// Icons replaced with emojis for cleaner design
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
  
  // Measurement system state
  const [measurementSystem, setMeasurementSystem] = useState<'imperial' | 'metric'>('imperial');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [meters, setMeters] = useState('');

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
  }, [selectedMaterialId, length, quantity, feet, inches, meters, measurementSystem]);

  // Conversion functions
  const convertToFeet = (): number => {
    if (measurementSystem === 'imperial') {
      const feetNum = parseFloat(feet || '0');
      const inchesNum = parseFloat(inches || '0');
      return feetNum + (inchesNum / 12);
    } else {
      const metersNum = parseFloat(meters || '0');
      return metersNum * 3.28084; // Convert meters to feet
    }
  };

  const updateLengthFromInputs = () => {
    const totalFeet = convertToFeet();
    setLength(totalFeet.toString());
  };

  useEffect(() => {
    updateLengthFromInputs();
  }, [feet, inches, meters, measurementSystem]);

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
    
    if (!customerName.trim() || !selectedMaterialId || parseFloat(length || '0') <= 0 || parseInt(quantity || '0') <= 0) {
      alert('Please fill in all fields with valid values');
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
    <div className="h-screen bg-white flex flex-col">
      {/* Header - Fixed Height */}
      <div className="flex-shrink-0 border-b-2 border-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="btn-base bg-white text-black outline-black hover:outline-mint hover:bg-mint hover:text-white"
            >
              ⬅️ Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-black">CREATE CUT JOB</h1>
              <p className="text-base text-gray-600">Generate a new cutting order</p>
            </div>
          </div>
          <span className="text-2xl">✂️</span>
        </div>
      </div>

      {/* Main Content - Takes Remaining Height */}
      <div className="flex-1 min-h-0 p-4">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form Section */}
          <div className="card-base p-4 hover:outline-mint overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">👤</span>
              <h2 className="text-2xl font-semibold text-black">JOB DETAILS</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-base font-semibold block mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-base"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="text-base font-semibold block mb-2">Material</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="input-base"
                  required
                >
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} - ${material.unitCost}/ft (Stock: {material.currentStock}ft)
                    </option>
                  ))}
                </select>
              </div>

              {/* Measurement System Toggle */}
              <div>
                <label className="text-base font-semibold block mb-2">Measurement System</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMeasurementSystem('imperial')}
                    className={`btn-base ${
                      measurementSystem === 'imperial'
                        ? 'btn-mint'
                        : 'bg-white text-black outline-black hover:outline-mint hover:bg-mint hover:text-white'
                    }`}
                  >
                    Imperial (ft/in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasurementSystem('metric')}
                    className={`btn-base ${
                      measurementSystem === 'metric'
                        ? 'btn-mint'
                        : 'bg-white text-black outline-black hover:outline-mint hover:bg-mint hover:text-white'
                    }`}
                  >
                    Metric (m)
                  </button>
                </div>
              </div>

              {/* Length Inputs */}
              {measurementSystem === 'imperial' ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-semibold block mb-2">Feet</label>
                    <input
                      type="number"
                      min="0"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      className="input-base"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-base font-semibold block mb-2">Inches</label>
                    <input
                      type="number"
                      min="0"
                      max="11.99"
                      step="0.01"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      className="input-base"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-base font-semibold block mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="input-base"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-base font-semibold block mb-2">Length (meters)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={meters}
                      onChange={(e) => setMeters(e.target.value)}
                      className="input-base"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-base font-semibold block mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="input-base"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-base btn-lg btn-coral w-full font-bold"
                disabled={!customerName || !selectedMaterialId || 
                  (measurementSystem === 'imperial' ? (feet === '' && inches === '') : meters === '') || !quantity}
                >
                  Create Job - ${calculatedCost.toFixed(2)}
                </button>
              </form>
            </div>

          {/* Preview Section */}
          <div className="space-y-4 overflow-y-auto">
            {/* Cost Breakdown */}
            <div className="card-base p-4 hover:outline-coral">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg">🧮</span>
                <h3 className="text-xl font-semibold text-black">COST BREAKDOWN</h3>
              </div>
              
              {selectedMaterial && length && quantity ? (
                <div className="space-y-2">
                  <div className="flex justify-between border-b-2 border-black pb-1">
                    <span className="text-sm">Material Cost:</span>
                    <span className="text-sm">${(selectedMaterial.unitCost * parseFloat(length || '0') * parseInt(quantity || '1')).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-black pb-1">
                    <span className="text-sm">Labor ($0.25/cut):</span>
                    <span className="text-sm">${(parseInt(quantity || '1') * 0.25).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-black pb-1">
                    <span className="text-sm">Waste Allowance (15%):</span>
                    <span className="text-sm">${((selectedMaterial.unitCost * parseFloat(length || '0') * parseInt(quantity || '1')) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-black pb-1">
                    <span className="text-sm">Markup (25%):</span>
                    <span className="text-sm">${(calculatedCost * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-black">
                    <span>TOTAL:</span>
                    <span>${calculatedCost.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Fill in the form to see cost breakdown
                </p>
              )}
            </div>

            {/* Job Summary */}
            <div className="card-base p-4 hover:outline-lavender">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg">📄</span>
                <h3 className="text-xl font-semibold text-black">JOB SUMMARY</h3>
              </div>
              
              {customerName && selectedMaterial && length && quantity ? (
                <div className="space-y-2">
                  <p className="solv-body"><strong>Customer:</strong> {customerName}</p>
                  <p className="solv-body"><strong>Material:</strong> {selectedMaterial.name}</p>
                  <p className="solv-body">
                    <strong>Specifications:</strong> {
                      measurementSystem === 'imperial' 
                        ? `${feet || '0'}' ${inches || '0'}" × ${quantity} pieces`
                        : `${meters || '0'}m × ${quantity} pieces`
                    }
                  </p>
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