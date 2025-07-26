// Utility Functions

class Utils {
    // Date formatting utilities
    static formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }
        
        const options = {
            short: { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            },
            long: { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            time: { 
                hour: '2-digit', 
                minute: '2-digit' 
            },
            iso: null // Will return ISO string
        };
        
        if (format === 'iso') {
            return d.toISOString();
        }
        
        if (format === 'relative') {
            return this.getRelativeTime(d);
        }
        
        return d.toLocaleDateString('en-US', options[format] || options.short);
    }

    static getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days} days ago`;
            if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
            if (days < 365) return `${Math.floor(days / 30)} months ago`;
            return `${Math.floor(days / 365)} years ago`;
        }
        
        if (hours > 0) {
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        }
        
        if (minutes > 0) {
            return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
        }
        
        return 'Just now';
    }

    static getCurrentDateTime() {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localTime = new Date(now.getTime() - (offset * 60 * 1000));
        return localTime.toISOString().slice(0, 16);
    }

    // Number formatting and validation
    static formatNumber(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) {
            return '--';
        }
        return parseFloat(value).toFixed(decimals);
    }

    static parseNumber(value, defaultValue = null) {
        if (value === '' || value === null || value === undefined) {
            return defaultValue;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    static validateNumber(value, min = null, max = null) {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Must be a valid number' };
        }
        
        if (min !== null && num < min) {
            return { valid: false, error: `Must be at least ${min}` };
        }
        
        if (max !== null && num > max) {
            return { valid: false, error: `Must be no more than ${max}` };
        }
        
        return { valid: true, value: num };
    }

    // BMI calculation
    static calculateBMI(weight, height) {
        if (!weight || !height || weight <= 0 || height <= 0) {
            return null;
        }
        
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    }

    static getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    // Trend calculation helpers
    static calculateTrend(measurements, metric) {
        if (!measurements || measurements.length < 2) {
            return { trend: 'insufficient_data', change: 0, percentage: 0 };
        }
        
        // Sort by date (newest first)
        const sorted = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get latest and previous values
        const latest = sorted[0][metric];
        const previous = sorted[1][metric];
        
        if (latest === null || previous === null) {
            return { trend: 'insufficient_data', change: 0, percentage: 0 };
        }
        
        const change = latest - previous;
        const percentage = (change / previous) * 100;
        
        let trend = 'stable';
        if (Math.abs(percentage) > 1) { // More than 1% change
            trend = change > 0 ? 'increasing' : 'decreasing';
        }
        
        return { trend, change, percentage };
    }

    static calculateMovingAverage(measurements, metric, period = 7) {
        if (!measurements || measurements.length === 0) {
            return [];
        }
        
        const sorted = [...measurements]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .filter(m => m[metric] !== null);
        
        const result = [];
        
        for (let i = 0; i < sorted.length; i++) {
            const start = Math.max(0, i - period + 1);
            const subset = sorted.slice(start, i + 1);
            const average = subset.reduce((sum, m) => sum + m[metric], 0) / subset.length;
            
            result.push({
                date: sorted[i].date,
                value: average
            });
        }
        
        return result;
    }

    // DOM utilities
    static createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    static toggleClass(element, className, condition = null) {
        if (condition === null) {
            element.classList.toggle(className);
        } else {
            element.classList.toggle(className, condition);
        }
    }

    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    static throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }

    // Form utilities
    static getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (value !== '') {
                data[key] = value;
            }
        }
        
        return data;
    }

    static setFormData(form, data) {
        for (const [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = Boolean(value);
                } else {
                    input.value = value || '';
                }
            }
        }
    }

    static clearForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }

    // Toast notifications
    static showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        const toastContent = document.getElementById('toastContent');
        
        if (!toast || !toastContent) return;
        
        toastContent.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Achievement notification queue
    static achievementQueue = [];
    static isShowingAchievement = false;

    // Achievement notifications with queue system
    static showAchievementNotification(achievement, duration = 4000) {
        // Add to queue if currently showing an achievement
        if (this.isShowingAchievement) {
            this.achievementQueue.push(achievement);
            return;
        }
        
        this.displayAchievement(achievement, duration);
    }

    static displayAchievement(achievement, duration = 4000) {
        const notification = document.getElementById('achievementNotification');
        const icon = document.getElementById('achievementIcon');
        const name = document.getElementById('achievementName');
        const description = document.getElementById('achievementDescription');
        const points = document.getElementById('achievementPoints');
        
        if (!notification || !icon || !name || !description || !points) {
            console.warn('Achievement notification elements not found');
            return;
        }
        
        this.isShowingAchievement = true;
        
        // Set achievement data
        icon.textContent = achievement.icon;
        name.textContent = achievement.title;
        description.textContent = achievement.description;
        points.textContent = `+${achievement.points} points`;
        
        // Set rarity class
        notification.className = `achievement-notification ${achievement.rarity} show`;
        
        // Play achievement sound (if available)
        this.playAchievementSound(achievement.rarity);
        
        // Hide after duration
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Process queue after hiding
            setTimeout(() => {
                this.isShowingAchievement = false;
                
                // Show next achievement in queue
                if (this.achievementQueue.length > 0) {
                    const nextAchievement = this.achievementQueue.shift();
                    setTimeout(() => {
                        this.showAchievementNotification(nextAchievement);
                    }, 500); // Small delay between achievements
                }
            }, 500);
        }, duration);
        
        // Hide rarity class after animation
        setTimeout(() => {
            if (!this.isShowingAchievement) {
                notification.className = 'achievement-notification';
            }
        }, duration + 1000);
    }

    static playAchievementSound(rarity) {
        // Placeholder for achievement sound effects
        // In a real implementation, you might play different sounds based on rarity
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different frequencies for different rarities
            const frequencies = {
                common: 440,
                rare: 523,
                epic: 659,
                legendary: 880
            };
            
            oscillator.frequency.setValueAtTime(frequencies[rarity] || 440, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Silently fail if Web Audio API is not supported
            console.debug('Achievement sound not available:', error);
        }
    }

    // Local storage utilities
    static getStorageSize() {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Chart data helpers
    static prepareChartData(measurements, metric, period = 30) {
        if (!measurements || measurements.length === 0) {
            return { labels: [], data: [] };
        }
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);
        
        const filtered = measurements
            .filter(m => new Date(m.date) >= cutoffDate && m[metric] !== null)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const labels = filtered.map(m => this.formatDate(m.date, 'short'));
        const data = filtered.map(m => m[metric]);
        
        return { labels, data };
    }

    // Progress calculation helpers
    static calculatePercentageChange(oldValue, newValue) {
        if (oldValue === null || newValue === null || oldValue === undefined || newValue === undefined || oldValue === 0) {
            return { absolute: 0, percentage: 0, hasChange: false };
        }
        
        const absolute = newValue - oldValue;
        const percentage = (absolute / oldValue) * 100;
        
        return {
            absolute,
            percentage,
            hasChange: Math.abs(percentage) > 0.1
        };
    }

    static getProgressDirection(metric, change) {
        // Determine if a change is positive or negative based on the metric
        const improvementMetrics = ['musclePercent', 'waterPercent']; // Higher is better
        const reductionMetrics = ['weight', 'bodyFatPercent']; // Lower is better
        
        if (reductionMetrics.includes(metric)) {
            return change < 0 ? 'positive' : 'negative';
        } else if (improvementMetrics.includes(metric)) {
            return change > 0 ? 'positive' : 'negative';
        }
        
        return 'neutral';
    }

    static formatProgressChange(change, unit, showPercentage = true) {
        if (!change.hasChange) {
            return 'No change';
        }
        
        const arrow = change.absolute > 0 ? '↑' : '↓';
        const formattedAbsolute = this.formatNumber(Math.abs(change.absolute), 1);
        const formattedPercentage = this.formatNumber(Math.abs(change.percentage), 1);
        
        let text = `${arrow} ${formattedAbsolute}${unit}`;
        
        if (showPercentage && Math.abs(change.percentage) >= 0.5) {
            text += ` (${formattedPercentage}%)`;
        }
        
        return text;
    }

    static getChartColors() {
        return {
            primary: '#2563eb',
            secondary: '#10b981',
            accent: '#f59e0b',
            error: '#ef4444',
            success: '#22c55e',
            warning: '#f59e0b',
            background: 'rgba(37, 99, 235, 0.1)',
            border: 'rgba(37, 99, 235, 0.5)'
        };
    }

    // Validation helpers
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) && date <= new Date();
    }

    // Device detection
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    static isAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    static supportsTouchEvents() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Performance helpers
    static requestIdleCallback(callback) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }

    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Accessibility helpers
    static announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    static focusFirstInteractiveElement(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    // SVG Icon utilities
    static createIcon(iconName, size = 24, className = '') {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 80 80');
        svg.setAttribute('fill', 'currentColor');
        
        if (className) {
            svg.setAttribute('class', className);
        }
        
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icon-${iconName}`);
        svg.appendChild(use);
        
        return svg;
    }

    static replaceIconsInElement(element) {
        // Find all elements with data-icon attribute and replace with SVG
        const iconElements = element.querySelectorAll('[data-icon]');
        
        iconElements.forEach(el => {
            const iconName = el.getAttribute('data-icon');
            const size = el.getAttribute('data-size') || 24;
            const className = el.getAttribute('class') || '';
            
            const svg = this.createIcon(iconName, size, className);
            
            // Copy any additional attributes
            Array.from(el.attributes).forEach(attr => {
                if (!['data-icon', 'data-size', 'class'].includes(attr.name)) {
                    svg.setAttribute(attr.name, attr.value);
                }
            });
            
            el.parentNode.replaceChild(svg, el);
        });
    }

    static getIconHTML(iconName, size = 24, className = '') {
        return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="currentColor" class="${className}">
            <use href="#icon-${iconName}"></use>
        </svg>`;
    }

    // Error handling
    static handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let userMessage = 'An unexpected error occurred.';
        
        if (error.message) {
            userMessage = error.message;
        }
        
        this.showToast(userMessage, 'error', 5000);
        
        // You could also send to error reporting service here
        return { error: userMessage };
    }

    // Notification Manager
    static async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return { success: false, error: 'Notifications not supported' };
        }

        if (Notification.permission === 'granted') {
            return { success: true, permission: 'granted' };
        }

        if (Notification.permission === 'denied') {
            return { success: false, error: 'Notifications are blocked', permission: 'denied' };
        }

        try {
            const permission = await Notification.requestPermission();
            return { 
                success: permission === 'granted', 
                permission,
                error: permission === 'denied' ? 'Notifications were denied' : null
            };
        } catch (error) {
            return { success: false, error: 'Failed to request permission', permission: 'default' };
        }
    }

    static scheduleWeeklyReminder(dayOfWeek, time) {
        // Calculate next occurrence of the specified day and time
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        
        const nextReminder = new Date();
        nextReminder.setHours(hours, minutes, 0, 0);
        
        // Calculate days until target day
        const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
        
        // If it's the same day but past the time, schedule for next week
        if (daysUntilTarget === 0 && now.getTime() > nextReminder.getTime()) {
            nextReminder.setDate(nextReminder.getDate() + 7);
        } else {
            nextReminder.setDate(nextReminder.getDate() + daysUntilTarget);
        }

        return nextReminder;
    }

    static async registerServiceWorker() {
        // Check if we're on a supported protocol
        if (location.protocol === 'file:') {
            console.warn('Service Worker not supported on file:// protocol. Please serve the app through a web server.');
            return { success: false, error: 'Service Workers require HTTP/HTTPS. Please serve this app from a web server.' };
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return { success: false, error: 'Service Worker not supported by this browser' };
        }

        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registered:', registration);
            
            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            
            return { success: true, registration };
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            
            // Provide user-friendly error messages
            let userMessage = error.message;
            if (error.message.includes('protocol')) {
                userMessage = 'Please serve this app from a web server (not file://) to enable offline features.';
            } else if (error.message.includes('scope')) {
                userMessage = 'Service Worker scope error. Please check your server configuration.';
            }
            
            return { success: false, error: userMessage };
        }
    }

    static getDayName(dayNumber) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNumber] || 'Unknown';
    }

    static formatTime12Hour(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    static async enableNotifications(settings) {
        // Request permission first
        const permissionResult = await this.requestNotificationPermission();
        
        if (!permissionResult.success) {
            return permissionResult;
        }

        // Register service worker
        const swResult = await this.registerServiceWorker();
        
        if (!swResult.success) {
            return { success: false, error: 'Failed to register service worker: ' + swResult.error };
        }

        // Store settings
        settings.notifications.permission = permissionResult.permission;
        settings.notifications.enabled = true;

        return { success: true, message: 'Notifications enabled successfully!' };
    }

    static showTestNotification() {
        if (Notification.permission === 'granted') {
            new Notification('BodyMetrics Test', {
                body: 'Notifications are working! You\'ll receive weekly reminders to track your progress. 📊',
                icon: './icons/icon-192x192.png',
                badge: './icons/icon-96x96.png',
                tag: 'test-notification'
            });
            return true;
        }
        return false;
    }
}

// Export for global use
window.Utils = Utils;