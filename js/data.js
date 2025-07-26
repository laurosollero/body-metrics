// Data Models and localStorage Management

const DATA_KEYS = {
    PROFILE: 'bodymetrics_profile',
    MEASUREMENTS: 'bodymetrics_measurements',
    SETTINGS: 'bodymetrics_settings',
    GOALS: 'bodymetrics_goals'
};

// Data Models
class UserProfile {
    constructor(data = {}) {
        this.id = data.id || 'user_profile';
        this.age = data.age || null;
        this.height = data.height || null; // cm
        this.gender = data.gender || '';
        this.activityLevel = data.activityLevel || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    validate() {
        const errors = [];
        
        if (this.age !== null && (this.age < 1 || this.age > 120)) {
            errors.push('Age must be between 1 and 120');
        }
        
        if (this.height !== null && (this.height < 50 || this.height > 250)) {
            errors.push('Height must be between 50 and 250 cm');
        }
        
        if (this.gender && !['male', 'female', 'other'].includes(this.gender)) {
            errors.push('Invalid gender selection');
        }
        
        if (this.activityLevel && !['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(this.activityLevel)) {
            errors.push('Invalid activity level selection');
        }
        
        return errors;
    }

    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
        return this;
    }
}

class MeasurementEntry {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.date = data.date || new Date().toISOString();
        this.weight = data.weight || null; // kg
        this.bodyFatPercent = data.bodyFatPercent || null;
        this.waterPercent = data.waterPercent || null;
        this.musclePercent = data.musclePercent || null;
        this.boneMass = data.boneMass || null; // kg
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    generateId() {
        return `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validate() {
        const errors = [];
        
        if (!this.weight || this.weight <= 0 || this.weight > 300) {
            errors.push('Weight is required and must be between 0 and 300 kg');
        }
        
        if (this.bodyFatPercent !== null && (this.bodyFatPercent < 0 || this.bodyFatPercent > 100)) {
            errors.push('Body fat percentage must be between 0 and 100');
        }
        
        if (this.waterPercent !== null && (this.waterPercent < 0 || this.waterPercent > 100)) {
            errors.push('Water percentage must be between 0 and 100');
        }
        
        if (this.musclePercent !== null && (this.musclePercent < 0 || this.musclePercent > 100)) {
            errors.push('Muscle percentage must be between 0 and 100');
        }
        
        if (this.boneMass !== null && (this.boneMass < 0 || this.boneMass > 10)) {
            errors.push('Bone mass must be between 0 and 10 kg');
        }
        
        if (!this.date || isNaN(new Date(this.date).getTime())) {
            errors.push('Valid date is required');
        }
        
        return errors;
    }
}

class AppSettings {
    constructor(data = {}) {
        this.theme = data.theme || 'light';
        this.defaultView = data.defaultView || 'dashboard';
        this.chartPeriod = data.chartPeriod || 30;
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    validate() {
        const errors = [];
        
        if (!['light', 'dark'].includes(this.theme)) {
            errors.push('Invalid theme selection');
        }
        
        if (!['dashboard', 'entry', 'charts', 'profile'].includes(this.defaultView)) {
            errors.push('Invalid default view selection');
        }
        
        if (![30, 90, 365].includes(this.chartPeriod)) {
            errors.push('Invalid chart period selection');
        }
        
        return errors;
    }
}

class Goal {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.type = data.type || ''; // 'weight', 'bodyFat', 'muscle', 'water'
        this.targetValue = data.targetValue || null;
        this.currentValue = data.currentValue || null;
        this.targetDate = data.targetDate || null;
        this.startDate = data.startDate || new Date().toISOString();
        this.startValue = data.startValue || null;
        this.status = data.status || 'active'; // 'active', 'completed', 'paused', 'cancelled'
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validate() {
        const errors = [];
        
        if (!['weight', 'bodyFat', 'muscle', 'water'].includes(this.type)) {
            errors.push('Invalid goal type');
        }
        
        if (!this.targetValue || this.targetValue <= 0) {
            errors.push('Target value is required and must be positive');
        }
        
        if (this.type === 'weight' && (this.targetValue < 0.1 || this.targetValue > 300)) {
            errors.push('Weight goal must be between 0.1 and 300 kg');
        }
        
        if (['bodyFat', 'muscle', 'water'].includes(this.type) && (this.targetValue < 0 || this.targetValue > 100)) {
            errors.push('Percentage goals must be between 0 and 100');
        }
        
        if (this.targetDate && !Utils.validateDate(this.targetDate)) {
            errors.push('Invalid target date');
        }
        
        if (this.targetDate && new Date(this.targetDate) <= new Date()) {
            errors.push('Target date must be in the future');
        }
        
        return errors;
    }

    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
        return this;
    }

    calculateProgress() {
        if (!this.startValue || !this.currentValue || !this.targetValue) {
            return { percentage: 0, isOnTrack: false, daysRemaining: null };
        }

        const totalChange = this.targetValue - this.startValue;
        const currentChange = this.currentValue - this.startValue;
        const percentage = Math.abs(totalChange) > 0 ? (currentChange / totalChange) * 100 : 0;

        let daysRemaining = null;
        let isOnTrack = false;

        if (this.targetDate) {
            const today = new Date();
            const target = new Date(this.targetDate);
            const start = new Date(this.startDate);
            
            daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining > 0) {
                const totalDays = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
                const daysPassed = totalDays - daysRemaining;
                const expectedProgress = daysPassed > 0 ? (daysPassed / totalDays) * 100 : 0;
                
                // Consider on track if within 10% of expected progress
                isOnTrack = Math.abs(percentage - expectedProgress) <= 10;
            }
        }

        return {
            percentage: Math.max(0, Math.min(100, percentage)),
            isOnTrack,
            daysRemaining,
            isCompleted: percentage >= 100,
            remainingValue: this.targetValue - this.currentValue
        };
    }

    getStatusText() {
        const progress = this.calculateProgress();
        
        if (progress.isCompleted) return 'Goal Achieved! 🎉';
        if (this.status === 'paused') return 'Paused';
        if (this.status === 'cancelled') return 'Cancelled';
        
        if (progress.daysRemaining !== null) {
            if (progress.daysRemaining <= 0) return 'Overdue';
            if (progress.daysRemaining <= 7) return `${progress.daysRemaining} days left`;
            if (progress.daysRemaining <= 30) return `${Math.ceil(progress.daysRemaining / 7)} weeks left`;
            return `${Math.ceil(progress.daysRemaining / 30)} months left`;
        }
        
        return 'In Progress';
    }
}

// Data Manager Class
class DataManager {
    constructor() {
        this.profile = null;
        this.measurements = [];
        this.settings = null;
        this.goals = [];
        this.loadAllData();
    }

    // Profile Management
    loadProfile() {
        try {
            const data = localStorage.getItem(DATA_KEYS.PROFILE);
            if (data) {
                this.profile = new UserProfile(JSON.parse(data));
            } else {
                this.profile = new UserProfile();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.profile = new UserProfile();
        }
        return this.profile;
    }

    saveProfile(profileData) {
        try {
            const profile = new UserProfile(profileData);
            const errors = profile.validate();
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }
            
            this.profile = profile;
            localStorage.setItem(DATA_KEYS.PROFILE, JSON.stringify(profile));
            return { success: true, profile };
        } catch (error) {
            console.error('Error saving profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Measurements Management
    loadMeasurements() {
        try {
            const data = localStorage.getItem(DATA_KEYS.MEASUREMENTS);
            if (data) {
                const measurements = JSON.parse(data);
                this.measurements = measurements.map(m => new MeasurementEntry(m));
            } else {
                this.measurements = [];
            }
        } catch (error) {
            console.error('Error loading measurements:', error);
            this.measurements = [];
        }
        return this.measurements;
    }

    saveMeasurement(measurementData) {
        try {
            const measurement = new MeasurementEntry(measurementData);
            const errors = measurement.validate();
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }
            
            // Check for duplicate timestamps (within 1 minute)
            const existingMeasurement = this.measurements.find(m => {
                const timeDiff = Math.abs(new Date(m.date) - new Date(measurement.date));
                return timeDiff < 60000; // 1 minute
            });
            
            if (existingMeasurement) {
                throw new Error('A measurement already exists within 1 minute of this timestamp');
            }
            
            this.measurements.push(measurement);
            this.measurements.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            localStorage.setItem(DATA_KEYS.MEASUREMENTS, JSON.stringify(this.measurements));
            
            // Update goal progress with new measurement
            this.updateGoalProgress();
            
            return { success: true, measurement };
        } catch (error) {
            console.error('Error saving measurement:', error);
            return { success: false, error: error.message };
        }
    }

    deleteMeasurement(measurementId) {
        try {
            const index = this.measurements.findIndex(m => m.id === measurementId);
            if (index === -1) {
                throw new Error('Measurement not found');
            }
            
            this.measurements.splice(index, 1);
            localStorage.setItem(DATA_KEYS.MEASUREMENTS, JSON.stringify(this.measurements));
            return { success: true };
        } catch (error) {
            console.error('Error deleting measurement:', error);
            return { success: false, error: error.message };
        }
    }

    // Settings Management
    loadSettings() {
        try {
            const data = localStorage.getItem(DATA_KEYS.SETTINGS);
            if (data) {
                this.settings = new AppSettings(JSON.parse(data));
            } else {
                this.settings = new AppSettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = new AppSettings();
        }
        return this.settings;
    }

    saveSettings(settingsData) {
        try {
            const settings = new AppSettings(settingsData);
            const errors = settings.validate();
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }
            
            this.settings = settings;
            localStorage.setItem(DATA_KEYS.SETTINGS, JSON.stringify(settings));
            return { success: true, settings };
        } catch (error) {
            console.error('Error saving settings:', error);
            return { success: false, error: error.message };
        }
    }

    // Goals Management
    loadGoals() {
        try {
            const data = localStorage.getItem(DATA_KEYS.GOALS);
            if (data) {
                const goals = JSON.parse(data);
                this.goals = goals.map(g => new Goal(g));
            } else {
                this.goals = [];
            }
        } catch (error) {
            console.error('Error loading goals:', error);
            this.goals = [];
        }
        return this.goals;
    }

    saveGoal(goalData) {
        try {
            const goal = new Goal(goalData);
            const errors = goal.validate();
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            // Set start value from current measurement if not provided
            if (!goal.startValue) {
                const latest = this.getLatestMeasurement();
                if (latest) {
                    switch (goal.type) {
                        case 'weight':
                            goal.startValue = latest.weight;
                            break;
                        case 'bodyFat':
                            goal.startValue = latest.bodyFatPercent;
                            break;
                        case 'muscle':
                            goal.startValue = latest.musclePercent;
                            break;
                        case 'water':
                            goal.startValue = latest.waterPercent;
                            break;
                    }
                }
            }

            // Check for existing active goal of same type
            const existingGoal = this.goals.find(g => g.type === goal.type && g.status === 'active');
            if (existingGoal) {
                throw new Error(`You already have an active ${goal.type} goal. Complete or cancel it first.`);
            }
            
            this.goals.push(goal);
            localStorage.setItem(DATA_KEYS.GOALS, JSON.stringify(this.goals));
            return { success: true, goal };
        } catch (error) {
            console.error('Error saving goal:', error);
            return { success: false, error: error.message };
        }
    }

    updateGoal(goalId, updateData) {
        try {
            const goal = this.goals.find(g => g.id === goalId);
            if (!goal) {
                throw new Error('Goal not found');
            }

            goal.update(updateData);
            const errors = goal.validate();
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            localStorage.setItem(DATA_KEYS.GOALS, JSON.stringify(this.goals));
            return { success: true, goal };
        } catch (error) {
            console.error('Error updating goal:', error);
            return { success: false, error: error.message };
        }
    }

    deleteGoal(goalId) {
        try {
            const index = this.goals.findIndex(g => g.id === goalId);
            if (index === -1) {
                throw new Error('Goal not found');
            }
            
            this.goals.splice(index, 1);
            localStorage.setItem(DATA_KEYS.GOALS, JSON.stringify(this.goals));
            return { success: true };
        } catch (error) {
            console.error('Error deleting goal:', error);
            return { success: false, error: error.message };
        }
    }

    updateGoalProgress() {
        const latest = this.getLatestMeasurement();
        if (!latest) return;

        let updated = false;
        
        this.goals.forEach(goal => {
            if (goal.status !== 'active') return;

            let currentValue = null;
            switch (goal.type) {
                case 'weight':
                    currentValue = latest.weight;
                    break;
                case 'bodyFat':
                    currentValue = latest.bodyFatPercent;
                    break;
                case 'muscle':
                    currentValue = latest.musclePercent;
                    break;
                case 'water':
                    currentValue = latest.waterPercent;
                    break;
            }

            if (currentValue !== null && currentValue !== goal.currentValue) {
                goal.currentValue = currentValue;
                goal.updatedAt = new Date().toISOString();
                
                // Check if goal is completed
                const progress = goal.calculateProgress();
                if (progress.isCompleted && goal.status === 'active') {
                    goal.status = 'completed';
                }
                
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem(DATA_KEYS.GOALS, JSON.stringify(this.goals));
        }
    }

    // Data Queries
    getRecentMeasurements(limit = 7) {
        return this.measurements.slice(0, limit);
    }

    getMeasurementsInPeriod(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.measurements.filter(m => new Date(m.date) >= cutoffDate);
    }

    getLatestMeasurement() {
        return this.measurements.length > 0 ? this.measurements[0] : null;
    }

    getCurrentStats() {
        const latest = this.getLatestMeasurement();
        if (!latest) {
            return {
                weight: '--',
                bodyFat: '--',
                muscle: '--',
                water: '--'
            };
        }
        
        return {
            weight: latest.weight ? latest.weight.toFixed(1) : '--',
            bodyFat: latest.bodyFatPercent ? latest.bodyFatPercent.toFixed(1) : '--',
            muscle: latest.musclePercent ? latest.musclePercent.toFixed(1) : '--',
            water: latest.waterPercent ? latest.waterPercent.toFixed(1) : '--'
        };
    }

    // Goal Queries
    getActiveGoals() {
        return this.goals.filter(g => g.status === 'active');
    }

    getCompletedGoals() {
        return this.goals.filter(g => g.status === 'completed');
    }

    getGoalByType(type) {
        return this.goals.find(g => g.type === type && g.status === 'active');
    }

    getGoalProgress(type) {
        const goal = this.getGoalByType(type);
        if (!goal) return null;

        return goal.calculateProgress();
    }

    getAllGoalsProgress() {
        const activeGoals = this.getActiveGoals();
        return activeGoals.map(goal => ({
            id: goal.id,
            type: goal.type,
            targetValue: goal.targetValue,
            progress: goal.calculateProgress(),
            statusText: goal.getStatusText()
        }));
    }

    // Data Import/Export
    exportData() {
        try {
            const exportData = {
                profile: this.profile,
                measurements: this.measurements,
                settings: this.settings,
                goals: this.goals,
                exportDate: new Date().toISOString(),
                version: '1.1'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `bodymetrics-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            console.error('Error exporting data:', error);
            return { success: false, error: error.message };
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // Validate import data structure
            if (!importData.version || !importData.exportDate) {
                throw new Error('Invalid export file format');
            }
            
            // Backup current data
            const backup = {
                profile: this.profile,
                measurements: this.measurements,
                settings: this.settings,
                goals: this.goals
            };
            
            // Import profile
            if (importData.profile) {
                const result = this.saveProfile(importData.profile);
                if (!result.success) {
                    throw new Error(`Profile import failed: ${result.error}`);
                }
            }
            
            // Import settings
            if (importData.settings) {
                const result = this.saveSettings(importData.settings);
                if (!result.success) {
                    throw new Error(`Settings import failed: ${result.error}`);
                }
            }
            
            // Import measurements
            if (importData.measurements && Array.isArray(importData.measurements)) {
                this.measurements = [];
                let importedCount = 0;
                let skippedCount = 0;
                
                for (const measurementData of importData.measurements) {
                    const result = this.saveMeasurement(measurementData);
                    if (result.success) {
                        importedCount++;
                    } else {
                        skippedCount++;
                        console.warn(`Skipped measurement: ${result.error}`);
                    }
                }
                
                // Import goals
                if (importData.goals && Array.isArray(importData.goals)) {
                    this.goals = [];
                    for (const goalData of importData.goals) {
                        const result = this.saveGoal(goalData);
                        if (!result.success) {
                            console.warn(`Skipped goal: ${result.error}`);
                        }
                    }
                }
                
                return { 
                    success: true, 
                    imported: importedCount, 
                    skipped: skippedCount 
                };
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, error: error.message };
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(DATA_KEYS.PROFILE);
            localStorage.removeItem(DATA_KEYS.MEASUREMENTS);
            localStorage.removeItem(DATA_KEYS.SETTINGS);
            localStorage.removeItem(DATA_KEYS.GOALS);
            
            this.profile = new UserProfile();
            this.measurements = [];
            this.settings = new AppSettings();
            this.goals = [];
            
            return { success: true };
        } catch (error) {
            console.error('Error clearing data:', error);
            return { success: false, error: error.message };
        }
    }

    // Initialize all data
    loadAllData() {
        this.loadProfile();
        this.loadMeasurements();
        this.loadSettings();
        this.loadGoals();
    }

    // Storage quota management
    getStorageInfo() {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            const quota = 5 * 1024 * 1024; // Approximate 5MB quota
            
            return {
                used: used,
                quota: quota,
                percentage: (used / quota) * 100,
                available: quota - used
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
}

// Global data manager instance
const dataManager = new DataManager();

// Export for use in other modules
window.DataManager = DataManager;
window.dataManager = dataManager;