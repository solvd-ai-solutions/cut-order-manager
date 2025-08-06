export interface Material {
  id: string;
  name: string;
  type: 'wood' | 'metal' | 'other';
  unitCost: number; // cost per foot
  currentStock: number; // feet available
  reorderThreshold: number; // minimum feet before reorder
  supplier: string;
}

export interface CutJob {
  id: string;
  orderCode?: string; // 4-digit alphanumeric code
  customerName: string;
  material: Material;
  length: number; // feet
  quantity: number;
  totalCost: number;
  laborCost: number;
  wasteCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface PricingConfig {
  laborRatePerCut: number;
  wasteAllowancePercent: number;
  markupPercent: number;
}

export interface ReorderAlert {
  materialId: string;
  materialName: string;
  currentStock: number;
  reorderThreshold: number;
  supplier: string;
}