// Authentication credentials - Use config if available, fallback to defaults
const ADMIN_CREDENTIALS = (typeof PRODUCTION_CONFIG !== 'undefined' && PRODUCTION_CONFIG.adminCredentials) 
    ? PRODUCTION_CONFIG.adminCredentials 
    : {
        username: 'Root',
        password: 'RP@2025'
    };

// Session management
let isAuthenticated = false;
let sessionTimeout = null;
let lastActivity = Date.now();

// Intern data - 13 interns in alphabetical order (starting with zero points)
const interns = [
    { name: "Amrutha Pemmasani", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Ankita Chouksey", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Charan Kumar Rayaprolu", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Dishant Modi", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Ishan Mehta", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Khushi Digarse", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Mrudula Jethe Bhanushali", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Nirusha Kandela", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Nirmit Pradip Patel", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Rachna Patel", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Tanmayee Arigala", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Varun Muriki", points: 0, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Zeel Patel", points: 0, badges: [], headshot: null, designation: "Software Development Intern" }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data if available
    loadSavedData();
    
    // Use actual intern data (starting with zero points)
    const currentData = interns;
    
    // Sort interns by points (descending)
    const sortedInterns = [...currentData].sort((a, b) => b.points - a.points);
    
    // Update stats
    updateStats(sortedInterns);
    
    // Update podium
    updatePodium(sortedInterns);
    
    // Update leaderboard
    updateLeaderboard(sortedInterns);
    
    // Update intern cards
    updateInternCards(sortedInterns);
    
    // Initialize admin panel
    initializeAdminPanel();
    
    // Initialize authentication
    initializeAuthentication();
    
    // Add animations
    addAnimations();
});

function loadSavedData() {
    try {
        const savedData = localStorage.getItem('rewardData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.interns && Array.isArray(data.interns)) {
                // Update interns with saved data
                data.interns.forEach(savedIntern => {
                    const existingIntern = interns.find(i => i.name === savedIntern.name);
                    if (existingIntern) {
                        existingIntern.points = savedIntern.points || 0;
                        existingIntern.badges = savedIntern.badges || [];
                        existingIntern.headshot = savedIntern.headshot || null;
                        existingIntern.designation = savedIntern.designation || "Software Development Intern";
                    }
                });
            }
        }
    } catch (error) {
        // Silently handle missing or corrupted data
    }
}

function updateStats(interns) {
    const totalPoints = interns.reduce((sum, intern) => sum + intern.points, 0);
    const topPerformer = interns[0];
    
    // Animate total points counter
    animateCounter('total-points', totalPoints);
    
    // Update top performer (show "Tie" if multiple people have same points)
    if (totalPoints === 0) {
        document.getElementById('top-performer').textContent = "Starting Soon!";
    } else {
        const topScore = topPerformer.points;
        const topPerformers = interns.filter(intern => intern.points === topScore);
        if (topPerformers.length > 1) {
            document.getElementById('top-performer').textContent = "Tie!";
        } else {
            document.getElementById('top-performer').textContent = topPerformer.name.split(' ')[0];
        }
    }
    
    // Update admin stats if admin panel is open
    if (document.getElementById('admin-panel') && !document.getElementById('admin-panel').classList.contains('hidden')) {
        updateAdminStats(interns);
    }
}

function updatePodium(interns) {
    const first = interns[0];
    const second = interns[1];
    const third = interns[2];
    
    // Show "TBD" for podium when everyone has zero points
    if (first.points === 0) {
        document.getElementById('first-place').textContent = "TBD";
        document.getElementById('first-points').textContent = "0 pts";
        
        document.getElementById('second-place').textContent = "TBD";
        document.getElementById('second-points').textContent = "0 pts";
        
        document.getElementById('third-place').textContent = "TBD";
        document.getElementById('third-points').textContent = "0 pts";
    } else {
        // First place always shows if they have points
        document.getElementById('first-place').textContent = first.name;
        document.getElementById('first-points').textContent = `${first.points} pts`;
        
        // Second place shows only if they have points
        if (second && second.points > 0) {
            document.getElementById('second-place').textContent = second.name;
            document.getElementById('second-points').textContent = `${second.points} pts`;
        } else {
            document.getElementById('second-place').textContent = "TBD";
            document.getElementById('second-points').textContent = "0 pts";
        }
        
        // Third place shows only if they have points
        if (third && third.points > 0) {
            document.getElementById('third-place').textContent = third.name;
            document.getElementById('third-points').textContent = `${third.points} pts`;
        } else {
            document.getElementById('third-place').textContent = "TBD";
            document.getElementById('third-points').textContent = "0 pts";
        }
    }
}

