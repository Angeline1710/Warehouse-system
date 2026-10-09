import React, { useState } from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { Sidebar, ActiveNavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { FacilitiesView } from './components/FacilitiesView';
import { ReorderView } from './components/ReorderView';
import { ReportsView } from './components/ReportsView';
import { WarehouseDBView } from './components/WarehouseDBView';
import { AddProductModal } from './components/modals/AddProductModal';
import { EditProductModal } from './components/modals/EditProductModal';
import { StockInModal } from './components/modals/StockInModal';
import { StockOutModal } from './components/modals/StockOutModal';
import { StockTransferModal } from './components/modals/StockTransferModal';
import { Product } from './types/warehouse';

function WarehouseApp() {

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [selectedStockInProduct, setSelectedStockInProduct] = useState<string | undefined>();

  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [selectedStockOutProduct, setSelectedStockOutProduct] = useState<string | undefined>();

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedTransferProduct, setSelectedTransferProduct] = useState<string | undefined>();

  // Handlers
  const handleOpenAddProduct = () => setIsAddProductOpen(true);

  const handleOpenStockIn = (productId?: string) => {
    setSelectedStockInProduct(productId);
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (productId?: string) => {
    setSelectedStockOutProduct(productId);
    setIsStockOutOpen(true);
  };

  const handleOpenTransfer = (productId?: string) => {
    setSelectedTransferProduct(productId);
    setIsTransferOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsEditProductOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f9] text-slate-800 antialiased font-sans">
      {/* Sidebar matching Image 1 */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        onOpenAddProduct={handleOpenAddProduct}
        onOpenStockIn={() => handleOpenStockIn()}
        onOpenStockOut={() => handleOpenStockOut()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenAddProduct={handleOpenAddProduct}
                onOpenStockIn={handleOpenStockIn}
                onOpenStockOut={handleOpenStockOut}
                onEditProduct={handleEditProduct}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
              />
            )}

            {(activeTab === 'products' ||
              activeTab === 'inventory' ||
              activeTab === 'search') && (
              <ProductsView
                onOpenAddProduct={handleOpenAddProduct}
                onOpenStockIn={handleOpenStockIn}
                onOpenStockOut={handleOpenStockOut}
                onOpenTransfer={handleOpenTransfer}
                onEditProduct={handleEditProduct}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'facilities' && (
              <FacilitiesView onOpenTransfer={handleOpenTransfer} />
            )}

            {activeTab === 'reorders' && <ReorderView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'warehousedb' && <WarehouseDBView />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <EditProductModal
        isOpen={isEditProductOpen}
        onClose={() => {
          setIsEditProductOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => {
          setIsStockInOpen(false);
          setSelectedStockInProduct(undefined);
        }}
        defaultProductId={selectedStockInProduct}
      />

      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => {
          setIsStockOutOpen(false);
          setSelectedStockOutProduct(undefined);
        }}
        defaultProductId={selectedStockOutProduct}
      />

      <StockTransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setSelectedTransferProduct(undefined);
        }}
        defaultProductId={selectedTransferProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <WarehouseProvider>
      <WarehouseApp />
    </WarehouseProvider>
  );
}
