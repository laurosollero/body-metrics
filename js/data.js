// Data Models and localStorage Management

const DATA_KEYS = {
    PROFILE: 'bodymetrics_profile',
    MEASUREMENTS: 'bodymetrics_measurements',
    SETTINGS: 'bodymetrics_settings',
    GOALS: 'bodymetrics_goals',
    ACHIEVEMENTS: 'bodymetrics_achievements'
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

class Achievement {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.type = data.type || ''; // 'milestone', 'goal_completed', 'streak', 'improvement'
        this.category = data.category || ''; // 'weight', 'measurements', 'goals', 'usage'
        this.title = data.title || '';
        this.description = data.description || '';
        this.icon = data.icon || '🏆';
        this.value = data.value || null; // The achievement threshold/value
        this.currentValue = data.currentValue || 0; // Current progress toward achievement
        this.isUnlocked = data.isUnlocked || false;
        this.unlockedAt = data.unlockedAt || null;
        this.progress = data.progress || 0; // 0-100
        this.rarity = data.rarity || 'common'; // 'common', 'rare', 'epic', 'legendary'
        this.points = data.points || 10; // Achievement points
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    generateId() {
        return `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    unlock() {
        if (!this.isUnlocked) {
            this.isUnlocked = true;
            this.unlockedAt = new Date().toISOString();
            this.progress = 100;
            this.currentValue = this.value;
            return true; // Achievement was newly unlocked
        }
        return false; // Already unlocked
    }

    updateProgress(currentValue) {
        this.currentValue = currentValue;
        
        if (this.value && this.value > 0) {
            this.progress = Math.min(100, (currentValue / this.value) * 100);
            
            if (this.progress >= 100 && !this.isUnlocked) {
                return this.unlock();
            }
        }
        
        return false;
    }

    getRarityColor() {
        const colors = {
            common: '#64748b',
            rare: '#3b82f6',
            epic: '#8b5cf6',
            legendary: '#f59e0b'
        };
        return colors[this.rarity] || colors.common;
    }

    getRarityName() {
        return this.rarity.charAt(0).toUpperCase() + this.rarity.slice(1);
    }
}

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
    // Measurement milestones
    first_measurement: {
        type: 'milestone',
        category: 'measurements',
        title: 'First Steps',
        description: 'Added your first measurement',
        icon: '🌟',
        value: 1,
        rarity: 'common',
        points: 10
    },
    
    measurement_streak_7: {
        type: 'streak',
        category: 'measurements',
        title: 'Week Warrior',
        description: 'Tracked measurements for 7 days straight',
        icon: '🔥',
        value: 7,
        rarity: 'rare',
        points: 25
    },
    
    measurement_streak_30: {
        type: 'streak',
        category: 'measurements',
        title: 'Monthly Master',
        description: 'Tracked measurements for 30 days straight',
        icon: '⚡',
        value: 30,
        rarity: 'epic',
        points: 50
    },
    
    measurement_count_50: {
        type: 'milestone',
        category: 'measurements',
        title: 'Dedicated Tracker',
        description: 'Recorded 50 measurements',
        icon: '📊',
        value: 50,
        rarity: 'rare',
        points: 30
    },
    
    measurement_count_100: {
        type: 'milestone',
        category: 'measurements',
        title: 'Century Club',
        description: 'Recorded 100 measurements',
        icon: '💯',
        value: 100,
        rarity: 'epic',
        points: 75
    },
    
    // Goal achievements
    first_goal: {
        type: 'milestone',
        category: 'goals',
        title: 'Goal Setter',
        description: 'Set your first health goal',
        icon: '🎯',
        value: 1,
        rarity: 'common',
        points: 15
    },
    
    goal_completed: {
        type: 'goal_completed',
        category: 'goals',
        title: 'Goal Crusher',
        description: 'Completed your first goal',
        icon: '🏆',
        value: 1,
        rarity: 'rare',
        points: 50
    },
    
    goals_completed_5: {
        type: 'goal_completed',
        category: 'goals',
        title: 'Achievement Hunter',
        description: 'Completed 5 goals',
        icon: '🏅',
        value: 5,
        rarity: 'epic',
        points: 100
    },
    
    // Weight loss achievements
    weight_loss_5kg: {
        type: 'improvement',
        category: 'weight',
        title: 'First Five',
        description: 'Lost 5kg from your starting weight',
        icon: '⚖️',
        value: 5,
        rarity: 'rare',
        points: 40
    },
    
    weight_loss_10kg: {
        type: 'improvement',
        category: 'weight',
        title: 'Perfect Ten',
        description: 'Lost 10kg from your starting weight',
        icon: '💪',
        value: 10,
        rarity: 'epic',
        points: 75
    },
    
    body_fat_reduction_5: {
        type: 'improvement',
        category: 'body_fat',
        title: 'Fat Fighter',
        description: 'Reduced body fat by 5 percentage points',
        icon: '📉',
        value: 5,
        rarity: 'rare',
        points: 45
    },
    
    // Consistency achievements
    consistent_weekly: {
        type: 'streak',
        category: 'usage',
        title: 'Weekly Warrior',
        description: 'Used the app consistently for 4 weeks',
        icon: '📅',
        value: 4,
        rarity: 'rare',
        points: 35
    },
    
    early_bird: {
        type: 'milestone',
        category: 'usage',
        title: 'Early Bird',
        description: 'Logged 10 measurements before 9 AM',
        icon: '🌅',
        value: 10,
        rarity: 'rare',
        points: 25
    }
};

// Data Manager Class
class DataManager {
    constructor() {
        this.profile = null;
        this.measurements = [];
        this.settings = null;
        this.goals = [];
        this.achievements = [];
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
            
            // Check for new achievements
            const newAchievements = this.checkAchievements();
            
            return { success: true, measurement, achievements: newAchievements };
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
            
            // Check for new achievements
            const newAchievements = this.checkAchievements();
            
            return { success: true, goal, achievements: newAchievements };
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

    // Achievement Management
    loadAchievements() {
        try {
            const data = localStorage.getItem(DATA_KEYS.ACHIEVEMENTS);
            if (data) {
                const achievements = JSON.parse(data);
                this.achievements = achievements.map(a => new Achievement(a));
            } else {
                this.achievements = [];
                this.initializeAchievements();
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.achievements = [];
            this.initializeAchievements();
        }
        return this.achievements;
    }

    initializeAchievements() {
        // Create achievements from definitions
        for (const [key, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
            const achievement = new Achievement({
                ...definition,
                id: key
            });
            this.achievements.push(achievement);
        }
        this.saveAchievements();
    }

    saveAchievements() {
        try {
            localStorage.setItem(DATA_KEYS.ACHIEVEMENTS, JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }

    checkAchievements() {
        const newlyUnlocked = [];
        
        // Check measurement-based achievements
        this.checkMeasurementAchievements(newlyUnlocked);
        
        // Check goal-based achievements
        this.checkGoalAchievements(newlyUnlocked);
        
        // Check improvement-based achievements
        this.checkImprovementAchievements(newlyUnlocked);
        
        // Check usage-based achievements
        this.checkUsageAchievements(newlyUnlocked);
        
        if (newlyUnlocked.length > 0) {
            this.saveAchievements();
        }
        
        return newlyUnlocked;
    }

    checkMeasurementAchievements(newlyUnlocked) {
        const measurementCount = this.measurements.length;
        
        // First measurement
        const firstMeasurement = this.achievements.find(a => a.id === 'first_measurement');
        if (firstMeasurement && measurementCount >= 1) {
            if (firstMeasurement.updateProgress(measurementCount)) {
                newlyUnlocked.push(firstMeasurement);
            }
        }
        
        // Measurement count milestones
        const countMilestones = ['measurement_count_50', 'measurement_count_100'];
        countMilestones.forEach(milestoneId => {
            const achievement = this.achievements.find(a => a.id === milestoneId);
            if (achievement) {
                if (achievement.updateProgress(measurementCount)) {
                    newlyUnlocked.push(achievement);
                }
            }
        });
        
        // Measurement streaks
        const currentStreak = this.calculateMeasurementStreak();
        const streakAchievements = ['measurement_streak_7', 'measurement_streak_30'];
        streakAchievements.forEach(streakId => {
            const achievement = this.achievements.find(a => a.id === streakId);
            if (achievement) {
                if (achievement.updateProgress(currentStreak)) {
                    newlyUnlocked.push(achievement);
                }
            }
        });
    }

    checkGoalAchievements(newlyUnlocked) {
        const goalCount = this.goals.length;
        const completedGoalsCount = this.getCompletedGoals().length;
        
        // First goal
        const firstGoal = this.achievements.find(a => a.id === 'first_goal');
        if (firstGoal && goalCount >= 1) {
            if (firstGoal.updateProgress(goalCount)) {
                newlyUnlocked.push(firstGoal);
            }
        }
        
        // Goal completion achievements
        const goalCompleted = this.achievements.find(a => a.id === 'goal_completed');
        if (goalCompleted && completedGoalsCount >= 1) {
            if (goalCompleted.updateProgress(completedGoalsCount)) {
                newlyUnlocked.push(goalCompleted);
            }
        }
        
        const goals5 = this.achievements.find(a => a.id === 'goals_completed_5');
        if (goals5 && completedGoalsCount >= 5) {
            if (goals5.updateProgress(completedGoalsCount)) {
                newlyUnlocked.push(goals5);
            }
        }
    }

    checkImprovementAchievements(newlyUnlocked) {
        if (this.measurements.length < 2) return;
        
        const firstMeasurement = this.measurements[this.measurements.length - 1]; // Oldest
        const latestMeasurement = this.measurements[0]; // Newest
        
        // Weight loss achievements
        if (firstMeasurement.weight && latestMeasurement.weight) {
            const weightLoss = firstMeasurement.weight - latestMeasurement.weight;
            
            const weight5kg = this.achievements.find(a => a.id === 'weight_loss_5kg');
            if (weight5kg && weightLoss >= 5) {
                if (weight5kg.updateProgress(weightLoss)) {
                    newlyUnlocked.push(weight5kg);
                }
            }
            
            const weight10kg = this.achievements.find(a => a.id === 'weight_loss_10kg');
            if (weight10kg && weightLoss >= 10) {
                if (weight10kg.updateProgress(weightLoss)) {
                    newlyUnlocked.push(weight10kg);
                }
            }
        }
        
        // Body fat reduction
        if (firstMeasurement.bodyFatPercent && latestMeasurement.bodyFatPercent) {
            const bodyFatReduction = firstMeasurement.bodyFatPercent - latestMeasurement.bodyFatPercent;
            
            const bodyFat5 = this.achievements.find(a => a.id === 'body_fat_reduction_5');
            if (bodyFat5 && bodyFatReduction >= 5) {
                if (bodyFat5.updateProgress(bodyFatReduction)) {
                    newlyUnlocked.push(bodyFat5);
                }
            }
        }
    }

    checkUsageAchievements(newlyUnlocked) {
        // Early bird achievement
        const morningMeasurements = this.measurements.filter(m => {
            const hour = new Date(m.date).getHours();
            return hour < 9;
        }).length;
        
        const earlyBird = this.achievements.find(a => a.id === 'early_bird');
        if (earlyBird && morningMeasurements >= 10) {
            if (earlyBird.updateProgress(morningMeasurements)) {
                newlyUnlocked.push(earlyBird);
            }
        }
    }

    calculateMeasurementStreak() {
        if (this.measurements.length === 0) return 0;
        
        const sortedMeasurements = [...this.measurements]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let streak = 1;
        let currentDate = new Date(sortedMeasurements[0].date);
        
        for (let i = 1; i < sortedMeasurements.length; i++) {
            const measurementDate = new Date(sortedMeasurements[i].date);
            const daysDiff = Math.floor((currentDate - measurementDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                streak++;
                currentDate = measurementDate;
            } else if (daysDiff > 1) {
                break;
            }
        }
        
        return streak;
    }

    // Achievement queries
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.isUnlocked);
    }

    getLockedAchievements() {
        return this.achievements.filter(a => !a.isUnlocked);
    }

    getAchievementProgress() {
        const unlocked = this.getUnlockedAchievements().length;
        const total = this.achievements.length;
        const totalPoints = this.getUnlockedAchievements().reduce((sum, a) => sum + a.points, 0);
        
        return {
            unlocked,
            total,
            percentage: total > 0 ? (unlocked / total) * 100 : 0,
            totalPoints
        };
    }

    getRecentAchievements(limit = 5) {
        return this.getUnlockedAchievements()
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
            .slice(0, limit);
    }

    // Data Import/Export
    exportData() {
        try {
            const exportData = {
                profile: this.profile,
                measurements: this.measurements,
                settings: this.settings,
                goals: this.goals,
                achievements: this.achievements,
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
                goals: this.goals,
                achievements: this.achievements
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
                
                // Import achievements
                if (importData.achievements && Array.isArray(importData.achievements)) {
                    this.achievements = [];
                    for (const achievementData of importData.achievements) {
                        const achievement = new Achievement(achievementData);
                        this.achievements.push(achievement);
                    }
                    this.saveAchievements();
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