function updateLeaderboard(interns) {
    const leaderboardContainer = document.getElementById('leaderboard-entries');
    leaderboardContainer.innerHTML = '';
    
    interns.forEach((intern, index) => {
        const entry = document.createElement('div');
        entry.className = 'leaderboard-entry';
        entry.style.animationDelay = `${index * 0.1}s`;
        
        const rank = index + 1;
        const rankClass = rank <= 3 ? 'top-three' : '';
        
        entry.innerHTML = `
            <div class="rank-number ${rankClass}">${rank}</div>
            <div class="intern-info">
                <div class="intern-name">${intern.name}</div>
                <div class="intern-designation">${intern.designation || 'Intern'}</div>
            </div>
            <div class="points-display">${intern.points}</div>
            <div class="badges-display">${generateBadgesHTML(intern.badges)}</div>
        `;
        
        leaderboardContainer.appendChild(entry);
    });
}

function updateInternCards(interns) {
    const cardsContainer = document.getElementById('intern-cards-grid');
    cardsContainer.innerHTML = '';
    
    // Create a map of points to rank for proper ranking
    const pointsToRank = {};
    const uniquePoints = [...new Set(interns.map(intern => intern.points))].sort((a, b) => b - a);
    
    uniquePoints.forEach((points, index) => {
        pointsToRank[points] = index + 1;
    });
    
    interns.forEach((intern, index) => {
        const card = document.createElement('div');
        card.className = 'intern-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Use actual rank based on points, not array index
        const rank = pointsToRank[intern.points];
        const initials = intern.name.split(' ').map(n => n[0]).join('');
        
        // Only show rank if intern has points
        const rankDisplay = intern.points > 0 ? `<span class="rank">Rank #${rank}</span>` : `<span class="rank no-rank">No Rank Yet</span>`;
        
        // Create avatar with headshot or initials fallback
        const avatarContent = intern.headshot 
            ? `<img src="${intern.headshot}" alt="${intern.name}" class="headshot-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <span class="avatar-initials" style="display: none;">${initials}</span>`
            : `<span class="avatar-initials">${initials}</span>`;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-avatar">${avatarContent}</div>
                <div class="card-info">
                    <h3>${intern.name}</h3>
                    <p class="designation">${intern.designation || 'Intern'}</p>
                    ${rankDisplay}
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <h4>${intern.points}</h4>
                    <p>Total Points</p>
                </div>
                <div class="stat-item">
                    <h4>${intern.badges.length}</h4>
                    <p>Achievements</p>
                </div>
            </div>
            <div class="card-badges">
                ${generateBadgesHTML(intern.badges, true)}
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
}

function generateBadgesHTML(badges, isCard = false) {
    if (badges.length === 0) {
        return isCard ? '<span class="card-badge" style="background: #e2e8f0; color: #718096;">No badges yet</span>' : '';
    }
    
    return badges.map(badge => {
        const badgeClass = isCard ? 'card-badge' : 'badge';
        const icon = getBadgeIcon(badge);
        return `<span class="${badgeClass} ${badge}">${icon}</span>`;
    }).join('');
}

function getBadgeIcon(badge) {
    const icons = {
        gold: '🏆',
        silver: '🥈',
        bronze: '🥉',
        blue: '💡'
    };
    return icons[badge] || '🏅';
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function addAnimations() {
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.stat-card, .leaderboard-container, .intern-card, .badge-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add some interactive features
function addInteractiveFeatures() {
    // Add hover effects for cards
    const cards = document.querySelectorAll('.intern-card, .stat-card, .badge-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects for leaderboard entries
    const leaderboardEntries = document.querySelectorAll('.leaderboard-entry');
    leaderboardEntries.forEach(entry => {
        entry.addEventListener('click', function() {
            // Remove active class from all entries
            leaderboardEntries.forEach(e => e.classList.remove('active'));
            // Add active class to clicked entry
            this.classList.add('active');
        });
    });
}

// Initialize interactive features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addInteractiveFeatures, 1000);
});

// Function to add points to an intern (for when you start awarding points)
function addPoints(internName, points, badge = null) {
    const intern = interns.find(i => i.name === internName);
    if (intern) {
        intern.points += points;
        if (badge && !intern.badges.includes(badge)) {
            intern.badges.push(badge);
        }
        
        // Re-sort and update display
        const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
        updateStats(sortedInterns);
        updatePodium(sortedInterns);
        updateLeaderboard(sortedInterns);
        updateInternCards(sortedInterns);
        
        // Save data automatically
        saveDataSilently();
    }
}

// Function to reset all points (if needed)
function resetAllPoints() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    // Confirm action
    if (!confirm('Are you sure you want to reset all points? This action cannot be undone.')) {
        return;
    }
    
    interns.forEach(intern => {
        intern.points = 0;
        intern.badges = [];
    });
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    updateStats(sortedInterns);
    updatePodium(sortedInterns);
    updateLeaderboard(sortedInterns);
    updateInternCards(sortedInterns);
    updateAdminStats(sortedInterns);
    
    showMessage('All points have been reset!', 'success');
}

// Authentication Functions
function initializeAuthentication() {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        if (authData.authenticated && authData.timestamp) {
            const now = Date.now();
            const sessionDuration = 5 * 60 * 1000; // 5 minutes
            
            if (now - authData.timestamp < sessionDuration) {
                isAuthenticated = true;
                lastActivity = authData.timestamp;
                startSessionTimeout();
            } else {
                localStorage.removeItem('adminAuth');
            }
        }
    }
    
    // Add event listeners for authentication
    document.getElementById('admin-toggle-btn').addEventListener('click', handleAdminToggle);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('cancel-login').addEventListener('click', closeLoginModal);
    
    // Add logout button event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add activity tracking event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.addEventListener(event, updateLastActivity, true);
    });
    
    // Check for activity timeout every minute
    setInterval(checkActivityTimeout, 60 * 1000);
    
    // Update session timer every second
    setInterval(updateSessionTimer, 1000);
}

