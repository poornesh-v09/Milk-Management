import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { fetchPrices, updatePrices } from '../services/api'; // We might need new API methods
import type { ProductPrice as Price } from '../types';
import './ProductPricing.css'; // Reusing CSS

const ProductDetails: React.FC = () => {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // For Adding Product
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('0');

    // Load Prices (Products)
    const loadPrices = async () => {
        setLoading(true);
        try {
            const apiPrices = await fetchPrices();
            const priceMap: Record<string, number> = {};
            apiPrices.forEach(p => {
                priceMap[p.product] = p.price;
            });
            setPrices(priceMap);
        } catch (error) {
            console.error("Failed to load prices", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrices();
    }, []);

    const handlePriceChange = (product: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setPrices(prev => ({ ...prev, [product]: numValue }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const pricesArray: Price[] = Object.entries(prices).map(([product, price]) => ({
                product: product,
                price
            }));
            await updatePrices(pricesArray);
            alert("Product details updated successfully!");
        } catch (error) {
            console.error("Failed to update product details", error);
            alert("Failed to update.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProduct = async () => {
        if (!newProductName.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/prices/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: newProductName,
                    price: parseFloat(newProductPrice)
                })
            });

            if (response.ok) {
                alert('Product added!');
                setNewProductName('');
                setNewProductPrice('0');
                setIsAddModalOpen(false);
                loadPrices();
            } else {
                const err = await response.json();
                alert(err.message || 'Failed to add product');
            }
        } catch (error) {
            alert('Error adding product');
        }
    };

    const handleDeleteProduct = async (product: string) => {
        if (!window.confirm(`Are you sure you want to delete ${product}? This may affect historical records if not handled carefully.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/prices/${product}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Product deleted!');
                loadPrices();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            alert('Error deleting product');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading product details...</div>;

    return (
        <div className="pricing-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Product Catalog & Pricing</h2>
                    <p className="text-muted">Manage your product prices and catalog.</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button className="btn btn-secondary btn-lg" onClick={() => setIsAddModalOpen(true)}>
                            + Add Product
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card pricing-grid-container">
                <div className="pricing-grid">
                    {Object.entries(prices).map(([product, price]) => (
                        <div key={product} className="pricing-item card">
                            <div className="product-info">
                                <h3 className="product-name">{product}</h3>
                                <button
                                    className="text-red-500 text-xs hover:underline mt-1"
                                    onClick={() => handleDeleteProduct(product)}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="price-input-wrapper">
                                <span className="currency-prefix">₹</span>
                                <input
                                    type="number"
                                    className="price-input"
                                    value={price}
                                    onChange={(e) => handlePriceChange(product, e.target.value)}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h2 className="modal-title">Add New Product</h2>

                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                className="form-input"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                placeholder="e.g., Cow Milk"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Base Price (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddProduct}>Add Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
