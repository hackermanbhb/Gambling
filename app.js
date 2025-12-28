// Session data stored in localStorage
let sessions = [];
let chart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSessions();
    renderAll();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('sessionForm').addEventListener('submit', handleAddSession);
    document.getElementById('editForm').addEventListener('submit', handleEditSession);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
}

// Load sessions from localStorage
function loadSessions() {
    const stored = localStorage.getItem('casinoSessions');
    if (stored) {
        try {
            sessions = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading sessions:', e);
            sessions = [];
        }
    }
}

// Save sessions to localStorage
function saveSessions() {
    localStorage.setItem('casinoSessions', JSON.stringify(sessions));
}

// Handle form submission
function handleAddSession(e) {
    e.preventDefault();
    
    const date = document.getElementById('sessionDate').value;
    const buyIn = parseFloat(document.getElementById('buyIn').value);
    const cashOut = parseFloat(document.getElementById('cashOut').value);
    
    // Validation
    if (!date) {
        alert('Please enter a date');
        return;
    }
    
    if (isNaN(buyIn) || buyIn < 0) {
        alert('Please enter a valid buy-in amount (0 or greater)');
        return;
    }
    
    if (isNaN(cashOut) || cashOut < 0) {
        alert('Please enter a valid cash-out amount (0 or greater)');
        return;
    }
    
    // Create new session
    const session = {
        id: Date.now(),
        date: date,
        buyIn: buyIn,
        cashOut: cashOut,
        profitLoss: cashOut - buyIn
    };
    
    sessions.push(session);
    saveSessions();
    renderAll();
    
    // Reset form
    document.getElementById('sessionForm').reset();
}

// Delete a session
function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessions = sessions.filter(s => s.id !== id);
        saveSessions();
        renderAll();
    }
}

// Open edit modal
function openEditModal(id) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    document.getElementById('editSessionId').value = session.id;
    document.getElementById('editDate').value = session.date;
    document.getElementById('editBuyIn').value = session.buyIn;
    document.getElementById('editCashOut').value = session.cashOut;
    
    document.getElementById('editModal').classList.add('active');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editForm').reset();
}

// Handle edit form submission
function handleEditSession(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editSessionId').value);
    const date = document.getElementById('editDate').value;
    const buyIn = parseFloat(document.getElementById('editBuyIn').value);
    const cashOut = parseFloat(document.getElementById('editCashOut').value);
    
    // Validation
    if (!date) {
        alert('Please enter a date');
        return;
    }
    
    if (isNaN(buyIn) || buyIn < 0) {
        alert('Please enter a valid buy-in amount (0 or greater)');
        return;
    }
    
    if (isNaN(cashOut) || cashOut < 0) {
        alert('Please enter a valid cash-out amount (0 or greater)');
        return;
    }
    
    // Update session
    const sessionIndex = sessions.findIndex(s => s.id === id);
    if (sessionIndex !== -1) {
        sessions[sessionIndex] = {
            id: id,
            date: date,
            buyIn: buyIn,
            cashOut: cashOut,
            profitLoss: cashOut - buyIn
        };
        
        saveSessions();
        renderAll();
        closeEditModal();
    }
}

// Render everything
function renderAll() {
    renderSummaryCards();
    renderTable();
    renderChart();
}

// Render summary cards
function renderSummaryCards() {
    const totalBuyIn = sessions.reduce((sum, s) => sum + s.buyIn, 0);
    const totalCashOut = sessions.reduce((sum, s) => sum + s.cashOut, 0);
    const netProfitLoss = totalCashOut - totalBuyIn;
    const profitableSessions = sessions.filter(s => s.profitLoss > 0).length;
    const winRate = sessions.length > 0 ? (profitableSessions / sessions.length) * 100 : 0;
    
    document.getElementById('totalBuyIn').textContent = formatCurrency(totalBuyIn);
    document.getElementById('totalCashOut').textContent = formatCurrency(totalCashOut);
    
    const netElement = document.getElementById('netProfitLoss');
    netElement.textContent = formatCurrency(netProfitLoss);
    netElement.className = 'card-value';
    if (netProfitLoss > 0) {
        netElement.classList.add('positive');
    } else if (netProfitLoss < 0) {
        netElement.classList.add('negative');
    }
    
    const winRateElement = document.getElementById('winRate');
    winRateElement.textContent = winRate.toFixed(1) + '%';
    winRateElement.className = 'card-value';
    if (winRate >= 50) {
        winRateElement.classList.add('positive');
    } else if (winRate > 0) {
        winRateElement.classList.add('negative');
    }
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    
    if (sessions.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No sessions recorded yet. Add your first session above!</td></tr>';
        return;
    }
    
    // Sort by date (ascending)
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    tbody.innerHTML = sortedSessions.map(session => `
        <tr>
            <td>${formatDate(session.date)}</td>
            <td>${formatCurrency(session.buyIn)}</td>
            <td>${formatCurrency(session.cashOut)}</td>
            <td class="${session.profitLoss >= 0 ? 'profit' : 'loss'}">
                ${formatCurrency(session.profitLoss)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="openEditModal(${session.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteSession(${session.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render chart
function renderChart() {
    const canvas = document.getElementById('performanceChart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chart) {
        chart.destroy();
    }
    
    if (sessions.length === 0) {
        return;
    }
    
    // Sort by date and calculate cumulative profit
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let cumulative = 0;
    const chartData = sortedSessions.map(session => {
        cumulative += session.profitLoss;
        return {
            date: session.date,
            cumulative: cumulative,
            profitLoss: session.profitLoss
        };
    });
    
    const labels = chartData.map(d => formatDate(d.date));
    const data = chartData.map(d => d.cumulative);
    const pointColors = chartData.map(d => d.profitLoss >= 0 ? '#00d4aa' : '#ff4757');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Profit/Loss',
                data: data,
                borderColor: '#4a9eff',
                backgroundColor: 'rgba(74, 158, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#e1e4f0',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.95)',
                    titleColor: '#e1e4f0',
                    bodyColor: '#e1e4f0',
                    borderColor: '#2a2f4a',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Cumulative: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(42, 47, 74, 0.5)'
                    },
                    ticks: {
                        color: '#8b92b0',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(42, 47, 74, 0.5)'
                    },
                    ticks: {
                        color: '#8b92b0',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Export data to JSON
function exportData() {
    if (sessions.length === 0) {
        alert('No data to export');
        return;
    }
    
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `casino-sessions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import data from JSON
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const imported = JSON.parse(event.target.result);
            
            if (!Array.isArray(imported)) {
                alert('Invalid file format');
                return;
            }
            
            // Validate data structure
            const isValid = imported.every(s => 
                s.date && 
                typeof s.buyIn === 'number' && 
                typeof s.cashOut === 'number'
            );
            
            if (!isValid) {
                alert('Invalid data structure in file');
                return;
            }
            
            if (confirm(`Import ${imported.length} sessions? This will replace your current data.`)) {
                sessions = imported;
                saveSessions();
                renderAll();
                alert('Data imported successfully!');
            }
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
}

// Clear all data
function clearAllData() {
    if (sessions.length === 0) {
        alert('No data to clear');
        return;
    }
    
    if (confirm('Are you sure you want to delete ALL sessions? This cannot be undone!')) {
        sessions = [];
        saveSessions();
        renderAll();
        alert('All data cleared');
    }
}

// Format currency
function formatCurrency(amount) {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    if (amount < 0) {
        return '-$' + formatted;
    }
    return '$' + formatted;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}