function handleAdminToggle() {
    if (isAuthenticated) {
        toggleAdminPanel();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        document.getElementById('username').focus();
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('login-modal');
    loginModal.classList.add('hidden');
    document.getElementById('login-form').reset();
    hideLoginError();
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Debug logging
    console.log('Login attempt:', { username, password });
    console.log('Expected credentials:', ADMIN_CREDENTIALS);
    console.log('Config loaded:', typeof PRODUCTION_CONFIG !== 'undefined');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Successful login
        isAuthenticated = true;
        lastActivity = Date.now();
        
        // Save authentication to localStorage
        localStorage.setItem('adminAuth', JSON.stringify({
            authenticated: true,
            timestamp: lastActivity
        }));
        
        // Start session timeout
        startSessionTimeout();
        
        // Close login modal and open admin panel
        closeLoginModal();
        toggleAdminPanel();
        
        // Show success message
        showMessage('Successfully logged in!', 'success');
    } else {
        // Failed login
        showLoginError();
    }
}

function handleLogout() {
    isAuthenticated = false;
    localStorage.removeItem('adminAuth');
    clearSessionTimeout();
    
    // Close admin panel
    closeAdminPanel();
    
    // Show logout message (but not in admin panel since it's closed)
    showMessage('Successfully logged out!', 'success');
}

function showLoginError() {
    const errorElement = document.getElementById('login-error');
    errorElement.classList.remove('hidden');
    
    // Clear password field
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
    
    // Auto-hide error after 3 seconds
    setTimeout(() => {
        hideLoginError();
    }, 3000);
}

function hideLoginError() {
    const errorElement = document.getElementById('login-error');
    errorElement.classList.add('hidden');
}

function startSessionTimeout() {
    // Clear existing timeout
    clearSessionTimeout();
    
    // Set new timeout (5 minutes)
    sessionTimeout = setTimeout(() => {
        handleLogout();
        showMessage('Session expired due to inactivity. Please login again.', 'error');
    }, 5 * 60 * 1000);
}

function updateLastActivity() {
    lastActivity = Date.now();
    if (isAuthenticated) {
        // Update the stored timestamp
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        if (authData) {
            authData.timestamp = lastActivity;
            localStorage.setItem('adminAuth', JSON.stringify(authData));
        }
        // Restart the timeout
        startSessionTimeout();
    }
}

