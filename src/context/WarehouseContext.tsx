import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  Facility,
  Product,
  ProductStatus,
  PurchaseOrder,
  ReorderRule,
  Transaction,
  User,
} from '../types/warehouse';
import {
  INITIAL_CATEGORIES,
  INITIAL_FACILITIES,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_REORDER_RULES,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

interface WarehouseContextType {
  // Facility selection
  selectedFacilityId: string; // 'all' or facility id like 'F01'
  setSelectedFacilityId: (id: string) => void;
  facilities: Facility[];
  selectedFacility: Facility | null;

  // Data
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  reorderRules: ReorderRule[];
  purchaseOrders: PurchaseOrder[];
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Filtered/Computed for current view
  viewProducts: Product[];
  totalStockCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  totalOrdersCount: number;

  // Real-time Simulation
  isLiveSimulationActive: boolean;
  toggleLiveSimulation: () => void;
  simulationSpeedSec: number;
  setSimulationSpeedSec: (sec: number) => void;
  lastLiveEvent: string | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Automated Reordering Settings
  autoReorderingEnabled: boolean;
  setAutoReorderingEnabled: (enabled: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;

  // Actions
  addProduct: (productData: Omit<Product, 'id' | 'dbId' | 'status'>) => void;
  editProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  stockIn: (productId: string, quantity: number, facilityId: string, notes?: string, refNo?: string) => void;
  stockOut: (productId: string, quantity: number, facilityId: string, notes?: string, refNo?: string) => void;
  transferStock: (productId: string, quantity: number, fromFacilityId: string, toFacilityId: string, notes?: string) => void;
  
  // Reorder Actions
  createPurchaseOrder: (productId: string, facilityId: string, quantity: number, notes?: string) => void;
  approvePurchaseOrder: (poId: string) => void;
  receivePurchaseOrder: (poId: string) => void;
  cancelPurchaseOrder: (poId: string) => void;
  updateReorderRule: (ruleId: string, updates: Partial<ReorderRule>) => void;
  triggerAutoReorderCheck: () => void;

  // Database / System
  resetAllData: () => void;
  manualSimulatePulse: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'wms_enterprise_v1_';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state or fall back to initial dataset
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}facilities`);
    return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [reorderRules, setReorderRules] = useState<ReorderRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reorder_rules`);
    return saved ? JSON.parse(saved) : INITIAL_REORDER_RULES;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}purchase_orders`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');

  // Real-time simulation state (disabled by user request)
  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(false);
  const [simulationSpeedSec, setSimulationSpeedSec] = useState<number>(6);
  const [lastLiveEvent, setLastLiveEvent] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [autoReorderingEnabled, setAutoReorderingEnabled] = useState<boolean>(true);

  // Toasts disabled per user request
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}facilities`, JSON.stringify(facilities));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}categories`, JSON.stringify(categories));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reorder_rules`, JSON.stringify(reorderRules));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}purchase_orders`, JSON.stringify(purchaseOrders));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [facilities, categories, products, transactions, reorderRules, purchaseOrders, users]);

  // Audio helper using Web Audio API synthesizer
  const playSound = useCallback((frequency = 600, duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy handled silently
    }
  }, [soundEnabled]);

  const showToast = useCallback((_toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    // Disabled auto notification popup per user request
  }, []);

  const dismissToast = useCallback((_id: string) => {
    setToasts([]);
  }, []);

  // Compute product status helper
  const calculateStatus = (qty: number, threshold: number): ProductStatus => {
    if (qty <= 0) return 'Out of Stock';
    if (qty <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  // Selected Facility object
  const selectedFacility = useMemo(() => {
    return facilities.find((f) => f.id === selectedFacilityId) || null;
  }, [facilities, selectedFacilityId]);

  // Products adapted to the selected facility
  const viewProducts = useMemo(() => {
    return products.map((prod) => {
      if (selectedFacilityId === 'all') {
        return prod;
      }
      const facilityQty = prod.facilityDistribution[selectedFacilityId] || 0;
      const facilityLoc = prod.facilityLocations[selectedFacilityId] || prod.location;
      const status = calculateStatus(facilityQty, Math.max(2, Math.floor(prod.minStockThreshold / 2)));
      return {
        ...prod,
        quantity: facilityQty,
        location: facilityLoc,
        status,
      };
    });
  }, [products, selectedFacilityId]);

  // Metrics for overview cards
  const totalStockCount = useMemo(() => {
    return viewProducts.reduce((sum, p) => sum + p.quantity, 0);
  }, [viewProducts]);

  const totalProductsCount = useMemo(() => {
    return viewProducts.length;
  }, [viewProducts]);

  const lowStockCount = useMemo(() => {
    return viewProducts.filter((p) => p.status === 'Low Stock').length;
  }, [viewProducts]);

  const outOfStockCount = useMemo(() => {
    return viewProducts.filter((p) => p.status === 'Out of Stock').length;
  }, [viewProducts]);

  const inStockCount = useMemo(() => {
    return viewProducts.filter((p) => p.status === 'In Stock').length;
  }, [viewProducts]);

  const totalOrdersCount = useMemo(() => {
    return purchaseOrders.length;
  }, [purchaseOrders]);

  // Automated Reordering trigger check
  const triggerAutoReorderCheck = useCallback(() => {
    if (!autoReorderingEnabled) return;

    let ordersCreatedCount = 0;

    setProducts((currentProducts) => {
      currentProducts.forEach((p) => {
        // Check if total or facility stock is below threshold
        const isBelow = p.quantity <= p.minStockThreshold;
        if (isBelow) {
          // Check if there is already an active pending purchase order
          setPurchaseOrders((prevPOs) => {
            const hasPending = prevPOs.some(
              (po) => po.productId === p.id && (po.status === 'Pending Approval' || po.status === 'Draft' || po.status === 'In Transit')
            );
            if (!hasPending) {
              const rule = reorderRules.find((r) => r.productId === p.id);
              const orderQty = rule ? rule.reorderBatchSize : p.reorderQuantity;
              const autoApprove = rule ? rule.autoApprove : false;
              const facilityId = rule ? rule.facilityId : 'F01';
              const facilityName = facilities.find((f) => f.id === facilityId)?.name || 'Central Hub - Chicago';
              const unitCost = Math.round(p.unitPrice * 0.7);

              const newPO: PurchaseOrder = {
                id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
                productId: p.id,
                productName: p.name,
                facilityId,
                facilityName,
                quantity: orderQty,
                unitCost,
                totalCost: orderQty * unitCost,
                supplier: p.supplier,
                createdAt: new Date().toISOString().split('T')[0],
                expectedDate: new Date(Date.now() + (p.leadTimeDays || 3) * 86400000).toISOString().split('T')[0],
                status: autoApprove ? 'In Transit' : 'Pending Approval',
                generatedBy: 'Automated System',
              };

              ordersCreatedCount++;
              showToast({
                type: 'warning',
                title: '⚡ Auto-Reorder Triggered',
                message: `Automated Purchase Order ${newPO.id} generated for ${p.name} (${orderQty} units).`,
              });

              return [newPO, ...prevPOs];
            }
            return prevPOs;
          });
        }
      });
      return currentProducts;
    });
  }, [autoReorderingEnabled, reorderRules, facilities, showToast]);

  // Add Product
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'dbId' | 'status'>) => {
      const nextDbId = products.length > 0 ? Math.max(...products.map((p) => p.dbId)) + 1 : 1;
      const nextId = `P${String(nextDbId).padStart(3, '0')}`;
      const status = calculateStatus(productData.quantity, productData.minStockThreshold);

      const defaultDist: Record<string, number> = productData.facilityDistribution || {
        F01: productData.quantity,
        F02: 0,
        F03: 0,
        F04: 0,
      };

      const defaultLocs: Record<string, string> = productData.facilityLocations || {
        F01: productData.location || 'A1',
        F02: 'B1',
        F03: 'C1',
        F04: 'D1',
      };

      const newProd: Product = {
        ...productData,
        id: nextId,
        dbId: nextDbId,
        status,
        facilityDistribution: defaultDist,
        facilityLocations: defaultLocs,
      };

      setProducts((prev) => [...prev, newProd]);

      // Add a Reorder Rule for it automatically
      const newRule: ReorderRule = {
        id: `RULE-${String(reorderRules.length + 1).padStart(2, '0')}`,
        productId: newProd.id,
        productName: newProd.name,
        facilityId: 'F01',
        facilityName: 'Central Hub - Chicago',
        minThreshold: newProd.minStockThreshold,
        reorderBatchSize: newProd.reorderQuantity,
        supplier: newProd.supplier,
        leadTimeDays: newProd.leadTimeDays,
        autoApprove: false,
        isActive: true,
      };
      setReorderRules((prev) => [...prev, newRule]);

      // Record transaction
      const transId = `T${String(transactions.length + 1).padStart(3, '0')}`;
      const newTrans: Transaction = {
        id: transId,
        dbId: transactions.length + 1,
        productId: newProd.id,
        productName: newProd.name,
        type: 'IN',
        quantity: newProd.quantity,
        date: new Date().toISOString().split('T')[0],
        facilityId: 'F01',
        facilityName: 'Central Hub - Chicago',
        handledBy: currentUser.username,
        notes: 'Initial inventory registration',
        referenceNo: `INIT-${nextDbId}`,
      };
      setTransactions((prev) => [newTrans, ...prev]);

      showToast({
        type: 'success',
        title: 'Product Added',
        message: `${newProd.name} (${newProd.id}) registered successfully.`,
      });
      playSound(780, 0.15);
    },
    [products, transactions, reorderRules, currentUser, showToast, playSound]
  );

  // Edit Product
  const editProduct = useCallback(
    (productId: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const updated = { ...p, ...updates };
            updated.status = calculateStatus(updated.quantity, updated.minStockThreshold);
            return updated;
          }
          return p;
        })
      );
      showToast({
        type: 'info',
        title: 'Product Updated',
        message: `Product ${productId} details updated.`,
      });
    },
    [showToast]
  );

  // Delete Product
  const deleteProduct = useCallback(
    (productId: string) => {
      const prod = products.find((p) => p.id === productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setReorderRules((prev) => prev.filter((r) => r.productId !== productId));
      showToast({
        type: 'info',
        title: 'Product Removed',
        message: `${prod?.name || productId} removed from active database.`,
      });
    },
    [products, showToast]
  );

  // Stock In
  const stockIn = useCallback(
    (productId: string, quantity: number, facilityId: string, notes = 'Inbound Restock', refNo?: string) => {
      if (quantity <= 0) return;
      const targetFacility = facilities.find((f) => f.id === facilityId) || facilities[0];

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const curFacQty = p.facilityDistribution[facilityId] || 0;
            const newFacDist = {
              ...p.facilityDistribution,
              [facilityId]: curFacQty + quantity,
            };
            const newTotal = Object.values(newFacDist).reduce((a, b) => a + b, 0);
            return {
              ...p,
              quantity: newTotal,
              facilityDistribution: newFacDist,
              status: calculateStatus(newTotal, p.minStockThreshold),
            };
          }
          return p;
        })
      );

      const targetProd = products.find((p) => p.id === productId);
      const transId = `T${String(transactions.length + 1).padStart(3, '0')}`;
      const newTrans: Transaction = {
        id: transId,
        dbId: transactions.length + 1,
        productId,
        productName: targetProd?.name || 'Product',
        type: 'IN',
        quantity,
        date: new Date().toISOString().split('T')[0],
        facilityId: targetFacility.id,
        facilityName: targetFacility.name,
        handledBy: currentUser.username,
        notes,
        referenceNo: refNo || `IN-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setTransactions((prev) => [newTrans, ...prev]);

      showToast({
        type: 'success',
        title: 'Stock Received (IN)',
        message: `+${quantity} units of ${targetProd?.name} at ${targetFacility.name}`,
      });
      playSound(880, 0.12);
    },
    [facilities, products, transactions, currentUser, showToast, playSound]
  );

  // Stock Out
  const stockOut = useCallback(
    (productId: string, quantity: number, facilityId: string, notes = 'Outbound Dispatch', refNo?: string) => {
      if (quantity <= 0) return;
      const targetFacility = facilities.find((f) => f.id === facilityId) || facilities[0];
      const targetProd = products.find((p) => p.id === productId);

      if (!targetProd) return;

      const curFacQty = targetProd.facilityDistribution[facilityId] || 0;
      if (curFacQty < quantity && targetProd.quantity < quantity) {
        showToast({
          type: 'error',
          title: 'Insufficient Inventory',
          message: `Cannot dispatch ${quantity} units. Only ${curFacQty} available at ${targetFacility.name}.`,
        });
        playSound(220, 0.2);
        return;
      }

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const currentFac = p.facilityDistribution[facilityId] || 0;
            const newFacQty = Math.max(0, currentFac - quantity);
            const newFacDist = {
              ...p.facilityDistribution,
              [facilityId]: newFacQty,
            };
            const newTotal = Object.values(newFacDist).reduce((a, b) => a + b, 0);
            return {
              ...p,
              quantity: newTotal,
              facilityDistribution: newFacDist,
              status: calculateStatus(newTotal, p.minStockThreshold),
            };
          }
          return p;
        })
      );

      const transId = `T${String(transactions.length + 1).padStart(3, '0')}`;
      const newTrans: Transaction = {
        id: transId,
        dbId: transactions.length + 1,
        productId,
        productName: targetProd.name,
        type: 'OUT',
        quantity,
        date: new Date().toISOString().split('T')[0],
        facilityId: targetFacility.id,
        facilityName: targetFacility.name,
        handledBy: currentUser.username,
        notes,
        referenceNo: refNo || `OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setTransactions((prev) => [newTrans, ...prev]);

      showToast({
        type: 'info',
        title: 'Stock Dispatched (OUT)',
        message: `-${quantity} units of ${targetProd.name} from ${targetFacility.name}`,
      });
      playSound(520, 0.1);

      // Trigger auto-reorder check after stock out
      setTimeout(() => {
        triggerAutoReorderCheck();
      }, 300);
    },
    [facilities, products, transactions, currentUser, showToast, playSound, triggerAutoReorderCheck]
  );

  // Inter-facility Transfer
  const transferStock = useCallback(
    (productId: string, quantity: number, fromFacilityId: string, toFacilityId: string, notes = 'Facility Rebalancing') => {
      if (quantity <= 0 || fromFacilityId === toFacilityId) return;
      const fromFac = facilities.find((f) => f.id === fromFacilityId);
      const toFac = facilities.find((f) => f.id === toFacilityId);
      const targetProd = products.find((p) => p.id === productId);

      if (!targetProd || !fromFac || !toFac) return;

      const availableAtOrigin = targetProd.facilityDistribution[fromFacilityId] || 0;
      if (availableAtOrigin < quantity) {
        showToast({
          type: 'error',
          title: 'Transfer Failed',
          message: `Only ${availableAtOrigin} units available at ${fromFac.name}.`,
        });
        return;
      }

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const originQty = Math.max(0, (p.facilityDistribution[fromFacilityId] || 0) - quantity);
            const destQty = (p.facilityDistribution[toFacilityId] || 0) + quantity;
            const newDist = {
              ...p.facilityDistribution,
              [fromFacilityId]: originQty,
              [toFacilityId]: destQty,
            };
            return {
              ...p,
              facilityDistribution: newDist,
            };
          }
          return p;
        })
      );

      const transId = `T${String(transactions.length + 1).padStart(3, '0')}`;
      const newTrans: Transaction = {
        id: transId,
        dbId: transactions.length + 1,
        productId,
        productName: targetProd.name,
        type: 'TRANSFER',
        quantity,
        date: new Date().toISOString().split('T')[0],
        facilityId: fromFac.id,
        facilityName: fromFac.name,
        targetFacilityId: toFac.id,
        targetFacilityName: toFac.name,
        handledBy: currentUser.username,
        notes: `Transfer: ${fromFac.code} -> ${toFac.code}. ${notes}`,
        referenceNo: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setTransactions((prev) => [newTrans, ...prev]);

      showToast({
        type: 'success',
        title: 'Inter-Facility Transfer',
        message: `Transferred ${quantity} units of ${targetProd.name} from ${fromFac.code} to ${toFac.code}`,
      });
      playSound(700, 0.15);
    },
    [facilities, products, transactions, currentUser, showToast, playSound]
  );

  // Create Manual Purchase Order
  const createPurchaseOrder = useCallback(
    (productId: string, facilityId: string, quantity: number, notes?: string) => {
      const prod = products.find((p) => p.id === productId);
      const fac = facilities.find((f) => f.id === facilityId) || facilities[0];
      if (!prod) return;

      const unitCost = Math.round(prod.unitPrice * 0.7);
      const newPO: PurchaseOrder = {
        id: `PO-${Math.floor(8000 + Math.random() * 1999)}`,
        productId,
        productName: prod.name,
        facilityId: fac.id,
        facilityName: fac.name,
        quantity,
        unitCost,
        totalCost: quantity * unitCost,
        supplier: prod.supplier,
        createdAt: new Date().toISOString().split('T')[0],
        expectedDate: new Date(Date.now() + (prod.leadTimeDays || 4) * 86400000).toISOString().split('T')[0],
        status: 'Pending Approval',
        generatedBy: 'Manual',
      };

      setPurchaseOrders((prev) => [newPO, ...prev]);
      showToast({
        type: 'info',
        title: 'Purchase Order Created',
        message: `PO ${newPO.id} created for ${quantity}x ${prod.name}.`,
      });
    },
    [products, facilities, showToast]
  );

  // Approve Purchase Order
  const approvePurchaseOrder = useCallback(
    (poId: string) => {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === poId) {
            return { ...po, status: 'In Transit' };
          }
          return po;
        })
      );
      showToast({
        type: 'success',
        title: 'Purchase Order Approved',
        message: `PO ${poId} dispatched to supplier. Now In Transit.`,
      });
      playSound(660, 0.1);
    },
    [showToast, playSound]
  );

  // Receive Purchase Order (Restocks warehouse inventory)
  const receivePurchaseOrder = useCallback(
    (poId: string) => {
      const po = purchaseOrders.find((p) => p.id === poId);
      if (!po || po.status === 'Received') return;

      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === poId ? { ...p, status: 'Received' } : p))
      );

      // Perform stock-in
      stockIn(po.productId, po.quantity, po.facilityId, `Restock from PO ${po.id}`, po.id);
      showToast({
        type: 'success',
        title: 'Shipment Received & Restocked!',
        message: `PO ${poId} received: ${po.quantity} units of ${po.productName} added to inventory.`,
      });
    },
    [purchaseOrders, stockIn, showToast]
  );

  // Cancel Purchase Order
  const cancelPurchaseOrder = useCallback(
    (poId: string) => {
      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === poId ? { ...p, status: 'Cancelled' } : p))
      );
      showToast({
        type: 'info',
        title: 'Purchase Order Cancelled',
        message: `PO ${poId} was cancelled.`,
      });
    },
    [showToast]
  );

  // Update Reorder Rule
  const updateReorderRule = useCallback((ruleId: string, updates: Partial<ReorderRule>) => {
    setReorderRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );
  }, []);

  // Manual Pulse Simulation
  const manualSimulatePulse = useCallback(() => {
    // Randomly pick a product
    const randomProd = products[Math.floor(Math.random() * products.length)];
    if (!randomProd) return;

    const isStockIn = Math.random() > 0.6;
    const randomFac = facilities[Math.floor(Math.random() * facilities.length)];

    if (isStockIn) {
      const qty = Math.floor(Math.random() * 10) + 5;
      stockIn(randomProd.id, qty, randomFac.id, 'Live Barcode Scan Inbound', `SCAN-IN-${Date.now().toString().slice(-4)}`);
      setLastLiveEvent(`[INBOUND SCAN] +${qty} ${randomProd.name} @ ${randomFac.code}`);
    } else {
      const qty = Math.min(Math.floor(Math.random() * 4) + 1, randomProd.quantity || 1);
      stockOut(randomProd.id, qty, randomFac.id, 'Live Barcode Scan Outbound', `SCAN-OUT-${Date.now().toString().slice(-4)}`);
      setLastLiveEvent(`[OUTBOUND PICK] -${qty} ${randomProd.name} @ ${randomFac.code}`);
    }
  }, [products, facilities, stockIn, stockOut]);

  // Periodic Live Simulation Engine (disabled by user request)
  useEffect(() => {
    // No automatic background timer
  }, []);

  // Toggle Live Simulation
  const toggleLiveSimulation = () => {
    setIsLiveSimulationActive((prev) => !prev);
  };

  // Reset all to sample dataset
  const resetAllData = () => {
    setFacilities(INITIAL_FACILITIES);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setReorderRules(INITIAL_REORDER_RULES);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setUsers(INITIAL_USERS);
    setSelectedFacilityId('all');
    localStorage.clear();
    showToast({
      type: 'success',
      title: 'Database Reset',
      message: 'System restored to sample baseline dataset.',
    });
  };

  return (
    <WarehouseContext.Provider
      value={{
        selectedFacilityId,
        setSelectedFacilityId,
        facilities,
        selectedFacility,
        categories,
        products,
        transactions,
        reorderRules,
        purchaseOrders,
        users,
        currentUser,
        setCurrentUser,
        viewProducts,
        totalStockCount,
        totalProductsCount,
        lowStockCount,
        outOfStockCount,
        inStockCount,
        totalOrdersCount,
        isLiveSimulationActive,
        toggleLiveSimulation,
        simulationSpeedSec,
        setSimulationSpeedSec,
        lastLiveEvent,
        soundEnabled,
        setSoundEnabled,
        autoReorderingEnabled,
        setAutoReorderingEnabled,
        toasts,
        dismissToast,
        showToast,
        addProduct,
        editProduct,
        deleteProduct,
        stockIn,
        stockOut,
        transferStock,
        createPurchaseOrder,
        approvePurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
        updateReorderRule,
        triggerAutoReorderCheck,
        resetAllData,
        manualSimulatePulse,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
