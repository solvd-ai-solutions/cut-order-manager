import { Material, CutJob, PricingConfig, ReorderAlert } from '../types';

const STORAGE_KEYS = {
  MATERIALS: 'hardware_store_materials',
  JOBS: 'hardware_store_jobs',
  PRICING: 'hardware_store_pricing',
};

// Default pricing configuration
const DEFAULT_PRICING: PricingConfig = {
  laborRatePerCut: 5.00,
  wasteAllowancePercent: 10,
  markupPercent: 25,
};

// Sample materials data
const DEFAULT_MATERIALS: Material[] = [
  {
    id: '1',
    name: '2x4 Pine',
    type: 'wood',
    unitCost: 3.50,
    currentStock: 1200,
    reorderThreshold: 200,
    supplier: 'Lumber Supply Co.',
  },
  {
    id: '2',
    name: '2x6 Pine',
    type: 'wood',
    unitCost: 5.25,
    currentStock: 800,
    reorderThreshold: 150,
    supplier: 'Lumber Supply Co.',
  },
  {
    id: '3',
    name: '1/2" Steel Rod',
    type: 'metal',
    unitCost: 12.00,
    currentStock: 500,
    reorderThreshold: 100,
    supplier: 'Metal Works Inc.',
  },
  {
    id: '4',
    name: '3/4" Steel Rod',
    type: 'metal',
    unitCost: 18.50,
    currentStock: 300,
    reorderThreshold: 75,
    supplier: 'Metal Works Inc.',
  },
];

class DataStore {
  // Generate unique 4-digit alphanumeric code
  generateOrderCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness by checking existing jobs
    const existingJobs = this.getJobs();
    const existingCodes = existingJobs.map(job => job.orderCode).filter(Boolean);
    
    if (existingCodes.includes(result)) {
      return this.generateOrderCode(); // Recursive call for uniqueness
    }
    
    return result;
  }

  // Materials
  getMaterials(): Material[] {
    const stored = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!stored) {
      this.saveMaterials(DEFAULT_MATERIALS);
      return DEFAULT_MATERIALS;
    }
    return JSON.parse(stored);
  }

  saveMaterials(materials: Material[]): void {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }

  updateMaterialStock(materialId: string, newStock: number): void {
    const materials = this.getMaterials();
    const material = materials.find(m => m.id === materialId);
    if (material) {
      material.currentStock = newStock;
      this.saveMaterials(materials);
    }
  }

  // Jobs
  getJobs(): CutJob[] {
    const stored = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (!stored) return [];
    return JSON.parse(stored).map((job: any) => ({
      ...job,
      createdAt: new Date(job.createdAt),
      completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
    }));
  }

  saveJob(job: CutJob): void {
    const jobs = this.getJobs();
    jobs.push(job);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }

  updateJobStatus(jobId: string, status: CutJob['status']): void {
    const jobs = this.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
      if (status === 'completed') {
        job.completedAt = new Date();
        // Reduce stock when job is completed
        this.updateMaterialStock(
          job.material.id,
          job.material.currentStock - (job.length * job.quantity)
        );
      }
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    }
  }

  // Pricing
  getPricingConfig(): PricingConfig {
    const stored = localStorage.getItem(STORAGE_KEYS.PRICING);
    if (!stored) {
      this.savePricingConfig(DEFAULT_PRICING);
      return DEFAULT_PRICING;
    }
    return JSON.parse(stored);
  }

  savePricingConfig(config: PricingConfig): void {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(config));
  }

  // Calculate job cost
  calculateJobCost(material: Material, length: number, quantity: number): {
    materialCost: number;
    laborCost: number;
    wasteCost: number;
    totalCost: number;
  } {
    const pricing = this.getPricingConfig();
    const totalLength = length * quantity;
    
    const materialCost = totalLength * material.unitCost;
    const laborCost = pricing.laborRatePerCut * quantity;
    const wasteCost = materialCost * (pricing.wasteAllowancePercent / 100);
    const subtotal = materialCost + laborCost + wasteCost;
    const totalCost = subtotal * (1 + pricing.markupPercent / 100);

    return {
      materialCost,
      laborCost,
      wasteCost,
      totalCost,
    };
  }

  // Get reorder alerts
  getReorderAlerts(): ReorderAlert[] {
    const materials = this.getMaterials();
    return materials
      .filter(material => material.currentStock <= material.reorderThreshold)
      .map(material => ({
        materialId: material.id,
        materialName: material.name,
        currentStock: material.currentStock,
        reorderThreshold: material.reorderThreshold,
        supplier: material.supplier,
      }));
  }
}

export const dataStore = new DataStore();