function checkActivityTimeout() {
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const sessionDuration = 5 * 60 * 1000; // 5 minutes
    
    if (isAuthenticated && timeSinceActivity > sessionDuration) {
        isAuthenticated = false;
        localStorage.removeItem('adminAuth');
        closeAdminPanel();
        showMessage('Session expired due to inactivity. Please login again.', 'error');
    }
}

function updateSessionTimer() {
    if (!isAuthenticated) return;
    
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const sessionDuration = 5 * 60 * 1000; // 5 minutes
    const timeRemaining = sessionDuration - timeSinceActivity;
    
    const timerElement = document.getElementById('session-timer');
    if (timerElement) {
        if (timeRemaining <= 0) {
            timerElement.textContent = 'Expired';
            timerElement.className = 'session-timer danger';
        } else {
            const minutes = Math.floor(timeRemaining / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Change color based on time remaining
            if (timeRemaining <= 60000) { // Last minute
                timerElement.className = 'session-timer danger';
            } else if (timeRemaining <= 120000) { // Last 2 minutes
                timerElement.className = 'session-timer warning';
            } else {
                timerElement.className = 'session-timer';
            }
        }
    }
}

function clearSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
}

// Admin Panel Functions
function initializeAdminPanel() {
    // Populate intern dropdowns
    const internSelect = document.getElementById('intern-select');
    const badgeInternSelect = document.getElementById('badge-intern-select');
    const removeUserSelect = document.getElementById('remove-user-select');
    const designationInternSelect = document.getElementById('designation-intern-select');
    
    internSelect.innerHTML = '<option value="">Choose an intern...</option>';
    badgeInternSelect.innerHTML = '<option value="">Choose an intern...</option>';
    removeUserSelect.innerHTML = '<option value="">Choose an intern to remove...</option>';
    designationInternSelect.innerHTML = '<option value="">Choose an intern...</option>';
    
    interns.forEach(intern => {
        const option1 = document.createElement('option');
        option1.value = intern.name;
        option1.textContent = intern.name;
        internSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = intern.name;
        option2.textContent = intern.name;
        badgeInternSelect.appendChild(option2);
        
        const option3 = document.createElement('option');
        option3.value = intern.name;
        option3.textContent = intern.name;
        removeUserSelect.appendChild(option3);
        
        const option4 = document.createElement('option');
        option4.value = intern.name;
        option4.textContent = intern.name;
        designationInternSelect.appendChild(option4);
    });
    
    // Add event listeners
    document.getElementById('close-admin').addEventListener('click', closeAdminPanel);
    document.getElementById('award-points-btn').addEventListener('click', awardPoints);
    document.getElementById('remove-points-btn').addEventListener('click', removePoints);
    document.getElementById('add-badge-btn').addEventListener('click', addBadge);
    document.getElementById('remove-badge-btn').addEventListener('click', removeBadge);
    document.getElementById('add-user-btn').addEventListener('click', addUser);
    document.getElementById('remove-user-btn').addEventListener('click', removeUser);
    document.getElementById('save-data-btn').addEventListener('click', saveData);
    document.getElementById('reset-all-btn').addEventListener('click', resetAllPoints);
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-btn').addEventListener('click', importData);
    
    // Add file preview functionality
    const headshotInput = document.getElementById('new-user-headshot');
    if (headshotInput) {
        headshotInput.addEventListener('change', handleFilePreview);
    }
    
    // Add bulk upload functionality
    document.getElementById('bulk-upload-btn').addEventListener('click', processBulkUpload);
    document.getElementById('clear-headshots-btn').addEventListener('click', clearAllHeadshots);
    
    // Add designation management functionality
    document.getElementById('update-designation-btn').addEventListener('click', updateDesignation);
    document.getElementById('reset-designation-btn').addEventListener('click', resetDesignation);
    
    // Update admin stats
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    updateAdminStats(sortedInterns);
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.classList.toggle('hidden');
}

function closeAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.classList.add('hidden');
}

