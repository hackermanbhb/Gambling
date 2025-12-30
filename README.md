# Casino Session Dashboard

A powerful, privacy-focused web application for tracking casino gambling sessions. Monitor your performance, analyze trends, and make data-driven decisions about your casino visits—all stored locally in your browser.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![No Backend Required](https://img.shields.io/badge/Backend-Not%20Required-blue)
![Local Storage](https://img.shields.io/badge/Storage-100%25%20Local-orange)

## ✨ Features

### 📊 Comprehensive Analytics
- **Real-time Statistics**: Track total buy-ins, cash-outs, net profit/loss, and win rate
- **Performance Metrics**: Monitor ROI, biggest wins/losses, and current streaks
- **Interactive Charts**: Visualize your performance with Chart.js-powered graphs
  - Cumulative P/L view for long-term trends
  - Daily P/L view for session-by-session analysis
  - Color-coded segments (green for wins, red for losses)

### 🎨 Customizable Interface
- **4 Color Themes**: Midnight, Graphite, Neon, and Sand
- **Dark/Light Mode**: Automatic system preference detection with manual override
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 💾 Data Management
- **Local-Only Storage**: All data stays in your browser—no servers, no tracking
- **Import/Export**: Backup and restore your data with JSON files
- **CRUD Operations**: Create, read, update, and delete sessions with ease
- **Data Validation**: Built-in checks prevent invalid entries

### 🔒 Privacy & Security
- **100% Client-Side**: No data ever leaves your device
- **No Analytics**: Zero tracking or telemetry
- **No Registration**: Start using immediately—no accounts required

### ♿ Accessibility
- ARIA labels and roles for screen readers
- Keyboard navigation support
- High contrast color schemes
- Toast notifications for user feedback

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or build process required!

### Running the App

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/yourusername/casino-session-dashboard.git
   cd casino-session-dashboard
   ```

2. **Open `index.html`** in your browser:
   - Double-click the file, or
   - Right-click → Open with → Your browser, or
   - Drag and drop into an open browser window

3. **Start tracking** your casino sessions immediately!

### Hosting Options

**Option 1: Local File System**
- Just open `index.html` directly—no server needed

**Option 2: Simple HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

**Option 3: Deploy to GitHub Pages**
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Select your branch and root directory
4. Access at `https://yourusername.github.io/casino-session-dashboard`

## 📖 Usage Guide

### Adding a Session

1. Navigate to the **"Add Session"** panel on the left
2. Enter three required fields:
   - **Date**: When you visited the casino
   - **Buy-in**: Total amount you brought/exchanged
   - **Cash-out**: Total amount you left with
3. Click **"Add Session"** 
4. Profit/Loss is automatically calculated!

### Editing a Session

1. Find the session in the **"Session History"** table
2. Click the **✏️ Edit** button
3. Update any fields in the modal dialog
4. Click **"Save Changes"**

### Deleting a Session

1. Locate the session in the history table
2. Click the **🗑️ Delete** button
3. Confirm the deletion in the popup

### Exporting Your Data

1. Click the **⬇ Download** icon in the top-right toolbar
2. Your data will download as a JSON file named `casino-sessions-YYYY-MM-DD.json`
3. Store this backup somewhere safe!

### Importing Data

1. Click the **⬆ Upload** icon in the toolbar
2. Select a previously exported JSON file
3. Your sessions will be imported and merged

### Clearing All Data

1. Click the **✕ Clear** button (red icon) in the toolbar
2. A confirmation modal will appear
3. Click **"Yes, Clear All Data"** to proceed
4. ⚠️ **Warning**: This action cannot be undone—export first!

## 📁 File Structure

```
casino-session-dashboard/
├── index.html              # Main HTML structure
├── styles.css              # Complete styling (themes, responsive)
├── app.js                  # Core application logic
├── casino-sessions-import.json  # Sample data for testing
└── README.md               # This file
```

### Key Files

- **`index.html`**: Semantic HTML5 structure with accessibility features
- **`styles.css`**: CSS custom properties for theming, responsive grid layouts
- **`app.js`**: Vanilla JavaScript with localStorage persistence and Chart.js integration
- **`casino-sessions-import.json`**: Example dataset for quick testing

## 🛠️ Technical Details

### Built With
- **Pure HTML5**: Semantic markup, ARIA accessibility
- **Vanilla CSS3**: No frameworks, custom properties for theming
- **Vanilla JavaScript**: No dependencies except Chart.js
- **Chart.js v4.4.1**: Interactive, responsive charts
- **localStorage API**: Client-side persistence

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Data Format

Sessions are stored as JSON in localStorage:

```json
{
  "id": "unique-session-id",
  "date": "2025-12-30",
  "buyIn": 500.00,
  "cashOut": 750.00
}
```

The app automatically calculates:
- `profitLoss` = cashOut - buyIn = 250.00

## 📊 Statistics Explained

### Summary Metrics
- **Total Buy-in**: Sum of all money brought to casinos
- **Total Cash-out**: Sum of all money taken home
- **Net P/L**: Total profit or loss (Cash-out - Buy-in)
- **Win Rate**: Percentage of sessions with positive profit

### Performance Stats
- **Biggest Win**: Highest profit from a single session
- **Biggest Loss**: Largest loss from a single session
- **Current Streak**: Consecutive wins or losses (ending with most recent session)
- **ROI**: Return on Investment (Net P/L ÷ Total Buy-in × 100%)

### Chart Views
- **Cumulative**: Running total of profit/loss over time
- **Daily**: Individual session profit/loss per date

## 🎯 Use Cases

- **Personal Bankroll Management**: Track spending and stay within limits
- **Performance Analysis**: Identify winning patterns and problem areas
- **Tax Records**: Export data for gambling tax reporting
- **Goal Setting**: Monitor progress toward profit/loss targets
- **Responsible Gambling**: Maintain awareness of gambling habits

## 🔐 Privacy & Data

### What's Stored
- Session dates, buy-ins, and cash-outs
- Theme and mode preferences
- Chart view preference

### What's NOT Stored
- No casino names or locations
- No game types or strategies
- No personal identifying information
- No server-side data—everything is local

### Data Retention
- Data persists until you clear browser data or use the "Clear All" button
- Exporting creates a local backup you control

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- Additional chart types (pie charts, bar graphs)
- Casino/location tags for sessions
- Game type tracking (slots, table games, poker)
- Filters and date range selectors
- Budget and session limit warnings
- Multi-currency support
- PDF export for reports

### Development Setup

1. Clone the repository
2. Make your changes
3. Test in multiple browsers
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This tool is for **personal tracking and educational purposes only**. 

- Gambling involves risk of financial loss
- This app does not provide gambling advice
- Always gamble responsibly and within your means
- Seek help if gambling becomes problematic: [National Council on Problem Gambling](https://www.ncpgambling.org/) (1-800-522-4700)

## 🐛 Known Issues

None at this time. Please report issues via GitHub Issues.

## 📧 Contact

For questions, suggestions, or bug reports, please open an issue on GitHub.

---

**Remember**: The house always has an edge. Track responsibly, gamble wisely, and know when to walk away. 🎰