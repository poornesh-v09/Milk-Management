import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductStatistics, type ProductStats } from '../services/statsService';
import HistorySelector from '../components/HistorySelector';
import './ProductDetails.css'; // We can reuse the CSS or rename it later

const ProductAnalytics: React.FC = () => {
    const [productStats, setProductStats] = useState<ProductStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const stats = await getProductStatistics(selectedMonth, selectedYear);
                setProductStats(stats);
            } catch (err) {
                setError('Failed to load product statistics. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [selectedMonth, selectedYear]);

    const totalRevenue = productStats.reduce((sum, p) => sum + p.monthlyRevenue, 0);

    return (
        <div className="page-container">
            <div className="page-header-section">
                <div className="page-header">
                    <p className="subtitle">Product quantities and revenue breakdown</p>
                </div>
            </div>

            <HistorySelector
                mode="month"
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                label="View Statistics for Month"
            />

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading statistics...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button className="btn-retry" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    <div className="products-grid">
                        {productStats.map(product => {
                            const revenuePercentage = totalRevenue > 0
                                ? (product.monthlyRevenue / totalRevenue) * 100
                                : 0;

                            return (
                                <div key={product.product} className="product-card card">
                                    <div className="product-header">
                                        <h3 className="product-title">{product.product}</h3>
                                        <div className="revenue-badge">
                                            ₹{product.monthlyRevenue.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="product-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Daily Quantity</span>
                                            <span className="stat-value">{product.dailyQuantity} units</span>
                                        </div>

                                        <div className="stat-item">
                                            <span className="stat-label">Monthly Quantity</span>
                                            <span className="stat-value">{product.monthlyQuantity} units</span>
                                        </div>

                                        <div className="stat-item">
                                            <span className="stat-label">Monthly Revenue</span>
                                            <span className="stat-value revenue">
                                                ₹{product.monthlyRevenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="revenue-contribution">
                                        <div className="contribution-label">
                                            Revenue Contribution: {revenuePercentage.toFixed(1)}%
                                        </div>
                                        <div className="contribution-bar">
                                            <div
                                                className="contribution-fill"
                                                style={{ width: `${revenuePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="summary-card card">
                        <h3 className="summary-title">Total Monthly Revenue</h3>
                        <div className="summary-value">₹{totalRevenue.toLocaleString()}</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductAnalytics;