function awardPoints() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internName = document.getElementById('intern-select').value;
    const points = parseInt(document.getElementById('points-input').value);
    
    if (!internName || !points || points <= 0) {
        showMessage('Please select an intern and enter positive points!', 'error');
        return;
    }
    
    // Add points using existing function
    addPoints(internName, points, null);
    
    // Clear form
    document.getElementById('intern-select').value = '';
    document.getElementById('points-input').value = '';
    
    // Show success message
    showMessage(`Successfully awarded ${points} points to ${internName}!`, 'success');
}

function removePoints() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internName = document.getElementById('intern-select').value;
    const points = parseInt(document.getElementById('points-input').value);
    
    if (!internName || !points || points <= 0) {
        showMessage('Please select an intern and enter positive points to remove!', 'error');
        return;
    }
    
    // Find the intern
    const intern = interns.find(i => i.name === internName);
    if (!intern) {
        showMessage('Intern not found!', 'error');
        return;
    }
    
    // Check if removing points would result in negative total
    if (intern.points - points < 0) {
        if (!confirm(`This will reduce ${internName}'s points to 0. Continue?`)) {
            return;
        }
        intern.points = 0;
    } else {
        intern.points -= points;
    }
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    updateStats(sortedInterns);
    updatePodium(sortedInterns);
    updateLeaderboard(sortedInterns);
    updateInternCards(sortedInterns);
    updateAdminStats(sortedInterns);
    
    // Clear form
    document.getElementById('intern-select').value = '';
    document.getElementById('points-input').value = '';
    
    // Show success message
    showMessage(`Successfully removed ${points} points from ${internName}!`, 'success');
}

function addBadge() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internName = document.getElementById('badge-intern-select').value;
    const badge = document.getElementById('badge-select').value;
    
    if (!internName || !badge) {
        showMessage('Please select an intern and a badge type!', 'error');
        return;
    }
    
    // Find the intern
    const intern = interns.find(i => i.name === internName);
    if (!intern) {
        showMessage('Intern not found!', 'error');
        return;
    }
    
    // Check if badge already exists
    if (intern.badges.includes(badge)) {
        showMessage(`${internName} already has this badge!`, 'error');
        return;
    }
    
    // Add badge
    intern.badges.push(badge);
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    updateStats(sortedInterns);
    updatePodium(sortedInterns);
    updateLeaderboard(sortedInterns);
    updateInternCards(sortedInterns);
    updateAdminStats(sortedInterns);
    
    // Clear form
    document.getElementById('badge-intern-select').value = '';
    document.getElementById('badge-select').value = '';
    
    // Show success message
    showMessage(`Successfully added badge to ${internName}!`, 'success');
}

function removeBadge() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internName = document.getElementById('badge-intern-select').value;
    const badge = document.getElementById('badge-select').value;
    
    if (!internName || !badge) {
        showMessage('Please select an intern and a badge type!', 'error');
        return;
    }
    
    // Find the intern
    const intern = interns.find(i => i.name === internName);
    if (!intern) {
        showMessage('Intern not found!', 'error');
        return;
    }
    
    // Check if badge exists
    if (!intern.badges.includes(badge)) {
        showMessage(`${internName} doesn't have this badge!`, 'error');
        return;
    }
    
    // Remove badge
    intern.badges = intern.badges.filter(b => b !== badge);
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    updateStats(sortedInterns);
    updatePodium(sortedInterns);
    updateLeaderboard(sortedInterns);
    updateInternCards(sortedInterns);
    updateAdminStats(sortedInterns);
    
    // Clear form
    document.getElementById('badge-intern-select').value = '';
    document.getElementById('badge-select').value = '';
    
    // Show success message
    showMessage(`Successfully removed badge from ${internName}!`, 'success');
}

