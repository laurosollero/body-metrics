// Chart.js Integration and Configuration

class ChartManager {
    constructor() {
        this.charts = {
            weight: null,
            composition: null
        };
        this.colors = Utils.getChartColors();
        this.defaultOptions = this.getDefaultChartOptions();
    }

    getDefaultChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: this.colors.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6,
                    borderWidth: 2
                },
                line: {
                    borderWidth: 2,
                    tension: 0.1
                }
            }
        };
    }

    // Initialize weight trend chart
    initWeightChart() {
        const canvas = document.getElementById('weightChart');
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.weight) {
            this.charts.weight.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [],
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.background,
                    fill: true,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: this.colors.primary,
                    pointHoverBorderColor: '#ffffff'
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    title: {
                        display: false
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Weight (kg)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        };

        this.charts.weight = new Chart(ctx, config);
        return this.charts.weight;
    }

    // Initialize body composition chart
    initCompositionChart() {
        const canvas = document.getElementById('compositionChart');
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.composition) {
            this.charts.composition.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Body Fat (%)',
                        data: [],
                        borderColor: this.colors.error,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false,
                        pointBackgroundColor: this.colors.error,
                        pointBorderColor: '#ffffff'
                    },
                    {
                        label: 'Muscle (%)',
                        data: [],
                        borderColor: this.colors.success,
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: false,
                        pointBackgroundColor: this.colors.success,
                        pointBorderColor: '#ffffff'
                    },
                    {
                        label: 'Water (%)',
                        data: [],
                        borderColor: this.colors.secondary,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: false,
                        pointBackgroundColor: this.colors.secondary,
                        pointBorderColor: '#ffffff'
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    title: {
                        display: false
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Percentage (%)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        };

        this.charts.composition = new Chart(ctx, config);
        return this.charts.composition;
    }

    // Update weight chart with new data
    updateWeightChart(period = 30) {
        if (!this.charts.weight) return;

        try {
            const measurements = dataManager.getMeasurementsInPeriod(period);
            const chartData = Utils.prepareChartData(measurements, 'weight', period);
            
            if (chartData.labels.length === 0) {
                // Show no data message
                this.charts.weight.data.labels = ['No data'];
                this.charts.weight.data.datasets[0].data = [null];
            } else {
                this.charts.weight.data.labels = chartData.labels;
                this.charts.weight.data.datasets[0].data = chartData.data;
                
                // Add trend line if we have enough data
                if (chartData.data.length >= 3) {
                    this.addTrendLine(this.charts.weight, chartData);
                }
            }
            
            this.charts.weight.update('none');
        } catch (error) {
            console.error('Error updating weight chart:', error);
        }
    }

    // Update composition chart with new data
    updateCompositionChart(period = 30) {
        if (!this.charts.composition) return;

        try {
            const measurements = dataManager.getMeasurementsInPeriod(period);
            
            const bodyFatData = Utils.prepareChartData(measurements, 'bodyFatPercent', period);
            const muscleData = Utils.prepareChartData(measurements, 'musclePercent', period);
            const waterData = Utils.prepareChartData(measurements, 'waterPercent', period);
            
            // Use the labels from the first dataset that has data
            let labels = bodyFatData.labels;
            if (labels.length === 0) labels = muscleData.labels;
            if (labels.length === 0) labels = waterData.labels;
            
            if (labels.length === 0) {
                // Show no data message
                this.charts.composition.data.labels = ['No data'];
                this.charts.composition.data.datasets[0].data = [null];
                this.charts.composition.data.datasets[1].data = [null];
                this.charts.composition.data.datasets[2].data = [null];
            } else {
                this.charts.composition.data.labels = labels;
                
                // Update each dataset
                this.charts.composition.data.datasets[0].data = bodyFatData.data;
                this.charts.composition.data.datasets[1].data = muscleData.data;
                this.charts.composition.data.datasets[2].data = waterData.data;
            }
            
            this.charts.composition.update('none');
        } catch (error) {
            console.error('Error updating composition chart:', error);
        }
    }

    // Add trend line to chart
    addTrendLine(chart, chartData) {
        if (chartData.data.length < 3) return;

        try {
            // Calculate linear regression
            const regression = this.calculateLinearRegression(chartData.data);
            const trendData = chartData.data.map((_, index) => 
                regression.slope * index + regression.intercept
            );

            // Check if trend line dataset exists
            let trendDataset = chart.data.datasets.find(ds => ds.label === 'Trend');
            
            if (!trendDataset) {
                // Add trend line dataset
                trendDataset = {
                    label: 'Trend',
                    data: trendData,
                    borderColor: this.colors.accent,
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: false,
                    tension: 0
                };
                chart.data.datasets.push(trendDataset);
            } else {
                trendDataset.data = trendData;
            }
        } catch (error) {
            console.error('Error adding trend line:', error);
        }
    }

    // Calculate linear regression for trend line
    calculateLinearRegression(data) {
        const n = data.length;
        const x = data.map((_, i) => i);
        const y = data;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }

    // Update all charts
    updateAllCharts(period = 30) {
        this.updateWeightChart(period);
        this.updateCompositionChart(period);
    }

    // Initialize all charts
    initAllCharts() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded yet, retrying...');
            setTimeout(() => this.initAllCharts(), 100);
            return;
        }

        this.initWeightChart();
        this.initCompositionChart();
        this.updateAllCharts();
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {
            weight: null,
            composition: null
        };
    }

    // Resize charts for responsive behavior
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    // Export chart as image
    exportChart(chartType, filename) {
        const chart = this.charts[chartType];
        if (!chart) return null;

        try {
            const canvas = chart.canvas;
            const url = canvas.toDataURL('image/png');
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `${chartType}-chart-${new Date().toISOString().split('T')[0]}.png`;
            a.click();
            
            return url;
        } catch (error) {
            console.error('Error exporting chart:', error);
            return null;
        }
    }

    // Get chart statistics
    getChartStats(chartType) {
        const chart = this.charts[chartType];
        if (!chart || !chart.data.datasets[0].data.length) {
            return null;
        }

        const data = chart.data.datasets[0].data.filter(value => value !== null);
        if (data.length === 0) return null;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const avg = data.reduce((sum, value) => sum + value, 0) / data.length;
        const latest = data[data.length - 1];
        const change = data.length > 1 ? latest - data[0] : 0;

        return {
            min: Utils.formatNumber(min),
            max: Utils.formatNumber(max),
            average: Utils.formatNumber(avg),
            latest: Utils.formatNumber(latest),
            change: Utils.formatNumber(change),
            changePercent: data.length > 1 ? Utils.formatNumber((change / data[0]) * 100) : '0.0'
        };
    }

    // Handle period change
    onPeriodChange(period) {
        const periodNum = parseInt(period);
        this.updateAllCharts(periodNum);
    }
}

// Global chart manager instance
const chartManager = new ChartManager();

// Export for use in other modules
window.ChartManager = ChartManager;
window.chartManager = chartManager;

// Initialize charts when DOM is ready and Chart.js is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Chart.js is loaded
    const checkChartJS = () => {
        if (typeof Chart !== 'undefined') {
            // Configure Chart.js defaults
            Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';
            Chart.defaults.color = '#64748b';
            Chart.defaults.borderColor = '#e2e8f0';
            
            // Initialize charts
            Utils.requestIdleCallback(() => {
                chartManager.initAllCharts();
            });
        } else {
            setTimeout(checkChartJS, 100);
        }
    };
    
    checkChartJS();
});

// Handle window resize
window.addEventListener('resize', Utils.throttle(() => {
    chartManager.resizeCharts();
}, 250));