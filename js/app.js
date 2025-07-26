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
            
            // Initialize service worker for PWA functionality
            this.initServiceWorker();
            
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

        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', this.handleFormSubmission);
        }

        const quickGoalForm = document.getElementById('quickGoalForm');
        if (quickGoalForm) {
            quickGoalForm.addEventListener('submit', this.handleFormSubmission);
        }

        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', this.handleFormSubmission);
        }

        // Notification checkbox toggle
        const notificationsEnabled = document.getElementById('notificationsEnabled');
        const notificationSettings = document.getElementById('notificationSettings');
        if (notificationsEnabled && notificationSettings) {
            notificationsEnabled.addEventListener('change', (e) => {
                notificationSettings.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Test notification button
        const testNotificationBtn = document.getElementById('testNotification');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => {
                this.sendTestNotification();
            });
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

        // Goal form specific handlers
        this.setupGoalFormHandlers();

        // Quick goal modal handlers
        this.setupQuickGoalHandlers();
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

        // Real-time validation for goal form
        const goalInputs = document.querySelectorAll('#goalForm input[type="number"]');
        goalInputs.forEach(input => {
            input.addEventListener('input', Utils.debounce((e) => {
                this.validateInput(e.target);
            }, 300));
        });
    }

    setupGoalFormHandlers() {
        const goalTypeSelect = document.getElementById('goalType');
        const targetUnit = document.getElementById('targetUnit');
        const targetValueInput = document.getElementById('targetValue');

        if (goalTypeSelect && targetUnit) {
            goalTypeSelect.addEventListener('change', (e) => {
                const type = e.target.value;
                
                // Update unit display
                switch (type) {
                    case 'weight':
                        targetUnit.textContent = 'kg';
                        targetValueInput.placeholder = 'e.g., 70.0';
                        targetValueInput.min = '0.1';
                        targetValueInput.max = '300';
                        break;
                    case 'bodyFat':
                    case 'muscle':
                    case 'water':
                        targetUnit.textContent = '%';
                        targetValueInput.placeholder = 'e.g., 15.0';
                        targetValueInput.min = '0';
                        targetValueInput.max = '100';
                        break;
                    default:
                        targetUnit.textContent = '';
                        targetValueInput.placeholder = '';
                        targetValueInput.removeAttribute('min');
                        targetValueInput.removeAttribute('max');
                }
            });
        }

        // Set minimum date to today for target date
        const targetDateInput = document.getElementById('targetDate');
        if (targetDateInput) {
            const today = new Date().toISOString().split('T')[0];
            targetDateInput.min = today;
        }
    }

    setupQuickGoalHandlers() {
        // Quick goal buttons
        const quickSetGoalBtn = document.getElementById('quickSetGoal');
        const setFirstGoalBtn = document.getElementById('setFirstGoal');
        const quickGoalClose = document.getElementById('quickGoalClose');
        const quickGoalCancel = document.getElementById('quickGoalCancel');

        if (quickSetGoalBtn) {
            quickSetGoalBtn.addEventListener('click', () => this.showQuickGoalModal());
        }

        if (setFirstGoalBtn) {
            setFirstGoalBtn.addEventListener('click', () => this.showQuickGoalModal());
        }

        if (quickGoalClose) {
            quickGoalClose.addEventListener('click', () => this.hideQuickGoalModal());
        }

        if (quickGoalCancel) {
            quickGoalCancel.addEventListener('click', () => this.hideQuickGoalModal());
        }

        // Goal type selection
        const goalTypeButtons = document.querySelectorAll('.goal-type-btn');
        goalTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectGoalType(btn.dataset.type);
            });
        });

        // Set minimum date for quick goal
        const quickTargetDate = document.getElementById('quickTargetDate');
        if (quickTargetDate) {
            const today = new Date().toISOString().split('T')[0];
            quickTargetDate.min = today;
        }
    }

    showQuickGoalModal() {
        const modal = document.getElementById('quickGoalModal');
        if (modal) {
            modal.classList.add('active');
            
            // Reset form
            this.resetQuickGoalForm();
            
            // Focus on first goal type button
            const firstBtn = document.querySelector('.goal-type-btn');
            if (firstBtn) {
                setTimeout(() => firstBtn.focus(), 100);
            }
        }
    }

    hideQuickGoalModal() {
        const modal = document.getElementById('quickGoalModal');
        if (modal) {
            modal.classList.remove('active');
            this.resetQuickGoalForm();
        }
    }

    resetQuickGoalForm() {
        // Reset goal type selection
        document.querySelectorAll('.goal-type-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Hide details section
        const details = document.getElementById('quickGoalDetails');
        if (details) {
            details.style.display = 'none';
        }

        // Clear form
        const form = document.getElementById('quickGoalForm');
        if (form) {
            Utils.clearForm(form);
        }
    }

    selectGoalType(type) {
        // Update button selection
        document.querySelectorAll('.goal-type-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.type === type);
        });

        // Set hidden input
        const hiddenInput = document.getElementById('quickGoalType');
        if (hiddenInput) {
            hiddenInput.value = type;
        }

        // Update unit display
        const unitDisplay = document.getElementById('quickUnit');
        const targetInput = document.getElementById('quickTargetValue');
        
        if (unitDisplay && targetInput) {
            switch (type) {
                case 'weight':
                    unitDisplay.textContent = 'kg';
                    targetInput.placeholder = 'e.g., 70.0';
                    targetInput.min = '0.1';
                    targetInput.max = '300';
                    break;
                case 'bodyFat':
                case 'muscle':
                case 'water':
                    unitDisplay.textContent = '%';
                    targetInput.placeholder = 'e.g., 15.0';
                    targetInput.min = '0';
                    targetInput.max = '100';
                    break;
            }
        }

        // Show details section
        const details = document.getElementById('quickGoalDetails');
        if (details) {
            details.style.display = 'block';
            targetInput.focus();
        }
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
                this.updateGoals();
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
        } else if (form.id === 'goalForm') {
            this.saveGoal();
        } else if (form.id === 'quickGoalForm') {
            this.saveQuickGoal();
        } else if (form.id === 'notificationForm') {
            this.saveNotificationSettings();
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
                
                // Show achievement notifications
                if (result.achievements && result.achievements.length > 0) {
                    result.achievements.forEach(achievement => {
                        Utils.showAchievementNotification(achievement);
                    });
                }
                
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

    saveGoal() {
        try {
            const form = document.getElementById('goalForm');
            const formData = Utils.getFormData(form);
            
            // Validate target value
            const targetValueInput = form.querySelector('[name="targetValue"]');
            if (!this.validateInput(targetValueInput)) {
                Utils.showToast('Please fix the validation errors', 'error');
                return;
            }

            // Convert form data to goal object
            const goalData = {
                type: formData.type,
                targetValue: Utils.parseNumber(formData.targetValue),
                targetDate: formData.targetDate || null,
                notes: formData.notes || ''
            };

            const result = dataManager.saveGoal(goalData);
            
            if (result.success) {
                Utils.showToast('Goal set successfully!', 'success');
                
                // Show achievement notifications
                if (result.achievements && result.achievements.length > 0) {
                    result.achievements.forEach(achievement => {
                        Utils.showAchievementNotification(achievement);
                    });
                }
                
                // Clear form
                Utils.clearForm(form);
                
                // Update UI
                this.updateGoals();
                this.updateDashboard();
            } else {
                Utils.showToast(result.error, 'error');
            }
            
        } catch (error) {
            Utils.handleError(error, 'saving goal');
        }
    }

    saveQuickGoal() {
        try {
            const form = document.getElementById('quickGoalForm');
            const formData = Utils.getFormData(form);
            
            // Validate target value
            const targetValueInput = form.querySelector('[name="targetValue"]');
            if (!this.validateInput(targetValueInput)) {
                Utils.showToast('Please fix the validation errors', 'error');
                return;
            }

            // Convert form data to goal object
            const goalData = {
                type: formData.type,
                targetValue: Utils.parseNumber(formData.targetValue),
                targetDate: formData.targetDate || null,
                notes: '' // Quick goals don't have notes
            };

            const result = dataManager.saveGoal(goalData);
            
            if (result.success) {
                Utils.showToast('Goal set successfully! 🎉', 'success');
                
                // Show achievement notifications
                if (result.achievements && result.achievements.length > 0) {
                    result.achievements.forEach(achievement => {
                        Utils.showAchievementNotification(achievement);
                    });
                }
                
                // Hide modal
                this.hideQuickGoalModal();
                
                // Update UI
                this.updateGoals();
                this.updateDashboard();
            } else {
                Utils.showToast(result.error, 'error');
            }
            
        } catch (error) {
            Utils.handleError(error, 'saving quick goal');
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
        this.updateGoals();
        this.loadNotificationSettings();
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

    updateGoals() {
        this.updateActiveGoalsList();
        this.updateGoalIndicators();
    }

    updateActiveGoalsList() {
        const container = document.getElementById('activeGoalsList');
        if (!container) return;

        const activeGoals = dataManager.getActiveGoals();
        
        if (activeGoals.length === 0) {
            container.innerHTML = '<div class="no-goals">No active goals. Set one below!</div>';
            return;
        }

        container.innerHTML = '';
        
        activeGoals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            container.appendChild(goalCard);
        });
    }

    createGoalCard(goal) {
        const progress = goal.calculateProgress();
        const statusText = goal.getStatusText();
        
        const card = Utils.createElement('div', 'goal-card');
        
        // Add status classes
        if (progress.isCompleted) {
            card.classList.add('completed');
        } else if (progress.daysRemaining !== null && progress.daysRemaining <= 0) {
            card.classList.add('overdue');
        }
        
        card.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.type === 'bodyFat' ? 'Body Fat' : goal.type}</div>
                <div class="goal-actions">
                    <button class="goal-action-btn" onclick="bodyMetricsApp.editGoal('${goal.id}')" title="Edit goal">
                        ✏️
                    </button>
                    <button class="goal-action-btn" onclick="bodyMetricsApp.deleteGoal('${goal.id}')" title="Delete goal">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="goal-target">
                Target: ${Utils.formatNumber(goal.targetValue)}${goal.type === 'weight' ? 'kg' : '%'}
                ${goal.targetDate ? ` by ${Utils.formatDate(goal.targetDate, 'short')}` : ''}
            </div>
            
            <div class="goal-progress">
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill ${progress.isCompleted ? 'completed' : ''} ${progress.daysRemaining !== null && progress.daysRemaining <= 0 ? 'overdue' : ''}" 
                         style="width: ${Math.min(100, progress.percentage)}%"></div>
                </div>
                <div class="goal-progress-text">
                    <span class="goal-percentage ${progress.isCompleted ? 'completed' : ''} ${progress.daysRemaining !== null && progress.daysRemaining <= 0 ? 'overdue' : ''}">
                        ${Utils.formatNumber(progress.percentage)}%
                    </span>
                    <span class="goal-status ${progress.isCompleted ? 'completed' : ''} ${progress.daysRemaining !== null && progress.daysRemaining <= 0 ? 'overdue' : ''}">
                        ${statusText}
                    </span>
                </div>
            </div>
            
            ${goal.notes ? `<div class="goal-notes" style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: var(--spacing-sm);">${goal.notes}</div>` : ''}
        `;
        
        return card;
    }

    updateGoalIndicators() {
        // Check if we're on dashboard view
        if (this.currentView !== 'dashboard') return;

        // Find the goal indicators container in the dashboard goals section
        const indicatorsContainer = document.getElementById('goalIndicators');
        if (!indicatorsContainer) return;

        const activeGoals = dataManager.getActiveGoals();
        
        if (activeGoals.length === 0) {
            // Show the no-goals state
            indicatorsContainer.innerHTML = `
                <div class="no-goals-dashboard">
                    <div class="no-goals-icon">🎯</div>
                    <div class="no-goals-text">
                        <strong>No goals set yet</strong>
                        <p>Set a health goal to track your progress!</p>
                    </div>
                    <button class="btn btn-primary" id="setFirstGoal">Set Your First Goal</button>
                </div>
            `;
            
            // Re-attach event listener for the dynamically created button
            const setFirstGoalBtn = document.getElementById('setFirstGoal');
            if (setFirstGoalBtn) {
                setFirstGoalBtn.addEventListener('click', () => this.showQuickGoalModal());
            }
            return;
        }

        // Clear container and add goal indicators
        indicatorsContainer.innerHTML = '';
        
        activeGoals.forEach(goal => {
            const indicator = this.createGoalIndicator(goal);
            indicatorsContainer.appendChild(indicator);
        });
    }

    createGoalIndicator(goal) {
        const progress = goal.calculateProgress();
        
        const indicator = Utils.createElement('div', 'goal-indicator');
        
        // Add status classes
        if (progress.isCompleted) {
            indicator.classList.add('completed');
        } else if (progress.daysRemaining !== null && progress.daysRemaining <= 0) {
            indicator.classList.add('overdue');
        }
        
        const currentValue = goal.currentValue || 0;
        const statusText = goal.getStatusText();
        
        indicator.innerHTML = `
            <div class="goal-indicator-header">
                <div class="goal-indicator-title">
                    ${goal.type === 'bodyFat' ? '📉 Body Fat' : goal.type === 'weight' ? '⚖️ Weight' : goal.type === 'muscle' ? '💪 Muscle' : '💧 Water'}
                </div>
                <div class="goal-indicator-target">Target: ${Utils.formatNumber(goal.targetValue)}${goal.type === 'weight' ? 'kg' : '%'}</div>
            </div>
            <div class="goal-indicator-values">
                <div class="goal-current">Current: ${Utils.formatNumber(currentValue)}${goal.type === 'weight' ? 'kg' : '%'}</div>
                <div class="goal-remaining">
                    ${progress.remainingValue > 0 ? `${Utils.formatNumber(Math.abs(progress.remainingValue))}${goal.type === 'weight' ? 'kg' : '%'} to go` : 'Goal achieved! 🎉'}
                </div>
            </div>
            <div class="goal-indicator-progress">
                <div class="goal-indicator-fill ${progress.isCompleted ? 'completed' : ''} ${progress.daysRemaining !== null && progress.daysRemaining <= 0 ? 'overdue' : ''}" 
                     style="width: ${Math.min(100, Math.abs(progress.percentage))}%"></div>
            </div>
            <div class="goal-indicator-footer">
                <div class="goal-indicator-text">${Utils.formatNumber(Math.abs(progress.percentage))}% ${progress.percentage >= 0 ? 'complete' : 'over target'}</div>
                <div class="goal-status-text">${statusText}</div>
            </div>
        `;
        
        return indicator;
    }

    // Goal management methods
    editGoal(goalId) {
        // For now, just show a toast - full edit functionality can be added later
        Utils.showToast('Goal editing coming soon!', 'warning');
    }

    deleteGoal(goalId) {
        this.showModal(
            'Delete Goal',
            'Are you sure you want to delete this goal? This action cannot be undone.',
            () => {
                const result = dataManager.deleteGoal(goalId);
                if (result.success) {
                    Utils.showToast('Goal deleted successfully', 'success');
                    this.updateGoals();
                    this.updateDashboard();
                } else {
                    Utils.showToast(result.error, 'error');
                }
            }
        );
    }

    setCurrentDateTime() {
        const dateInput = document.getElementById('measurementDate');
        if (dateInput) {
            dateInput.value = Utils.getCurrentDateTime();
        }
    }

    async saveNotificationSettings() {
        try {
            const form = document.getElementById('notificationForm');
            const formData = Utils.getFormData(form);
            
            const notificationSettings = {
                enabled: form.querySelector('#notificationsEnabled').checked,
                dayOfWeek: parseInt(formData.dayOfWeek),
                time: formData.time,
                frequency: 'weekly'
            };

            // If notifications are being enabled for the first time
            if (notificationSettings.enabled && (!dataManager.settings.notifications.enabled || dataManager.settings.notifications.permission !== 'granted')) {
                const result = await Utils.enableNotifications(dataManager.settings);
                
                if (!result.success) {
                    Utils.showToast(result.error, 'error');
                    // Reset checkbox if permission failed
                    form.querySelector('#notificationsEnabled').checked = false;
                    return;
                }
                
                Utils.showToast(result.message, 'success');
            }

            // Update settings
            dataManager.settings.notifications = {
                ...dataManager.settings.notifications,
                ...notificationSettings
            };

            const saveResult = dataManager.saveSettings(dataManager.settings);
            
            if (saveResult.success) {
                Utils.showToast('Notification settings saved!', 'success');
                this.updateNotificationStatus();
            } else {
                Utils.showToast('Failed to save settings: ' + saveResult.error, 'error');
            }
            
        } catch (error) {
            Utils.handleError(error, 'Saving notification settings');
        }
    }

    updateNotificationStatus() {
        const statusElement = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');
        
        if (!statusElement || !statusText || !dataManager.settings) return;

        const notifications = dataManager.settings.notifications;
        
        if (!notifications.enabled) {
            statusElement.className = 'notification-status';
            statusText.textContent = 'Notifications are disabled';
        } else if (notifications.permission === 'granted') {
            statusElement.className = 'notification-status granted';
            const dayName = Utils.getDayName(notifications.dayOfWeek);
            const timeFormatted = Utils.formatTime12Hour(notifications.time);
            statusText.textContent = `✅ Reminders set for ${dayName}s at ${timeFormatted}`;
        } else if (notifications.permission === 'denied') {
            statusElement.className = 'notification-status denied';
            statusText.textContent = '❌ Notifications are blocked. Please enable them in your browser settings.';
        } else {
            statusElement.className = 'notification-status';
            statusText.textContent = 'Notifications need permission';
        }
    }

    loadNotificationSettings() {
        const form = document.getElementById('notificationForm');
        if (!form || !dataManager.settings) return;

        const notifications = dataManager.settings.notifications;
        
        form.querySelector('#notificationsEnabled').checked = notifications.enabled;
        form.querySelector('#reminderDay').value = notifications.dayOfWeek;
        form.querySelector('#reminderTime').value = notifications.time;
        
        // Show/hide settings based on enabled state
        const notificationSettings = document.getElementById('notificationSettings');
        if (notificationSettings) {
            notificationSettings.style.display = notifications.enabled ? 'block' : 'none';
        }
        
        this.updateNotificationStatus();
    }

    sendTestNotification() {
        const success = Utils.showTestNotification();
        
        if (success) {
            Utils.showToast('Test notification sent!', 'success');
        } else {
            Utils.showToast('Please enable notifications first', 'warning');
        }
    }

    async initServiceWorker() {
        try {
            const result = await Utils.registerServiceWorker();
            if (result.success) {
                console.log('✅ Service worker registered successfully - PWA features enabled');
                this.updatePWAStatus(true);
                return true;
            } else {
                console.warn('⚠️  Service worker registration failed:', result.error);
                this.updatePWAStatus(false, result.error);
                
                // Show user-friendly message if on file:// protocol
                if (location.protocol === 'file:') {
                    this.showPWASetupMessage();
                }
                return false;
            }
        } catch (error) {
            console.error('Service worker initialization error:', error);
            this.updatePWAStatus(false, error.message);
            return false;
        }
    }

    updatePWAStatus(isWorking, errorMessage = '') {
        const statusElement = document.getElementById('swStatus');
        const pwaStatusElement = document.getElementById('pwaStatus');
        
        if (!statusElement || !pwaStatusElement) return;
        
        if (isWorking) {
            statusElement.textContent = '✅ PWA features active (offline, notifications)';
            pwaStatusElement.className = 'pwa-status working';
        } else {
            if (location.protocol === 'file:') {
                statusElement.textContent = '⚠️ PWA features require a web server';
                pwaStatusElement.className = 'pwa-status warning';
            } else {
                statusElement.textContent = `❌ PWA features unavailable: ${errorMessage}`;
                pwaStatusElement.className = 'pwa-status warning';
            }
        }
    }

    showPWASetupMessage() {
        // Only show this message once per session
        if (sessionStorage.getItem('pwa-setup-shown')) return;
        
        setTimeout(() => {
            Utils.showToast(
                '💡 For offline features, serve this app from a web server. See SERVER_SETUP.md for instructions.',
                'warning',
                8000
            );
            sessionStorage.setItem('pwa-setup-shown', 'true');
        }, 3000); // Show after app loads
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