function addUser() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const newUserName = document.getElementById('new-user-name').value.trim();
    const headshotInput = document.getElementById('new-user-headshot');
    
    if (!newUserName) {
        showMessage('Please enter a name for the new intern!', 'error');
        return;
    }
    
    // Check if user already exists
    const existingUser = interns.find(i => i.name.toLowerCase() === newUserName.toLowerCase());
    if (existingUser) {
        showMessage('An intern with this name already exists!', 'error');
        return;
    }
    
    // Handle headshot upload
    if (headshotInput.files && headshotInput.files[0]) {
        const file = headshotInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const headshotDataUrl = e.target.result;
            
            // Add new intern with headshot
            const newIntern = {
                name: newUserName,
                points: 0,
                badges: [],
                headshot: headshotDataUrl,
                designation: "Software Development Intern"
            };
            
            interns.push(newIntern);
            
            // Sort interns alphabetically
            interns.sort((a, b) => a.name.localeCompare(b.name));
            
            // Re-sort and update display
            const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
            updateStats(sortedInterns);
            updatePodium(sortedInterns);
            updateLeaderboard(sortedInterns);
            updateInternCards(sortedInterns);
            updateAdminStats(sortedInterns);
            
            // Update dropdowns
            updateAdminDropdowns();
            
            // Save data automatically
            saveDataSilently();
            
            // Clear form
            document.getElementById('new-user-name').value = '';
            headshotInput.value = '';
            clearFilePreview();
            
            // Show success message
            showMessage(`Successfully added ${newUserName} to the system!`, 'success');
        };
        
        reader.readAsDataURL(file);
    } else {
        // Add new intern without headshot
        const newIntern = {
            name: newUserName,
            points: 0,
            badges: [],
            headshot: null,
            designation: "Software Development Intern"
        };
        
        interns.push(newIntern);
        
        // Sort interns alphabetically
        interns.sort((a, b) => a.name.localeCompare(b.name));
        
        // Re-sort and update display
        const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
        updateStats(sortedInterns);
        updatePodium(sortedInterns);
        updateLeaderboard(sortedInterns);
        updateInternCards(sortedInterns);
        updateAdminStats(sortedInterns);
        
        // Update dropdowns
        updateAdminDropdowns();
        
        // Save data automatically
        saveDataSilently();
        
        // Clear form
        document.getElementById('new-user-name').value = '';
        
        // Show success message
        showMessage(`Successfully added ${newUserName} to the system!`, 'success');
    }
}

function removeUser() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const userNameToRemove = document.getElementById('remove-user-select').value;
    
    if (!userNameToRemove) {
        showMessage('Please select an intern to remove!', 'error');
        return;
    }
    
    // Confirm removal
    if (!confirm(`Are you sure you want to remove ${userNameToRemove}? This action cannot be undone.`)) {
        return;
    }
    
    // Find and remove the intern
    const internIndex = interns.findIndex(i => i.name === userNameToRemove);
    if (internIndex === -1) {
        showMessage('Intern not found!', 'error');
        return;
    }
    
    // Remove the intern
    interns.splice(internIndex, 1);
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    updateStats(sortedInterns);
    updatePodium(sortedInterns);
    updateLeaderboard(sortedInterns);
    updateInternCards(sortedInterns);
    updateAdminStats(sortedInterns);
    
    // Update dropdowns
    updateAdminDropdowns();
    
    // Clear form
    document.getElementById('remove-user-select').value = '';
    
    // Show success message
    showMessage(`Successfully removed ${userNameToRemove} from the system!`, 'success');
}

function updateAdminDropdowns() {
    // Update all dropdowns with current intern list
    const internSelect = document.getElementById('intern-select');
    const badgeInternSelect = document.getElementById('badge-intern-select');
    const removeUserSelect = document.getElementById('remove-user-select');
    const designationInternSelect = document.getElementById('designation-intern-select');
    
    // Clear existing options (except first option)
    internSelect.innerHTML = '<option value="">Choose an intern...</option>';
    badgeInternSelect.innerHTML = '<option value="">Choose an intern...</option>';
    removeUserSelect.innerHTML = '<option value="">Choose an intern to remove...</option>';
    designationInternSelect.innerHTML = '<option value="">Choose an intern...</option>';
    
    // Add current interns
    interns.forEach(intern => {
        const option1 = document.createElement('option');
        option1.value = intern.name;
        option1.textContent = intern.name;
        internSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = intern.name;
        option2.textContent = intern.name;
        badgeInternSelect.appendChild(option2);
        
        const option3 = document.createElement('option');
        option3.value = intern.name;
        option3.textContent = intern.name;
        removeUserSelect.appendChild(option3);
        
        const option4 = document.createElement('option');
        option4.value = intern.name;
        option4.textContent = intern.name;
        designationInternSelect.appendChild(option4);
    });
}

