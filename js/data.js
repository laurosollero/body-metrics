// Data Models and localStorage Management

const DATA_KEYS = {
    PROFILE: 'bodymetrics_profile',
    MEASUREMENTS: 'bodymetrics_measurements',
    SETTINGS: 'bodymetrics_settings'
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

// Data Manager Class
class DataManager {
    constructor() {
        this.profile = null;
        this.measurements = [];
        this.settings = null;
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

    // Data Import/Export
    exportData() {
        try {
            const exportData = {
                profile: this.profile,
                measurements: this.measurements,
                settings: this.settings,
                exportDate: new Date().toISOString(),
                version: '1.0'
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
                settings: this.settings
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
            
            this.profile = new UserProfile();
            this.measurements = [];
            this.settings = new AppSettings();
            
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