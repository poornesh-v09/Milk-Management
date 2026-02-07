import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Landing.css';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-v5">
            <header className="v5-landing-header container">
                <div className="flex justify-between items-center h-16">
                    <h2 className="text-sm font-black tracking-tighter">AGARAM <span className="text-primary">MILK</span></h2>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 size={10} className="text-success" /> Enterprise Status: Online
                        </span>
                    </div>
                </div>
            </header>

            <main className="v5-hero-section">
                <div className="container grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
                    <div className="hero-content space-y-6">
                        <div className="inline-block bg-milk border border-primary-light px-3 py-1 rounded text-[10px] font-black tracking-[0.2em] text-primary uppercase">
                            Enterprise Logistics v5.0
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-primary">
                            PRECISION <br />
                            DELIVERY <br />
                            <span className="text-secondary opacity-60">SYSTEMS.</span>
                        </h1>
                        <p className="text-sm text-secondary max-w-md font-medium leading-relaxed">
                            Professional logistics management for modern dairy enterprises.
                            Streamlining mission logs, subscriber quotas, and financial reconciliation.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button className="btn btn-primary px-8 py-3 flex items-center gap-2 group" onClick={() => navigate('/login')}>
                                AUTHENTICATE SESSION <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="role-gateway-grid grid gap-4">
                        <div className="card card-compact gateway-card group clickable" onClick={() => navigate('/login')}>
                            <div className="flex items-center gap-4">
                                <div className="gateway-icon bg-primary text-white rounded-lg">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-primary uppercase tracking-wider">Control Center</h3>
                                    <p className="text-[10px] text-secondary font-medium uppercase tracking-tight">Administration & Financial Oversight</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="ml-auto text-primary opacity-40 group-hover:opacity-100 transition-all" />
                        </div>

                        <div className="card card-compact gateway-card group clickable" onClick={() => navigate('/login')}>
                            <div className="flex items-center gap-4">
                                <div className="gateway-icon bg-milk text-primary border-2 border-primary-light rounded-lg">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-primary uppercase tracking-wider">Field Operations</h3>
                                    <p className="text-[10px] text-secondary font-medium uppercase tracking-tight">Daily Mission Logs & Logistics</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="ml-auto text-primary opacity-40 group-hover:opacity-100 transition-all" />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="v5-landing-footer border-t py-8 mt-12 bg-white">
                <div className="container flex flex-wrap justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">© 2026 Agaram Enterprise • High-Performance Dairy Grid</p>
                    <div className="flex gap-6">
                        <span className="text-[9px] font-black text-primary-light uppercase tracking-tighter">System Core v5.1.0</span>
                        <span className="text-[9px] font-black text-primary-light uppercase tracking-tighter">Security Protocol Activated</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