function saveData() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    try {
        // Save to localStorage
        localStorage.setItem('rewardData', JSON.stringify({
            interns: interns,
            lastSaved: new Date().toISOString(),
            version: '2.1.1'
        }));
        
        showMessage('Data saved successfully!', 'success');
    } catch (error) {
        showMessage('Error saving data!', 'error');
    }
}

function saveDataSilently() {
    // Save data without showing messages (for automatic saves)
    try {
        localStorage.setItem('rewardData', JSON.stringify({
            interns: interns,
            lastSaved: new Date().toISOString(),
            version: '2.1.1'
        }));
    } catch (error) {
        console.error('Error saving data silently:', error);
    }
}

function updateAdminStats(interns) {
    const totalPoints = interns.reduce((sum, intern) => sum + intern.points, 0);
    const topPerformer = interns[0];
    
    document.getElementById('admin-total-points').textContent = totalPoints;
    
    if (totalPoints === 0) {
        document.getElementById('admin-top-performer').textContent = "Starting Soon!";
    } else {
        const topScore = topPerformer.points;
        const topPerformers = interns.filter(intern => intern.points === topScore);
        if (topPerformers.length > 1) {
            document.getElementById('admin-top-performer').textContent = "Tie!";
        } else {
            document.getElementById('admin-top-performer').textContent = topPerformer.name.split(' ')[0];
        }
    }
}

function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    message.style.display = 'block';
    
    // Insert at top of admin content
    const adminContent = document.querySelector('.admin-content');
    adminContent.insertBefore(message, adminContent.firstChild);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function exportData() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const data = {
        interns: interns,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `reward-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Data exported successfully!', 'success');
}

function importData() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.interns && Array.isArray(data.interns)) {
                    // Update interns data
                    data.interns.forEach(importedIntern => {
                        const existingIntern = interns.find(i => i.name === importedIntern.name);
                        if (existingIntern) {
                            existingIntern.points = importedIntern.points || 0;
                            existingIntern.badges = importedIntern.badges || [];
                        }
                    });
                    
                    // Update display
                    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
                    updateStats(sortedInterns);
                    updatePodium(sortedInterns);
                    updateLeaderboard(sortedInterns);
                    updateInternCards(sortedInterns);
                    updateAdminStats(sortedInterns);
                    
                    showMessage('Data imported successfully!', 'success');
                } else {
                    showMessage('Invalid data format!', 'error');
                }
            } catch (error) {
                showMessage('Error importing data!', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// File preview functions
function handleFilePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('new-user-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="preview-text">${file.name}</div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        clearFilePreview();
    }
}

function clearFilePreview() {
    const preview = document.getElementById('new-user-preview');
    if (preview) {
        preview.innerHTML = '';
    }
}

// Bulk upload functions
function processBulkUpload() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const fileInput = document.getElementById('bulk-headshot-upload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showMessage('Please select some image files to upload!', 'error');
        return;
    }
    
    const results = {
        success: [],
        failed: [],
        skipped: []
    };
    
    // Process each file
    let processedCount = 0;
    const totalFiles = files.length;
    
    Array.from(files).forEach(file => {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const normalizedFileName = fileName.replace(/_/g, ' '); // Convert underscores to spaces
        
        // Find matching intern
        const matchingIntern = interns.find(intern => 
            intern.name.toLowerCase() === normalizedFileName.toLowerCase()
        );
        
        if (matchingIntern) {
            // Convert file to data URL
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    matchingIntern.headshot = e.target.result;
                    results.success.push(matchingIntern.name);
                } catch (error) {
                    results.failed.push(fileName + ' - Processing error');
                }
                
                processedCount++;
                if (processedCount === totalFiles) {
                    displayBulkUploadResults(results);
                    updateAllDisplays();
                    saveDataSilently();
                }
            };
            reader.onerror = function() {
                results.failed.push(fileName + ' - File read error');
                processedCount++;
                if (processedCount === totalFiles) {
                    displayBulkUploadResults(results);
                }
            };
            reader.readAsDataURL(file);
        } else {
            results.failed.push(fileName);
            processedCount++;
            
            if (processedCount === totalFiles) {
                displayBulkUploadResults(results);
            }
        }
    });
}

function displayBulkUploadResults(results) {
    const resultsDiv = document.getElementById('bulk-upload-results');
    let html = '';
    
    if (results.success.length > 0) {
        html += '<h4>✅ Successfully Uploaded:</h4><ul>';
        results.success.forEach(name => {
            html += `<li>${name}</li>`;
        });
        html += '</ul>';
    }
    
    if (results.failed.length > 0) {
        html += '<h4>❌ Failed to Match:</h4><ul>';
        results.failed.forEach(name => {
            html += `<li>${name} - No matching intern found</li>`;
        });
        html += '</ul>';
    }
    
    if (results.skipped.length > 0) {
        html += '<h4>⏭️ Skipped:</h4><ul>';
        results.skipped.forEach(name => {
            html += `<li>${name}</li>`;
        });
        html += '</ul>';
    }
    
    resultsDiv.innerHTML = html;
    resultsDiv.className = 'upload-results ' + (results.failed.length > 0 ? 'error' : 'success');
    resultsDiv.style.display = 'block';
    
    // Clear the file input
    document.getElementById('bulk-headshot-upload').value = '';
    
    // Show success message
    if (results.success.length > 0) {
        showMessage(`Successfully uploaded ${results.success.length} headshot(s)!`, 'success');
    }
}

function clearAllHeadshots() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to clear all headshots? This action cannot be undone.')) {
        interns.forEach(intern => {
            intern.headshot = null;
        });
        
        updateAllDisplays();
        saveDataSilently();
        showMessage('All headshots have been cleared!', 'success');
    }
}

function updateAllDisplays() {
    const sortedInterns = [...interns].sort((a, b) => b.points - a.points);
    
    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
        updateStats(sortedInterns);
        updatePodium(sortedInterns);
        updateLeaderboard(sortedInterns);
        updateInternCards(sortedInterns);
        updateAdminStats(sortedInterns);
    });
}

// Designation management functions
function updateDesignation() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internSelect = document.getElementById('designation-intern-select');
    const newDesignationInput = document.getElementById('new-designation');
    
    const selectedInternName = internSelect.value;
    const newDesignation = newDesignationInput.value.trim();
    
    if (!selectedInternName) {
        showMessage('Please select an intern!', 'error');
        return;
    }
    
    if (!newDesignation) {
        showMessage('Please enter a designation!', 'error');
        return;
    }
    
    // Find and update the intern
    const intern = interns.find(i => i.name === selectedInternName);
    if (intern) {
        const oldDesignation = intern.designation;
        intern.designation = newDesignation;
        
        // Update all displays
        updateAllDisplays();
        
        // Save data automatically
        saveDataSilently();
        
        // Clear form
        internSelect.value = '';
        newDesignationInput.value = '';
        
        showMessage(`Successfully updated ${selectedInternName}'s designation from "${oldDesignation}" to "${newDesignation}"!`, 'success');
    } else {
        showMessage('Intern not found!', 'error');
    }
}

