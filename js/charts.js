// Chart.js Integration and Configuration

class ChartManager {
    constructor() {
        this.charts = {
            weight: null,
            composition: null,
            bmi: null
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

    // Initialize BMI trend chart
    initBMIChart() {
        const canvas = document.getElementById('bmiChart');
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.bmi) {
            this.charts.bmi.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'BMI',
                    data: [],
                    borderColor: this.colors.accent,
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    pointBackgroundColor: this.colors.accent,
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: this.colors.accent,
                    pointHoverBorderColor: '#ffffff'
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    title: {
                        display: false
                    },
                    annotation: {
                        annotations: {
                            underweight: {
                                type: 'line',
                                yMin: 18.5,
                                yMax: 18.5,
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Underweight',
                                    enabled: true,
                                    position: 'end'
                                }
                            },
                            normal: {
                                type: 'line',
                                yMin: 25,
                                yMax: 25,
                                borderColor: 'rgba(34, 197, 94, 0.5)',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Normal',
                                    enabled: true,
                                    position: 'end'
                                }
                            },
                            overweight: {
                                type: 'line',
                                yMin: 30,
                                yMax: 30,
                                borderColor: 'rgba(245, 158, 11, 0.5)',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Overweight',
                                    enabled: true,
                                    position: 'end'
                                }
                            }
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: 'BMI',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        min: 15,
                        max: 40
                    }
                }
            }
        };

        this.charts.bmi = new Chart(ctx, config);
        return this.charts.bmi;
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

    // Update BMI chart with new data
    updateBMIChart(period = 30) {
        if (!this.charts.bmi) return;

        try {
            const measurements = dataManager.getMeasurementsInPeriod(period);
            
            // Calculate BMI for each measurement that has weight
            const bmiData = [];
            const labels = [];
            
            measurements
                .filter(m => m.weight && dataManager.profile && dataManager.profile.height)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .forEach(measurement => {
                    const bmi = Utils.calculateBMI(measurement.weight, dataManager.profile.height);
                    if (bmi) {
                        bmiData.push(bmi);
                        labels.push(Utils.formatDate(measurement.date, 'short'));
                    }
                });
            
            if (labels.length === 0) {
                // Show no data message
                this.charts.bmi.data.labels = ['No data'];
                this.charts.bmi.data.datasets[0].data = [null];
            } else {
                this.charts.bmi.data.labels = labels;
                this.charts.bmi.data.datasets[0].data = bmiData;
                
                // Add trend line if we have enough data
                if (bmiData.length >= 3) {
                    this.addTrendLine(this.charts.bmi, { labels, data: bmiData });
                }
            }
            
            this.charts.bmi.update('none');
        } catch (error) {
            console.error('Error updating BMI chart:', error);
        }
    }

    // Update progress summary cards
    updateProgressSummary(period = 30) {
        try {
            const measurements = dataManager.getMeasurementsInPeriod(period);
            
            if (measurements.length < 2) {
                // Not enough data for comparison
                this.showNoProgressData(period);
                return;
            }

            // Sort measurements by date (oldest first for comparison)
            const sortedMeasurements = measurements.sort((a, b) => new Date(a.date) - new Date(b.date));
            const oldestMeasurement = sortedMeasurements[0];
            const newestMeasurement = sortedMeasurements[sortedMeasurements.length - 1];

            // Calculate percentage changes for each metric
            const metrics = [
                { key: 'weight', name: 'Weight', unit: 'kg', elementId: 'weightChange', cardId: 'weightProgress' },
                { key: 'bodyFatPercent', name: 'Body Fat', unit: '%', elementId: 'bodyFatChange', cardId: 'bodyFatProgress' },
                { key: 'musclePercent', name: 'Muscle', unit: '%', elementId: 'muscleChange', cardId: 'muscleProgress' },
                { key: 'waterPercent', name: 'Water', unit: '%', elementId: 'waterChange', cardId: 'waterProgress' }
            ];

            metrics.forEach(metric => {
                const oldValue = oldestMeasurement[metric.key];
                const newValue = newestMeasurement[metric.key];
                
                this.updateProgressCard(metric, oldValue, newValue, period);
            });

        } catch (error) {
            console.error('Error updating progress summary:', error);
        }
    }

    updateProgressCard(metric, oldValue, newValue, period) {
        const changeElement = document.getElementById(metric.elementId);
        const cardElement = document.getElementById(metric.cardId);
        
        if (!changeElement || !cardElement) return;

        if (oldValue === null || newValue === null || oldValue === undefined || newValue === undefined) {
            changeElement.innerHTML = '--';
            cardElement.className = 'progress-card neutral';
            return;
        }

        // Calculate absolute and percentage change
        const absoluteChange = newValue - oldValue;
        const percentageChange = oldValue !== 0 ? (absoluteChange / oldValue) * 100 : 0;
        
        // Determine if this is positive, negative, or neutral change
        let changeType = 'neutral';
        let arrow = '';
        
        if (Math.abs(percentageChange) > 0.5) { // Only show changes > 0.5%
            if (metric.key === 'weight' || metric.key === 'bodyFatPercent') {
                // For weight and body fat, decrease is generally positive
                changeType = absoluteChange < 0 ? 'positive' : 'negative';
                arrow = absoluteChange < 0 ? '↓' : '↑';
            } else {
                // For muscle and water, increase is generally positive
                changeType = absoluteChange > 0 ? 'positive' : 'negative';
                arrow = absoluteChange > 0 ? '↑' : '↓';
            }
        }

        // Format the display
        const formattedAbsolute = Utils.formatNumber(Math.abs(absoluteChange), 1);
        const formattedPercentage = Utils.formatNumber(Math.abs(percentageChange), 1);
        
        let displayText;
        if (Math.abs(percentageChange) < 0.1) {
            displayText = 'No change';
        } else {
            displayText = `${arrow} ${formattedAbsolute}${metric.unit}`;
        }

        // Update the card
        changeElement.innerHTML = `
            <span class="progress-change ${changeType}">
                ${displayText}
            </span>
        `;

        if (Math.abs(percentageChange) >= 0.5) {
            changeElement.innerHTML += `<div style="font-size: var(--font-size-sm); font-weight: 500; color: var(--text-secondary);">${formattedPercentage}%</div>`;
        }

        cardElement.className = `progress-card ${changeType}`;
    }

    showNoProgressData(period) {
        const metrics = ['weightChange', 'bodyFatChange', 'muscleChange', 'waterChange'];
        const cards = ['weightProgress', 'bodyFatProgress', 'muscleProgress', 'waterProgress'];
        
        metrics.forEach((metricId, index) => {
            const element = document.getElementById(metricId);
            const card = document.getElementById(cards[index]);
            
            if (element && card) {
                element.innerHTML = 'No data';
                card.className = 'progress-card neutral';
            }
        });
    }

    // Update all charts
    updateAllCharts(period = 30) {
        this.updateWeightChart(period);
        this.updateCompositionChart(period);
        this.updateBMIChart(period);
        this.updateProgressSummary(period);
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
        this.initBMIChart();
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
            composition: null,
            bmi: null
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
        
        // Update period labels in progress summary
        this.updateProgressPeriodLabels(periodNum);
    }

    updateProgressPeriodLabels(period) {
        const periodText = period === 30 ? 'Last 30 days' : 
                          period === 90 ? 'Last 90 days' : 'Last year';
        
        const periodElements = [
            'weightPeriod', 'bodyFatPeriod', 'musclePeriod', 'waterPeriod'
        ];
        
        periodElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = periodText;
            }
        });
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