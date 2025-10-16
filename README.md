# BodyMetrics - Personal Health Tracker

A lightweight, mobile-first body composition tracking application built with vanilla JavaScript for manual entry of data from the Decathlon S500 scale.

## Features

- 📊 **Dashboard** - Quick overview of current stats and recent measurements
- ➕ **Measurement Entry** - Easy form to add new body composition data
- 📈 **Trend Charts** - Visualize your progress over time (30/90/365 days)
- 💊 **Medication Tracking** *(optional)* - Toggle in Profile to log doses alongside measurements
- 👤 **Profile Management** - Store personal information and preferences
- 💾 **Data Management** - Export/import data with full privacy control
- 📱 **Mobile-First** - Optimized for mobile devices with touch-friendly interface
- 🔒 **Privacy-First** - All data stored locally, no backend required

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or server required

### Installation

1. Clone or download this repository
2. Open `index.html` in a web browser
3. That's it! The app runs entirely in your browser

### First Time Setup

1. Open the app and navigate to the Profile tab
2. Enter your personal information (age, height, gender, activity level)
3. Start adding measurements using the "Add Entry" tab
4. View your progress in the Charts tab

## Usage

### Adding Measurements

1. Navigate to the **Add Entry** tab
2. The current date/time is automatically filled
3. Enter your weight (required) and other metrics from your scale
4. Add optional notes if needed
5. Click "Save Measurement" or "Save & Add Another"

### Viewing Progress

1. **Dashboard** shows your latest stats and recent measurements
2. **Charts** tab displays trend graphs for different time periods
3. Use the period selector to view 30, 90, or 365-day trends

### Tracking Medication (Optional)

1. Open the **Profile** tab and enable **"I want to track medication doses"**
2. A **Medication** tab appears in the bottom navigation
3. Use the form to log dose, date/time, and optional notes
4. Review, export, or delete entries from the history list

### Data Management

- **Export**: Download your data as a JSON file for backup (includes medication events when enabled)
- **Import**: Restore data from a previously exported file
- **Clear**: Remove all data (with confirmation prompt)

## Technical Details

### Browser Compatibility

- Modern browsers with ES6+ support
- iOS Safari (iPhone/iPad)
- Chrome Mobile (Android)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

### Data Storage

- All data stored in browser's localStorage
- No external servers or cloud storage
- Approximately 5MB storage limit
- Data persists between browser sessions

### Privacy

- **No data collection** - everything stays on your device
- **No internet required** - works completely offline
- **No account needed** - just open and use
- **Full data control** - export, import, or delete anytime

## File Structure

```
body-metrics/
├── index.html          # Main application file
├── styles/
│   ├── main.css        # Core application styles
│   └── mobile.css      # Mobile-specific optimizations
├── js/
│   ├── app.js          # Main application logic
│   ├── data.js         # Data models and localStorage
│   ├── charts.js       # Chart.js integration
│   └── utils.js        # Utility functions
├── assets/
│   └── icons/          # App icons (future)
└── README.md           # This file
```

## Supported Measurements

- **Weight** (kg) - Required
- **Body Fat Percentage** (%) - Optional
- **Water Percentage** (%) - Optional  
- **Muscle Percentage** (%) - Optional
- **Bone Mass** (kg) - Optional
- **Notes** - Optional text field

## Charts & Analytics

- **Weight Trend** - Line chart showing weight changes over time
- **Body Composition** - Multi-line chart for fat/muscle/water percentages
- **Trend Lines** - Automatic trend calculation for data series
- **Period Selection** - View last 30, 90, or 365 days
- **Moving Averages** - Smooth out daily fluctuations

## Troubleshooting

### App Not Loading
- Ensure JavaScript is enabled in your browser
- Try opening in a different browser
- Check browser console for error messages

### Data Not Saving
- Check that localStorage is enabled
- Verify you have storage space available
- Try clearing other website data if storage is full

### Charts Not Displaying
- Ensure Chart.js library is loading (requires internet connection on first load)
- Add some measurements first - charts need data to display
- Try refreshing the page

### Mobile Issues
- Use browser's "Add to Home Screen" for app-like experience
- Ensure touch events are working properly
- Try landscape mode if layout seems cramped

## Development

Built with:
- **HTML5** - Semantic markup and modern APIs
- **CSS3** - Custom properties, grid, flexbox
- **Vanilla JavaScript** - ES6+ features, no frameworks
- **Chart.js** - Responsive charting library
- **localStorage** - Client-side data persistence

## License

This project is open source and available under the MIT License.

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## Version History

- **v1.0** - Initial release with core functionality
  - Dashboard with current stats
  - Measurement entry form
  - Basic trend charts
  - Data export/import
  - Mobile-optimized interface

## Future Enhancements

- PWA capabilities with offline support
- Photo progress tracking
- Goal setting and achievement tracking
- Additional chart types and analytics
- Scale integration via Bluetooth
- Health app integration (Apple Health, Google Fit)
