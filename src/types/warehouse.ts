export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Facility {
  id: string; // e.g. 'F01'
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  address: string;
  manager: string;
  capacityUnits: number;
  temperatureControlled: boolean;
  activeStatus: 'Active' | 'Maintenance' | 'Full';
}

export interface FacilityStock {
  facilityId: string;
  quantity: number;
  locationBin: string; // e.g. 'A1-B04'
}

export interface Product {
  id: string; // e.g. 'P001'
  dbId: number; // 1
  name: string;
  sku: string;
  categoryId: number;
  categoryName: string;
  quantity: number; // Total across facilities (or facility specific when filtered)
  facilityDistribution: Record<string, number>; // facilityId -> quantity
  facilityLocations: Record<string, string>; // facilityId -> bin/shelf
  minStockThreshold: number;
  reorderQuantity: number;
  unitPrice: number; // in USD
  location: string; // Primary shelf/bay e.g. 'A1'
  status: ProductStatus;
  supplier: string;
  leadTimeDays: number;
}

export interface Transaction {
  id: string; // 'T001'
  dbId: number;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  quantity: number;
  date: string;
  facilityId: string;
  facilityName: string;
  targetFacilityId?: string; // For transfers
  targetFacilityName?: string;
  handledBy: string;
  notes: string;
  referenceNo?: string;
}

export interface ReorderRule {
  id: string;
  productId: string;
  productName: string;
  facilityId: string;
  facilityName: string;
  minThreshold: number;
  reorderBatchSize: number;
  supplier: string;
  leadTimeDays: number;
  autoApprove: boolean;
  isActive: boolean;
  lastTriggered?: string;
}

export interface PurchaseOrder {
  id: string; // 'PO-9021'
  productId: string;
  productName: string;
  facilityId: string;
  facilityName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  createdAt: string;
  expectedDate: string;
  status: 'Draft' | 'Pending Approval' | 'In Transit' | 'Received' | 'Cancelled';
  generatedBy: 'Automated System' | 'Manual' | 'Staff';
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'manager';
  fullName: string;
  email: string;
  assignedFacility?: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}
