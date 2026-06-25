import { usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef, Fragment } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import DashboardLayout from '@/Layouts/DashboardLayout';

// Format helpers
const formatPercent = (value) => `${value}%`;
const formatCurrency = (value) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(1)}Rb`;
    return `Rp ${value}`;
};

const SearchableSelect = ({ items, value, onChange, placeholder, valueKey = "CommitmentItem", labelKey = "DescCommit", minWidth = '400px', maxWidth = '500px' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = items.filter(item =>
        (String(item[valueKey]) + ' ' + String(item[labelKey])).toLowerCase().includes(search.toLowerCase())
    );

    const selectedItemObj = items.find(item => item[valueKey] === value);
    const displayValue = selectedItemObj ? `${selectedItemObj[valueKey]} (${selectedItemObj[labelKey]})` : placeholder;

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', minWidth: minWidth, maxWidth: maxWidth, flex: '1 1 auto' }}>
            <div
                className="filter-select"
                style={{
                    background: 'var(--card-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '36px',
                    width: '100%'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayValue}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'var(--popover-bg)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    zIndex: 50,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--card-border)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <div
                            style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: value === '' ? 'var(--accent)' : 'var(--text-primary)', background: value === '' ? 'var(--card-border)' : 'transparent' }}
                            onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
                        >
                            {placeholder}
                        </div>
                        {filteredItems.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: value === item[valueKey] ? 'var(--accent)' : 'var(--text-primary)',
                                    background: value === item[valueKey] ? 'var(--card-border)' : 'transparent',
                                    borderTop: '1px solid rgba(255,255,255,0.02)'
                                }}
                                onClick={() => { onChange(item[valueKey]); setIsOpen(false); setSearch(''); }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-border)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = value === item[valueKey] ? 'var(--card-border)' : 'transparent'}
                            >
                                {item[valueKey]} ({item[labelKey]})
                            </div>
                        ))}
                        {filteredItems.length === 0 && (
                            <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                Tidak ditemukan
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// New Monthly Trend Chart
const MonthlyTrendChart = ({ filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = async (retryCount = 0) => {
        setLoading(true);
        setError(false);
        const params = {
            filter: filterType,
            year_start: selectedYearStart,
            year_end: selectedYearEnd,
            month_start: selectedMonthStart,
            month_end: selectedMonthEnd,
            day_start: selectedDayStart,
            day_end: selectedDayEnd,
            fund_center: selectedFundCenter,
        };
        // Add nocache param on retries to bust server cache
        if (retryCount > 0) {
            params._nocache = Date.now();
        }
        try {
            const response = await axios.get(route('api.dashboard.monthly_trend'), { params });
            const result = response.data;

            // Check if ALL budget values are 0 - means data didn't load properly
            const allBudgetZero = Array.isArray(result) && result.length > 0 && result.every(item => (item.Budget || 0) === 0);

            if (allBudgetZero && retryCount < 10) {
                console.warn(`Budget all zero, retry #${retryCount + 1} in 5s...`);
                setTimeout(() => {
                    fetchData(retryCount + 1);
                }, 5000);
                return; // Keep loading spinner
            }

            setData(result);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching monthly trend, retrying in 5s...", error);
            setTimeout(() => {
                fetchData(retryCount + 1);
            }, 5000);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter]);

    if (loading || !data) {
        return (
            <div className="chart-card flex-center" style={{ marginTop: '24px' }}>
                <div className="loading-state">
                    <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" strokeDashoffset="12" /></svg>
                    Memuat Data Trend...
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="chart-card flex-center" style={{ marginTop: '24px' }}>
                <div className="empty-state">
                    Tidak ada data Trend Bulanan.
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#FFF9D2', padding: '12px', border: '1px solid #FFE066', borderRadius: '8px', color: '#78350F', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: '800', borderBottom: '1px solid rgba(120,53,15,0.1)', paddingBottom: '8px' }}>{label}</p>
                    <p style={{ margin: '4px 0', color: '#10B981', fontWeight: '700' }}>Budget: {formatCurrency(payload.find(p => p.dataKey === 'Budget')?.value || 0)}</p>
                    <p style={{ margin: '4px 0', color: '#EF4444', fontWeight: '700' }}>Actual: {formatCurrency(payload.find(p => p.dataKey === 'Actual')?.value || 0)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-card" style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div className="chart-header-small" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="section-title-small" style={{ margin: 0, textAlign: 'left' }}>Monthly Actual vs Budget Trend</h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Budget</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Actual</span>
                    </div>
                </div>
            </div>
            <div className="chart-container-small" style={{ minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={{ stroke: 'var(--card-border)' }} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="Budget" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorBudget)" activeDot={{ r: 6 }} />
                        <Area type="monotone" dataKey="Actual" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" activeDot={{ r: 6 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Reusable Dynamic Bar Chart (Now Nominal instead of Percentage)
const NominalChart = ({ defaultTitle, defaultCategory, filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, planColor, actualColor, commitmentItems, selectedFundCenter }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');

    const fetchChartData = async () => {
        setLoading(true);
        setError(false);
        try {
            const params = {
                filter: filterType,
                year_start: selectedYearStart,
                year_end: selectedYearEnd,
                month_start: selectedMonthStart,
                month_end: selectedMonthEnd,
                day_start: selectedDayStart,
                day_end: selectedDayEnd,
                fund_center: selectedFundCenter,
            };

            if (selectedItem) {
                params.commitment_item = selectedItem;
            } else {
                params.category = defaultCategory;
            }

            const response = await axios.get(route('api.dashboard.budget_vs_actual'), { params });
            setChartData(response.data);
            setLoading(false);
            setError(false);
        } catch (error) {
            console.error(`Error fetching chart data, retrying in 5s...`, error);
            // Silently retry to keep the loading spinner going
            setTimeout(() => {
                fetchChartData();
            }, 5000);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedItem, defaultCategory, selectedFundCenter]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ background: 'var(--popover-bg)', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 1000 }}>
                    <p className="label" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>{label}</p>
                    {payload.map((entry, index) => {
                        return (
                            <p key={index} style={{ color: entry.color, fontSize: '13px', margin: '4px 0' }}>
                                {entry.name}: {formatCurrency(entry.value)}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const selectedDesc = selectedItem
        ? commitmentItems.find(c => c.CommitmentItem === selectedItem)?.DescCommit || 'Commitment Item'
        : defaultTitle;

    return (
        <div className="chart-card">
            <div className="chart-header-small" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                {/* Filter Section */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                    <SearchableSelect
                        items={commitmentItems}
                        value={selectedItem}
                        onChange={setSelectedItem}
                        placeholder="-- Pilih Commitment Item --"
                    />
                </div>
                <h3 className="section-title-small" style={{ margin: 0, textAlign: 'center' }}>
                    {selectedDesc}
                </h3>
            </div>

            <div className="chart-container-small flex-center" style={{ minHeight: '300px' }}>
                {loading ? (
                    <div className="loading-state">
                        <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" strokeDashoffset="12" /></svg>
                        Memuat Data...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="empty-state">Data tidak tersedia.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 500 }}
                                axisLine={{ stroke: 'var(--card-border)' }}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatCurrency}
                            />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} iconType="square" />

                            <Bar dataKey="plan_nominal" name="Plan" fill={planColor} radius={[4, 4, 0, 0]} maxBarSize={45}>
                                <LabelList dataKey="plan_nominal" position="top" formatter={formatCurrency} fill="var(--text-primary)" fontSize={11} fontWeight={600} dy={-5} />
                            </Bar>

                            <Bar dataKey="actual_nominal" name="Actual" fill={actualColor} radius={[4, 4, 0, 0]} maxBarSize={45}>
                                <LabelList dataKey="actual_nominal" position="top" formatter={formatCurrency} fill="var(--text-primary)" fontSize={11} fontWeight={600} dy={-5} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

// New Cost Composition Donut Chart
const CostCompositionChart = ({ filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('api.dashboard.cost_composition'), {
                    params: {
                        filter: filterType,
                        year_start: selectedYearStart,
                        year_end: selectedYearEnd,
                        month_start: selectedMonthStart,
                        month_end: selectedMonthEnd,
                        day_start: selectedDayStart,
                        day_end: selectedDayEnd,
                        fund_center: selectedFundCenter,
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error(`Error fetching cost composition:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter]);

    if (loading || !data) {
        return (
            <div className="chart-card flex-center">
                <div className="loading-state">
                    <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" strokeDashoffset="12" /></svg>
                    Memuat Data...
                </div>
            </div>
        );
    }

    if (data.data.length === 0) {
        return (
            <div className="chart-card flex-center">
                <div className="empty-state"><p>Tidak ada data.</p></div>
            </div>
        );
    }

    return (
        <div className="chart-card">
            {/* Header matches mockup */}
            <div className="donut-header">
                <div className="donut-title-wrap">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                    <h3 className="donut-title">Cost Composition</h3>
                </div>
                <div className="donut-badge">
                    COGS {formatCurrency(data.total)}
                </div>
            </div>

            {/* Legend / Stats top area */}
            <div className="donut-legend-top">
                {data.data.map((item, idx) => (
                    <div key={idx} className="legend-item">
                        <span className="legend-color" style={{ background: item.color }}></span>
                        <span className="legend-text">{item.name} {item.percentage}%</span>
                    </div>
                ))}
            </div>

            {/* Donut Chart */}
            <div className="donut-chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={data.data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ background: 'var(--popover-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Detail List */}
            <div className="donut-details">
                {data.data.map((item, idx) => (
                    <div key={idx} className="detail-row">
                        <span className="detail-name">{item.name}</span>
                        <div className="detail-values">
                            <span className="detail-val" style={{ color: item.color }}>{formatCurrency(item.value)}</span>
                            <span className={`detail-trend ${item.trend > 0 ? 'trend-up' : 'trend-down'}`}>
                                {item.trend > 0 ? '↑' : '↓'} {item.trend > 0 ? '+' : ''}{item.trend}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// New Variance Details Modal
const VarianceDetailsModal = ({ isOpen, onClose, parentDesc, filterParams }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !parentDesc) return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('api.dashboard.variance_details'), {
                    params: { parent_desc: parentDesc, ...filterParams }
                });
                setDetails(response.data);
            } catch (error) {
                console.error("Error fetching variance details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [isOpen, parentDesc, filterParams]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#FFF9D2', width: '80%', maxWidth: '800px', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #FFE066', paddingBottom: '12px' }}>
                    <h2 style={{ margin: 0, color: '#78350F', fontSize: '1.25rem', fontWeight: 'bold' }}>Detail Variance: {parentDesc}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#92400E' }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#92400E' }}>Memuat detail...</div>
                    ) : details.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#92400E' }}>Tidak ada detail data.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#78350F' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#FFE066' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #FCD34D' }}>Commitment Item</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #FCD34D' }}>Deskripsi</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderBottom: '2px solid #FCD34D' }}>Budget</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderBottom: '2px solid #FCD34D' }}>Actual</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderBottom: '2px solid #FCD34D' }}>Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((row, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,224,102,0.2)' }}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid rgba(120,53,15,0.1)' }}>{row.commitment_item}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid rgba(120,53,15,0.1)' }}>{row.description}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid rgba(120,53,15,0.1)', color: '#10B981' }}>{formatCurrency(row.budget)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid rgba(120,53,15,0.1)', color: '#EF4444' }}>{formatCurrency(row.actual)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid rgba(120,53,15,0.1)', fontWeight: 'bold', color: row.variance > 0 ? '#EF4444' : '#10B981' }}>
                                            {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

// New Top 5 Variance Chart
const TopVarianceChart = ({ filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter, onBarClick }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('api.dashboard.top_variances'), {
                    params: {
                        filter: filterType,
                        year_start: selectedYearStart,
                        year_end: selectedYearEnd,
                        month_start: selectedMonthStart,
                        month_end: selectedMonthEnd,
                        day_start: selectedDayStart,
                        day_end: selectedDayEnd,
                        fund_center: selectedFundCenter,
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error(`Error fetching top variances:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filterType, selectedYearStart, selectedYearEnd, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter]);

    if (loading || !data) {
        return (
            <div className="chart-card flex-center" style={{ marginTop: '24px' }}>
                <div className="loading-state">
                    <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" strokeDashoffset="12" /></svg>
                    Memuat Data Variance...
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="chart-card flex-center" style={{ marginTop: '24px' }}>
                <div className="empty-state">
                    Tidak ada data Variance Cost.
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#FFF9D2', padding: '12px', border: '1px solid #FFE066', borderRadius: '8px', color: '#78350F', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: '800', borderBottom: '1px solid rgba(120,53,15,0.1)', paddingBottom: '8px' }}>{label}</p>
                    <p style={{ margin: '4px 0', color: '#EF4444', fontWeight: '700' }}>Over Budget: {formatCurrency(payload[0].value)}</p>
                    <p style={{ margin: '4px 0', color: '#92400E' }}>Actual: {formatCurrency(payload[0].payload.actual)}</p>
                    <p style={{ margin: '4px 0', color: '#92400E' }}>Budget: {formatCurrency(payload[0].payload.budget)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-card" style={{ marginTop: '24px' }}>
            <div className="chart-header-small">
                <h3 className="section-title-small">Top 5 Variance Cost (Over Budget)</h3>
            </div>
            <div className="chart-container-small" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,53,15,0.1)" horizontal={false} />
                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} stroke="#92400E" fontSize={12} />
                        <YAxis type="category" dataKey="name" width={180} stroke="#92400E" fontSize={12} tick={{ fill: '#78350F', fontWeight: '600' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,224,102,0.4)' }} />
                        <Bar dataKey="variance" fill="#EF4444" radius={[0, 8, 8, 0]} barSize={24} onClick={(data) => onBarClick && onBarClick(data.name)} style={{ cursor: 'pointer' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// New KPI Cards Component
const KpiCards = ({ data, loading }) => {
    if (loading || !data) {
        return (
            <div className="kpi-grid">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="kpi-card loading-state" style={{ minHeight: '100px' }}>
                        <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" strokeDashoffset="12" /></svg>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Revenue",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
            value: "-",
            trendText: "No data",
            trendColor: "#94a3b8",
            barColor: "#10b981" // green
        },
        {
            title: "Total Cost",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
            value: formatCurrency(data.total_cost),
            trendText: "All Cluster (Induk)",
            trendColor: "#94a3b8",
            barColor: "#ef4444" // red
        },
        {
            title: "Total COGS",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>,
            value: formatCurrency(data.total_cogs),
            trendText: data.cogs_margin !== null ? `Margin ${data.cogs_margin}%` : "Margin N/A",
            trendColor: "#94a3b8",
            barColor: "#3b82f6" // blue
        },
        {
            title: "EBITDA",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>,
            value: "-",
            trendText: data.ebitda_margin !== null ? `Margin ${data.ebitda_margin}%` : "Margin N/A",
            trendColor: "#94a3b8",
            barColor: "#f59e0b" // orange
        }
    ];

    return (
        <div className="kpi-grid">
            {cards.map((card, idx) => (
                <div key={idx} className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-icon">{card.icon}</span>
                        <span className="kpi-title">{card.title}</span>
                    </div>
                    <div className="kpi-value">{card.value}</div>
                    <div className="kpi-footer">
                        <span className="kpi-trend" style={{ color: card.trendColor }}>
                            {card.trendText}
                        </span>
                        <div className="kpi-progress-bg">
                            <div className="kpi-progress-bar" style={{ width: '70%', backgroundColor: card.barColor }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SummaryTable = ({ data, loading }) => {
    if (loading) {
        return <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Summary...</div>;
    }
    if (!data || !data.columns || data.data.length === 0) {
        return null;
    }

    return (
        <div className="card summary-table-container">
            <div className="card-header">
                <h3 className="card-title">Summary Cost vs Actual</h3>
            </div>
            <div className="card-body" style={{ overflowX: 'auto', padding: '0' }}>
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">Commitment Item<br />(Deskripsi)</th>
                            <th className="sticky-col-2">Day/Bulan</th>
                            {data.columns.map((col, idx) => (
                                <th key={idx}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((row, idx) => (
                            <Fragment key={idx}>
                                <tr>
                                    <td rowSpan="2" className="sticky-col fw-bold">{row.DescCommit}</td>
                                    <td className="sticky-col-2">Plan</td>
                                    {data.columns.map((col, cIdx) => (
                                        <td key={`plan-${cIdx}`}>{formatCurrency(row.Plan[col] || 0)}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="sticky-col-2">Actual</td>
                                    {data.columns.map((col, cIdx) => (
                                        <td key={`act-${cIdx}`}>{formatCurrency(row.Actual[col] || 0)}</td>
                                    ))}
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`
                .summary-table-container { margin-top: 24px; }
                .summary-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
                .summary-table th, .summary-table td { border: 1px solid var(--card-border); padding: 10px 16px; white-space: nowrap; }
                .summary-table thead th { background: var(--solid-card-bg); color: var(--text-primary); font-weight: 600; position: sticky; top: 0; z-index: 10; }
                .summary-table tbody tr:hover { background: var(--popover-bg); }
                .summary-table tbody td { color: var(--text-secondary); }
                .summary-table .sticky-col { position: sticky; left: 0; background: var(--solid-card-bg); z-index: 5; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--card-border); }
                .summary-table .sticky-col-2 { position: sticky; left: 200px; background: var(--solid-card-bg); z-index: 5; border-right: 1px solid var(--card-border); }
                .summary-table tbody tr:hover .sticky-col, .summary-table tbody tr:hover .sticky-col-2 { background: var(--popover-bg); }
                .fw-bold { font-weight: 600; }
            `}</style>
        </div>
    );
};

export default function Dashboard({ role = 'user' }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [filterType, setFilterType] = useState('monthly');
    const [selectedYearStart, setSelectedYearStart] = useState('2026');
    const [selectedYearEnd, setSelectedYearEnd] = useState('2026');

    const [selectedMonthStart, setSelectedMonthStart] = useState('Januari');
    const [selectedMonthEnd, setSelectedMonthEnd] = useState('Mei');

    const [selectedDayStart, setSelectedDayStart] = useState('01');
    const [selectedDayEnd, setSelectedDayEnd] = useState('10');

    const [commitmentItems, setCommitmentItems] = useState([]);
    const [fundCenters, setFundCenters] = useState([]);
    const [selectedFundCenter, setSelectedFundCenter] = useState('');

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedParentDesc, setSelectedParentDesc] = useState('');

    const handleBarClick = (parentDesc) => {
        setSelectedParentDesc(parentDesc);
        setDetailsModalOpen(true);
    };

    const [kpiData, setKpiData] = useState(null);
    const [kpiLoading, setKpiLoading] = useState(false);

    const [summaryData, setSummaryData] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [runningText, setRunningText] = useState("");

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    // Generate years dynamically around current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(route('api.dashboard.commitment_items'));
                setCommitmentItems(response.data);
            } catch (err) {
                console.error("Failed to load commitment items", err);
            }
            try {
                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));
                setFundCenters(fcResponse.data);
            } catch (err) {
                console.error("Failed to load fund centers", err);
            }
            try {
                const rtResponse = await axios.get(route('api.settings.running_text'));
                if (rtResponse.data && rtResponse.data.text) {
                    setRunningText(rtResponse.data.text);
                }
            } catch (err) {
                console.error("Failed to load running text", err);
            }
        };
        fetchItems();
    }, []);

    const [isClearing, setIsClearing] = useState(false);

    const handleClearCache = async () => {
        setIsClearing(true);
        try {
            await axios.get('/api/settings/running-text?clear_cache=1');
            window.location.reload();
        } catch (err) {
            setIsClearing(false);
            alert("Tombol gagal: " + (err.response?.status || err.message));
            console.error("Failed to clear cache", err);
        }
    };


    useEffect(() => {
        const fetchKpis = async () => {
            setKpiLoading(true);
            try {
                const response = await axios.get(route('api.dashboard.kpi'), {
                    params: {
                        filter: filterType,
                        year_start: selectedYearStart,
                        year_end: selectedYearStart,
                        month_start: selectedMonthStart,
                        month_end: filterType === 'daily' ? selectedMonthStart : selectedMonthEnd,
                        day_start: selectedDayStart,
                        day_end: selectedDayEnd,
                        fund_center: selectedFundCenter,
                    }
                });
                setKpiData(response.data);
            } catch (error) {
                console.error("Failed to load KPI Data", error);
            } finally {
                setKpiLoading(false);
            }
        };

        fetchKpis();
    }, [filterType, selectedYearStart, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter]);

    useEffect(() => {
        const fetchSummary = async () => {
            setSummaryLoading(true);
            try {
                const response = await axios.get(route('api.dashboard.summary_table'), {
                    params: {
                        filter: filterType,
                        year_start: selectedYearStart,
                        year_end: selectedYearStart,
                        month_start: selectedMonthStart,
                        month_end: filterType === 'daily' ? selectedMonthStart : selectedMonthEnd,
                        day_start: selectedDayStart,
                        day_end: selectedDayEnd,
                        fund_center: selectedFundCenter,
                    }
                });
                setSummaryData(response.data);
            } catch (error) {
                console.error("Failed to load Summary Data", error);
            } finally {
                setSummaryLoading(false);
            }
        };

        fetchSummary();
    }, [filterType, selectedYearStart, selectedMonthStart, selectedMonthEnd, selectedDayStart, selectedDayEnd, selectedFundCenter]);

    return (
        <DashboardLayout>
            <div className="dashboard-wrap">
                <main className="main-content">
                    <header className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 className="page-title">Profit & Loss Dashboard</h1>
                            <button 
                                onClick={handleClearCache}
                                disabled={isClearing}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    cursor: isClearing ? 'wait' : 'pointer',
                                    color: 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                    marginTop: '4px',
                                    opacity: isClearing ? 0.5 : 1
                                }}
                                title="Refresh & Clear Cache"
                                onMouseEnter={(e) => { if(!isClearing) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-primary)'; } }}
                                onMouseLeave={(e) => { if(!isClearing) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; } }}
                            >
                                <svg 
                                    width="18" 
                                    height="18" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className={isClearing ? "spinner" : ""}
                                >
                                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-5.27l3.08-3.08"/>
                                </svg>
                            </button>
                        </div>

                        <div className="global-filters">
                            {/* Fund Center Filter */}
                            <SearchableSelect
                                items={fundCenters}
                                value={selectedFundCenter}
                                onChange={setSelectedFundCenter}
                                placeholder="-- Pilih Fund Center --"
                                valueKey="Code"
                                labelKey="Description"
                                minWidth="150px"
                                maxWidth="250px"
                            />

                            <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="daily">Harian</option>
                                <option value="monthly">Bulanan</option>
                                <option value="yearly">Tahunan</option>
                            </select>

                            {filterType === 'daily' && (
                                <div className="filter-group">
                                    <span className="filter-label">Tgl:</span>
                                    <select className="filter-select" value={selectedDayStart} onChange={(e) => setSelectedDayStart(e.target.value)}>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <span className="filter-label">-</span>
                                    <select className="filter-select" value={selectedDayEnd} onChange={(e) => setSelectedDayEnd(e.target.value)}>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            )}

                            {(filterType === 'daily' || filterType === 'monthly') && (
                                <div className="filter-group">
                                    <span className="filter-label">Bln:</span>
                                    <select className="filter-select" value={selectedMonthStart} onChange={(e) => setSelectedMonthStart(e.target.value)}>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    {filterType === 'monthly' && (
                                        <>
                                            <span className="filter-label">-</span>
                                            <select className="filter-select" value={selectedMonthEnd} onChange={(e) => setSelectedMonthEnd(e.target.value)}>
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="filter-group">
                                <span className="filter-label">Thn:</span>
                                <select className="filter-select" value={selectedYearStart} onChange={(e) => setSelectedYearStart(e.target.value)}>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </header>

                    {/* Running Text */}
                    {runningText && (
                        <div style={{
                            background: 'var(--popover-bg)',
                            color: 'var(--accent)',
                            padding: '8px 16px',
                            margin: '0 0 24px 0',
                            borderRadius: '8px',
                            border: '1px solid var(--card-border)',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <marquee behavior="scroll" direction="left" style={{ flex: 1, fontSize: '14px' }}>
                                {runningText}
                            </marquee>
                        </div>
                    )}

                    {/* KPI Cards Area */}
                    <KpiCards data={kpiData} loading={kpiLoading} />

                    {/* Monthly Trend Chart */}
                    <MonthlyTrendChart
                        filterType={filterType}
                        selectedYearStart={selectedYearStart}
                        selectedYearEnd={selectedYearStart}
                        selectedMonthStart={selectedMonthStart}
                        selectedMonthEnd={filterType === 'daily' ? selectedMonthStart : selectedMonthEnd}
                        selectedDayStart={selectedDayStart}
                        selectedDayEnd={selectedDayEnd}
                        selectedFundCenter={selectedFundCenter}
                    />

                    {/* Dashboard Layout: 2 Columns */}
                    <div className="charts-grid-two" style={{ marginTop: '24px' }}>

                        {/* Dynamic Bar Chart Component */}
                        <NominalChart
                            defaultTitle="Budget vs Actual (Beban Gaji dan Upah)"
                            defaultCategory="gaji"
                            filterType={filterType}
                            selectedYearStart={selectedYearStart}
                            selectedYearEnd={selectedYearStart}
                            selectedMonthStart={selectedMonthStart}
                            selectedMonthEnd={filterType === 'daily' ? selectedMonthStart : selectedMonthEnd}
                            selectedDayStart={selectedDayStart}
                            selectedDayEnd={selectedDayEnd}
                            planColor="#3b82f6"
                            actualColor="#f97316"
                            commitmentItems={commitmentItems}
                            selectedFundCenter={selectedFundCenter}
                        />

                        {/* New Cost Composition Donut Chart */}
                        <CostCompositionChart
                            filterType={filterType}
                            selectedYearStart={selectedYearStart}
                            selectedYearEnd={selectedYearStart}
                            selectedMonthStart={selectedMonthStart}
                            selectedMonthEnd={filterType === 'daily' ? selectedMonthStart : selectedMonthEnd}
                            selectedDayStart={selectedDayStart}
                            selectedDayEnd={selectedDayEnd}
                            selectedFundCenter={selectedFundCenter}
                        />

                    </div>

                    {/* Top 5 Variance Cost Chart (Full Width) */}
                    <TopVarianceChart
                        filterType={filterType}
                        selectedYearStart={selectedYearStart}
                        selectedYearEnd={selectedYearStart}
                        selectedMonthStart={selectedMonthStart}
                        selectedMonthEnd={filterType === 'daily' ? selectedMonthStart : selectedMonthEnd}
                        selectedDayStart={selectedDayStart}
                        selectedDayEnd={selectedDayEnd}
                        selectedFundCenter={selectedFundCenter}
                        onBarClick={handleBarClick}
                    />

                    {/* Summary Cost vs Actual Table */}
                    <SummaryTable data={summaryData} loading={summaryLoading} />

                </main>
            </div>

            <VarianceDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                parentDesc={selectedParentDesc}
                filterParams={{
                    filter: filterType,
                    year_start: selectedYearStart,
                    year_end: selectedYearEnd,
                    month_start: selectedMonthStart,
                    month_end: selectedMonthEnd,
                    day_start: selectedDayStart,
                    day_end: selectedDayEnd,
                    fund_center: selectedFundCenter,
                }}
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .dashboard-wrap { display: flex; min-height: 100vh; background: transparent; font-family: 'Inter', sans-serif; color: var(--text-primary); }
                .main-content { flex: 1; overflow: auto; padding: 0 40px 40px; max-width: 1600px; margin: 0 auto; }
                
                .topbar { display: flex; align-items: center; justify-content: space-between; padding: 30px 0; margin-bottom: 20px; flex-wrap: wrap; gap: 20px; }
                .page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; white-space: nowrap; }
                .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 6px; }
                .page-subtitle strong { color: var(--text-primary); }

                .global-filters { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; justify-content: flex-end; flex: 1; }
                .filter-group { display: flex; align-items: center; gap: 8px; background: var(--card-bg); padding: 4px 8px 4px 12px; border-radius: 12px; border: 1px solid var(--card-border); }
                .filter-label { font-size: 13px; font-weight: 600; color: #64748b; }
                
                .filter-select { background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-primary); border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 500; outline: none; font-family: 'Inter', sans-serif; cursor: pointer; transition: border-color 0.2s; }
                .filter-select:focus, .filter-select:hover { border-color: #3b82f6; background: rgba(255,255,255,0.06); }
                .filter-select option { background: var(--popover-bg); color: var(--text-primary); }
                .logout-btn:hover { background: rgba(239,68,68,0.2); color: #f87171; }

                /* KPI CARDS */
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 10px; }
                .kpi-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; }
                .kpi-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--text-muted); }
                .kpi-icon { display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
                .kpi-icon svg { width: 16px; height: 16px; }
                .kpi-title { font-size: 13px; font-weight: 600; }
                .kpi-value { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; letter-spacing: -0.5px; }
                .kpi-footer { display: flex; flex-direction: column; gap: 6px; }
                .kpi-trend { font-size: 12px; font-weight: 500; }
                .kpi-progress-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
                .kpi-progress-bar { height: 100%; border-radius: 4px; }

                /* 2-COLUMN GRID */
                .charts-grid-two {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                .chart-card {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 20px;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                }
                .flex-center { justify-content: center; align-items: center; min-height: 400px; }

                .chart-header-small { text-align: center; margin-bottom: 24px; }
                .section-title-small { font-size: 18px; font-weight: 700; color: var(--text-primary); }
                
                .chart-container-small { flex: 1; width: 100%; min-height: 350px; display: flex; align-items: center; justify-content: center; }
                
                .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; font-size: 14px; }
                .spinner { width: 30px; height: 30px; animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* COST COMPOSITION STYLES */
                .donut-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .donut-title-wrap { display: flex; align-items: center; gap: 10px; }
                .donut-title { font-size: 20px; font-weight: 700; color: var(--text-primary); }
                .donut-badge { background: rgba(245,158,11,0.1); color: #f59e0b; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 13px; border: 1px solid rgba(245,158,11,0.2); }
                
                .donut-legend-top { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; justify-content: center; }
                .legend-item { display: flex; align-items: center; gap: 6px; }
                .legend-color { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
                .legend-text { font-size: 13px; font-weight: 600; color: var(--text-muted); }

                .donut-chart-wrap { position: relative; margin-bottom: 20px; }

                .donut-details { display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--card-border); padding-top: 20px; }
                .detail-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--card-border); }
                .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
                .detail-name { font-size: 14px; font-weight: 600; color: var(--text-muted); }
                .detail-values { display: flex; align-items: center; gap: 16px; }
                .detail-val { font-size: 14px; font-weight: 700; }
                .detail-trend { font-size: 13px; font-weight: 700; }
                .trend-up { color: #10b981; }
                .trend-down { color: #ef4444; }

                @media (max-width: 1024px) {
                    .charts-grid-two { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .main-content { padding: 0 20px 20px; }
                    .topbar { flex-direction: column; align-items: flex-start; }
                    .global-filters { width: 100%; overflow-x: auto; padding-bottom: 8px; }
                    .kpi-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 480px) {
                    .kpi-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
}
