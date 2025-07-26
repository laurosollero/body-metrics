// Main Application Controller

class BodyMetricsApp {
    constructor() {
        this.currentView = 'dashboard';
        this.isInitialized = false;
        this.confirmCallback = null;
        
        // Bind methods
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleFormSubmission = this.handleFormSubmission.bind(this);
        this.handleDataActions = this.handleDataActions.bind(this);
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
                return;
            }

            // Initialize components
            this.setupEventListeners();
            this.loadInitialData();
            this.updateUI();
            
            // Set initial form values
            this.setCurrentDateTime();
            
            this.isInitialized = true;
            console.log('BodyMetrics app initialized successfully');
            
        } catch (error) {
            Utils.handleError(error, 'Application initialization');
        }
    }

    setupEventListeners() {
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation);
        });

        // Quick add button
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => this.showView('entry'));
        }

        // Forms
        const measurementForm = document.getElementById('measurementForm');
        if (measurementForm) {
            measurementForm.addEventListener('submit', this.handleFormSubmission);
        }

        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleFormSubmission);
        }

        // Save and add another button
        const saveAndAddBtn = document.getElementById('saveAndAddAnother');
        if (saveAndAddBtn) {
            saveAndAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveMeasurement(true);
            });
        }

        // Data management buttons
        const exportBtn = document.getElementById('exportData');
        const importFile = document.getElementById('importFile');
        const clearBtn = document.getElementById('clearData');

        if (exportBtn) exportBtn.addEventListener('click', this.handleDataActions);
        if (importFile) importFile.addEventListener('change', this.handleDataActions);
        if (clearBtn) clearBtn.addEventListener('click', this.handleDataActions);

        // Chart period selector
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                chartManager.onPeriodChange(e.target.value);
            });
        }

        // Modal controls
        this.setupModalListeners();

        // Form validation on input
        this.setupFormValidation();
    }

    setupModalListeners() {
        const modal = document.getElementById('confirmModal');
        const modalClose = document.getElementById('modalClose');
        const confirmCancel = document.getElementById('confirmCancel');
        const confirmAction = document.getElementById('confirmAction');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideModal());
        }

        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.hideModal());
        }

        if (confirmAction) {
            confirmAction.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback();
                }
                this.hideModal();
            });
        }

        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideModal();
            }
        });
    }

    setupFormValidation() {
        // Real-time validation for measurement form
        const measurementInputs = document.querySelectorAll('#measurementForm input[type="number"]');
        measurementInputs.forEach(input => {
            input.addEventListener('input', Utils.debounce((e) => {
                this.validateInput(e.target);
            }, 300));
        });

        // Real-time validation for profile form
        const profileInputs = document.querySelectorAll('#profileForm input');
        profileInputs.forEach(input => {
            input.addEventListener('input', Utils.debounce((e) => {
                this.validateInput(e.target);
            }, 300));
        });
    }

    validateInput(input) {
        const value = input.value;
        const name = input.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        input.classList.remove('error');
        
        // Get or create error message element
        let errorEl = input.parentElement.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.style.color = 'var(--error-color)';
            errorEl.style.fontSize = 'var(--font-size-sm)';
            errorEl.style.marginTop = 'var(--spacing-xs)';
            input.parentElement.appendChild(errorEl);
        }

        if (value !== '') {
            switch (name) {
                case 'weight':
                    const weightValidation = Utils.validateNumber(value, 0.1, 300);
                    isValid = weightValidation.valid;
                    errorMessage = weightValidation.error || '';
                    break;
                case 'bodyFat':
                case 'water':
                case 'muscle':
                    const percentValidation = Utils.validateNumber(value, 0, 100);
                    isValid = percentValidation.valid;
                    errorMessage = percentValidation.error || '';
                    break;
                case 'boneMass':
                    const boneValidation = Utils.validateNumber(value, 0, 10);
                    isValid = boneValidation.valid;
                    errorMessage = boneValidation.error || '';
                    break;
                case 'age':
                    const ageValidation = Utils.validateNumber(value, 1, 120);
                    isValid = ageValidation.valid;
                    errorMessage = ageValidation.error || '';
                    break;
                case 'height':
                    const heightValidation = Utils.validateNumber(value, 50, 250);
                    isValid = heightValidation.valid;
                    errorMessage = heightValidation.error || '';
                    break;
            }
        }

        // Update UI based on validation
        if (!isValid) {
            input.classList.add('error');
            errorEl.textContent = errorMessage;
            errorEl.style.display = 'block';
        } else {
            errorEl.style.display = 'none';
        }

        return isValid;
    }

    handleNavigation(e) {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        if (view) {
            this.showView(view);
        }
    }

    showView(viewName) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));

        // Show target view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        this.currentView = viewName;

        // Update view-specific content
        switch (viewName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'entry':
                this.setCurrentDateTime();
                break;
            case 'charts':
                this.updateCharts();
                break;
            case 'profile':
                this.updateProfile();
                break;
        }

        // Announce view change to screen readers
        Utils.announceToScreenReader(`Switched to ${viewName} view`);
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        
        if (form.id === 'measurementForm') {
            this.saveMeasurement(false);
        } else if (form.id === 'profileForm') {
            this.saveProfile();
        }
    }

    async saveMeasurement(addAnother = false) {
        try {
            const form = document.getElementById('measurementForm');
            const formData = Utils.getFormData(form);
            
            // Validate all inputs
            const inputs = form.querySelectorAll('input[type="number"]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                Utils.showToast('Please fix the validation errors', 'error');
                return;
            }

            // Convert form data to measurement object
            const measurementData = {
                date: formData.date,
                weight: Utils.parseNumber(formData.weight),
                bodyFatPercent: Utils.parseNumber(formData.bodyFat),
                waterPercent: Utils.parseNumber(formData.water),
                musclePercent: Utils.parseNumber(formData.muscle),
                boneMass: Utils.parseNumber(formData.boneMass),
                notes: formData.notes || ''
            };

            const result = dataManager.saveMeasurement(measurementData);
            
            if (result.success) {
                Utils.showToast('Measurement saved successfully!', 'success');
                
                if (addAnother) {
                    // Clear form but keep date
                    const currentDate = form.querySelector('[name="date"]').value;
                    Utils.clearForm(form);
                    form.querySelector('[name="date"]').value = currentDate;
                    form.querySelector('[name="weight"]').focus();
                } else {
                    // Navigate to dashboard
                    this.showView('dashboard');
                }
                
                // Update UI
                this.updateUI();
            } else {
                Utils.showToast(result.error, 'error');
            }
            
        } catch (error) {
            Utils.handleError(error, 'saving measurement');
        }
    }

    saveProfile() {
        try {
            const form = document.getElementById('profileForm');
            const formData = Utils.getFormData(form);
            
            // Convert form data to profile object
            const profileData = {
                age: Utils.parseNumber(formData.age),
                height: Utils.parseNumber(formData.height),
                gender: formData.gender || '',
                activityLevel: formData.activityLevel || ''
            };

            const result = dataManager.saveProfile(profileData);
            
            if (result.success) {
                Utils.showToast('Profile saved successfully!', 'success');
                this.updateUI();
            } else {
                Utils.showToast(result.error, 'error');
            }
            
        } catch (error) {
            Utils.handleError(error, 'saving profile');
        }
    }

    handleDataActions(e) {
        const action = e.target.id || e.target.closest('button')?.id;
        
        switch (action) {
            case 'exportData':
                this.exportData();
                break;
            case 'importFile':
                if (e.target.files && e.target.files[0]) {
                    this.importData(e.target.files[0]);
                }
                break;
            case 'clearData':
                this.confirmClearData();
                break;
        }
    }

    exportData() {
        try {
            const result = dataManager.exportData();
            if (result.success) {
                Utils.showToast('Data exported successfully!', 'success');
            } else {
                Utils.showToast(result.error, 'error');
            }
        } catch (error) {
            Utils.handleError(error, 'exporting data');
        }
    }

    async importData(file) {
        try {
            const result = await dataManager.importData(file);
            
            if (result.success) {
                let message = 'Data imported successfully!';
                if (result.imported !== undefined) {
                    message += ` ${result.imported} measurements imported`;
                    if (result.skipped > 0) {
                        message += `, ${result.skipped} skipped`;
                    }
                }
                Utils.showToast(message, 'success');
                this.updateUI();
            } else {
                Utils.showToast(result.error, 'error');
            }
            
            // Reset file input
            document.getElementById('importFile').value = '';
            
        } catch (error) {
            Utils.handleError(error, 'importing data');
        }
    }

    confirmClearData() {
        this.showModal(
            'Clear All Data',
            'Are you sure you want to delete all your data? This action cannot be undone.',
            () => this.clearAllData()
        );
    }

    clearAllData() {
        try {
            const result = dataManager.clearAllData();
            
            if (result.success) {
                Utils.showToast('All data cleared successfully', 'success');
                this.updateUI();
                this.showView('dashboard');
            } else {
                Utils.showToast(result.error, 'error');
            }
            
        } catch (error) {
            Utils.handleError(error, 'clearing data');
        }
    }

    showModal(title, message, callback = null) {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        this.confirmCallback = callback;
        
        modal.classList.add('active');
        
        // Focus the cancel button for accessibility
        const cancelBtn = document.getElementById('confirmCancel');
        if (cancelBtn) {
            setTimeout(() => cancelBtn.focus(), 100);
        }
    }

    hideModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('active');
        this.confirmCallback = null;
    }

    loadInitialData() {
        // Data is already loaded by DataManager constructor
        this.updateProfile();
    }

    updateUI() {
        this.updateDashboard();
        this.updateCharts();
        this.updateProfile();
    }

    updateDashboard() {
        // Update current stats
        const stats = dataManager.getCurrentStats();
        
        const weightEl = document.getElementById('currentWeight');
        const bodyFatEl = document.getElementById('currentBodyFat');
        const muscleEl = document.getElementById('currentMuscle');
        const waterEl = document.getElementById('currentWater');
        
        if (weightEl) weightEl.textContent = stats.weight;
        if (bodyFatEl) bodyFatEl.textContent = stats.bodyFat;
        if (muscleEl) muscleEl.textContent = stats.muscle;
        if (waterEl) waterEl.textContent = stats.water;

        // Update welcome message
        this.updateWelcomeMessage();
        
        // Update recent measurements table
        this.updateRecentMeasurements();
    }

    updateWelcomeMessage() {
        const welcomeEl = document.getElementById('welcomeMessage');
        if (!welcomeEl) return;

        const latest = dataManager.getLatestMeasurement();
        if (latest) {
            const relativeTime = Utils.formatDate(latest.date, 'relative');
            welcomeEl.textContent = `Last measurement: ${relativeTime}`;
        } else {
            welcomeEl.textContent = 'Welcome! Add your first measurement to get started.';
        }
    }

    updateRecentMeasurements() {
        const container = document.getElementById('recentMeasurements');
        if (!container) return;

        const measurements = dataManager.getRecentMeasurements(5);
        
        if (measurements.length === 0) {
            container.innerHTML = '<div class="no-data">No measurements yet. Add your first entry!</div>';
            return;
        }

        // Create table
        const table = document.createElement('table');
        table.className = 'measurements-table-element';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Header
        const headerRow = table.createTHead().insertRow();
        ['Date', 'Weight', 'Body Fat', 'Muscle'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.padding = 'var(--spacing-sm)';
            th.style.textAlign = 'left';
            th.style.borderBottom = '1px solid var(--border-color)';
            th.style.fontSize = 'var(--font-size-sm)';
            th.style.fontWeight = '600';
            headerRow.appendChild(th);
        });

        // Body
        const tbody = table.createTBody();
        measurements.forEach(measurement => {
            const row = tbody.insertRow();
            
            // Date
            const dateCell = row.insertCell();
            dateCell.textContent = Utils.formatDate(measurement.date, 'short');
            dateCell.style.padding = 'var(--spacing-sm)';
            dateCell.style.fontSize = 'var(--font-size-sm)';
            
            // Weight
            const weightCell = row.insertCell();
            weightCell.textContent = measurement.weight ? `${Utils.formatNumber(measurement.weight)} kg` : '--';
            weightCell.style.padding = 'var(--spacing-sm)';
            weightCell.style.fontSize = 'var(--font-size-sm)';
            
            // Body Fat
            const bodyFatCell = row.insertCell();
            bodyFatCell.textContent = measurement.bodyFatPercent ? `${Utils.formatNumber(measurement.bodyFatPercent)}%` : '--';
            bodyFatCell.style.padding = 'var(--spacing-sm)';
            bodyFatCell.style.fontSize = 'var(--font-size-sm)';
            
            // Muscle
            const muscleCell = row.insertCell();
            muscleCell.textContent = measurement.musclePercent ? `${Utils.formatNumber(measurement.musclePercent)}%` : '--';
            muscleCell.style.padding = 'var(--spacing-sm)';
            muscleCell.style.fontSize = 'var(--font-size-sm)';
        });

        container.innerHTML = '';
        container.appendChild(table);
    }

    updateCharts() {
        if (this.currentView === 'charts') {
            const period = document.getElementById('chartPeriod')?.value || 30;
            chartManager.updateAllCharts(parseInt(period));
        }
    }

    updateProfile() {
        const form = document.getElementById('profileForm');
        if (!form || !dataManager.profile) return;

        Utils.setFormData(form, {
            age: dataManager.profile.age,
            height: dataManager.profile.height,
            gender: dataManager.profile.gender,
            activityLevel: dataManager.profile.activityLevel
        });
    }

    setCurrentDateTime() {
        const dateInput = document.getElementById('measurementDate');
        if (dateInput) {
            dateInput.value = Utils.getCurrentDateTime();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bodyMetricsApp = new BodyMetricsApp();
});

// Handle app lifecycle events
window.addEventListener('beforeunload', () => {
    // Cleanup if needed
    if (window.chartManager) {
        chartManager.destroyAllCharts();
    }
});

// Handle visibility change (for PWA support)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.bodyMetricsApp) {
        // App became visible, refresh data if needed
        bodyMetricsApp.updateUI();
    }
});