function resetDesignation() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internSelect = document.getElementById('designation-intern-select');
    const selectedInternName = internSelect.value;
    
    if (!selectedInternName) {
        showMessage('Please select an intern!', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to reset ${selectedInternName}'s designation to "Software Development Intern"?`)) {
        // Find and update the intern
        const intern = interns.find(i => i.name === selectedInternName);
        if (intern) {
            const oldDesignation = intern.designation;
            intern.designation = "Software Development Intern";
            
            // Update all displays
            updateAllDisplays();
            
            // Save data automatically
            saveDataSilently();
            
            // Clear form
            internSelect.value = '';
            document.getElementById('new-designation').value = '';
            
            showMessage(`Successfully reset ${selectedInternName}'s designation from "${oldDesignation}" to "Software Development Intern"!`, 'success');
        } else {
            showMessage('Intern not found!', 'error');
        }
    }
}

// Test function to check image display
function testImageDisplay() {
    console.log('Testing image display...');
    console.log('Interns with headshots:', interns.filter(i => i.headshot).length);
    console.log('Total interns:', interns.length);
    
    // Check if any intern has a headshot
    const internWithHeadshot = interns.find(i => i.headshot);
    if (internWithHeadshot) {
        console.log('Found intern with headshot:', internWithHeadshot.name);
        console.log('Headshot data:', internWithHeadshot.headshot.substring(0, 50) + '...');
    } else {
        console.log('No interns have headshots yet');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthentication();
    initializeAdminPanel();
    
    // Test image display after a short delay
    setTimeout(testImageDisplay, 1000);
});
