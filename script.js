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

// Intern data - 12 interns in alphabetical order (with 5 attendance points each after deduction)
const interns = [
    { name: "Amrutha Pemmasani", workCompletionPoints: 25, attendancePoints: 5, badges: ["gold"], headshot: null, designation: "Software Development Intern" },
    { name: "Ankita Chouksey", workCompletionPoints: 5, attendancePoints: 5, badges: [], headshot: null, designation: "Business Development Intern" },
    { name: "Charan Kumar Rayaprolu", workCompletionPoints: 0, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Dishant Modi", workCompletionPoints: 10, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Ishan Mehta", workCompletionPoints: 15, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Khushi Digarse", workCompletionPoints: 25, attendancePoints: 5, badges: ["gold"], headshot: null, designation: "Project Manager and BDM Intern" },
    { name: "Mrudula Jethe Bhanushali", workCompletionPoints: 5, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Nirmit Pradip Patel", workCompletionPoints: 10, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Rachna Patel", workCompletionPoints: 25, attendancePoints: 5, badges: ["gold"], headshot: null, designation: "Business Development Intern" },
    { name: "Tanmayee Arigala", workCompletionPoints: 0, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Varun Muriki", workCompletionPoints: 0, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" },
    { name: "Zeel Patel", workCompletionPoints: 20, attendancePoints: 5, badges: [], headshot: null, designation: "Software Development Intern" }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Script is running!');
    
    // Clear any existing localStorage data to force fresh load
    localStorage.removeItem('internData');
    localStorage.removeItem('rewardData');
    console.log('Cleared localStorage to force fresh data load');
    
    // Load saved data if available
    loadSavedData();
    
    // Use the updated intern data (after loading from localStorage)
    const currentData = interns;
    console.log('Current intern data:', currentData);
    console.log('First intern attendance points:', currentData[0].attendancePoints);
    
    // Sort interns by total points (descending)
    const sortedInterns = [...currentData].sort((a, b) => (b.workCompletionPoints + b.attendancePoints) - (a.workCompletionPoints + a.attendancePoints));
    console.log('Sorted interns:', sortedInterns);
    
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
            console.log('Loading saved data:', data);
            if (data.interns && Array.isArray(data.interns)) {
                // Update interns with saved data
                data.interns.forEach(savedIntern => {
                    const existingIntern = interns.find(i => i.name === savedIntern.name);
                    if (existingIntern) {
                        // Handle migration from old points structure
                        if (savedIntern.points !== undefined && savedIntern.workCompletionPoints === undefined) {
                            // Migrate old points to work completion points
                            existingIntern.workCompletionPoints = savedIntern.points || 0;
                            existingIntern.attendancePoints = 0;
                            console.log(`Migrated ${savedIntern.name}: ${savedIntern.points} points to work completion`);
                        } else {
                            existingIntern.workCompletionPoints = savedIntern.workCompletionPoints || 0;
                            existingIntern.attendancePoints = savedIntern.attendancePoints || 0;
                            console.log(`Loaded ${savedIntern.name}: Work=${savedIntern.workCompletionPoints}, Attendance=${savedIntern.attendancePoints}`);
                        }
                        existingIntern.badges = savedIntern.badges || [];
                        existingIntern.headshot = savedIntern.headshot || null;
                        existingIntern.designation = savedIntern.designation || "Software Development Intern";
                    }
                });
            }
        } else {
            console.log('No saved data found, using default values');
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function updateStats(interns) {
    const totalPoints = interns.reduce((sum, intern) => sum + intern.workCompletionPoints + intern.attendancePoints, 0);
    const topPerformer = interns[0];
    
    // Animate total points counter
    animateCounter('total-points', totalPoints);
    
    // Update top performer (show "Tie" if multiple people have same points)
    if (totalPoints === 0) {
        document.getElementById('top-performer').textContent = "Starting Soon!";
    } else {
        const topScore = topPerformer.workCompletionPoints + topPerformer.attendancePoints;
        const topPerformers = interns.filter(intern => (intern.workCompletionPoints + intern.attendancePoints) === topScore);
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
    
    if (!first) return;
    
    const firstTotal = first.workCompletionPoints + first.attendancePoints;
    const secondTotal = second ? second.workCompletionPoints + second.attendancePoints : 0;
    const thirdTotal = third ? third.workCompletionPoints + third.attendancePoints : 0;
    
    // Show "TBD" for podium when everyone has zero points
    if (firstTotal === 0) {
        document.getElementById('first-place').textContent = "TBD";
        document.getElementById('first-points').textContent = "0 pts";
        
        document.getElementById('second-place').textContent = "TBD";
        document.getElementById('second-points').textContent = "0 pts";
        
        document.getElementById('third-place').textContent = "TBD";
        document.getElementById('third-points').textContent = "0 pts";
    } else {
        // Group people by score to handle ties properly
        const topScorers = [];
        
        // Find all people with top score
        const topScore = firstTotal;
        for (let intern of interns) {
            const internTotal = intern.workCompletionPoints + intern.attendancePoints;
            if (internTotal === topScore) {
                topScorers.push(intern);
            } else {
                break; // Stop when we hit a different score
            }
        }
        
        // If multiple people tied for first, show them as co-champions
        if (topScorers.length > 1) {
            // Show tied winners in first position
            const firstNames = topScorers.map(intern => intern.name.split(' ')[0]).join(', ');
            document.getElementById('first-place').textContent = firstNames;
            document.getElementById('first-points').textContent = `${topScore} pts`;
            
            // Find next unique score for second place
            let nextPlaceIntern = null;
            for (let i = topScorers.length; i < interns.length; i++) {
                if (interns[i]) {
                    nextPlaceIntern = interns[i];
                    break;
                }
            }
            
            if (nextPlaceIntern && (nextPlaceIntern.workCompletionPoints + nextPlaceIntern.attendancePoints) > 0) {
                document.getElementById('second-place').textContent = nextPlaceIntern.name;
                document.getElementById('second-points').textContent = `${nextPlaceIntern.workCompletionPoints + nextPlaceIntern.attendancePoints} pts`;
            } else {
                document.getElementById('second-place').textContent = "TBD";
                document.getElementById('second-points').textContent = "0 pts";
            }
            
            // Find intern for third place
            let thirdPlaceIntern = null;
            const secondPlaceScore = nextPlaceIntern ? nextPlaceIntern.workCompletionPoints + nextPlaceIntern.attendancePoints : 0;
            
            for (let i = topScorers.length; i < interns.length; i++) {
                if (interns[i] && (interns[i].workCompletionPoints + interns[i].attendancePoints) < secondPlaceScore && (interns[i].workCompletionPoints + interns[i].attendancePoints) > 0) {
                    thirdPlaceIntern = interns[i];
                    break;
                }
            }
            
            if (thirdPlaceIntern) {
                document.getElementById('third-place').textContent = thirdPlaceIntern.name;
                document.getElementById('third-points').textContent = `${thirdPlaceIntern.workCompletionPoints + thirdPlaceIntern.attendancePoints} pts`;
            } else {
                document.getElementById('third-place').textContent = "TBD";
                document.getElementById('third-points').textContent = "0 pts";
            }
        } else {
            // No ties - show normally
            document.getElementById('first-place').textContent = first.name;
            document.getElementById('first-points').textContent = `${firstTotal} pts`;
            
            if (second && secondTotal > 0) {
                document.getElementById('second-place').textContent = second.name;
                document.getElementById('second-points').textContent = `${secondTotal} pts`;
            } else {
                document.getElementById('second-place').textContent = "TBD";
                document.getElementById('second-points').textContent = "0 pts";
            }
            
            if (third && thirdTotal > 0) {
                document.getElementById('third-place').textContent = third.name;
                document.getElementById('third-points').textContent = `${thirdTotal} pts`;
            } else {
                document.getElementById('third-place').textContent = "TBD";
                document.getElementById('third-points').textContent = "0 pts";
            }
        }
    }
}

function updateLeaderboard(interns) {
    const leaderboardContainer = document.getElementById('leaderboard-entries');
    leaderboardContainer.innerHTML = '';
    
    // Calculate proper ranks with ties
    let currentRank = 1;
    let previousScore = null;
    const internRanks = [];
    
    interns.forEach((intern, index) => {
        const currentScore = intern.workCompletionPoints + intern.attendancePoints;
        
        if (previousScore !== null && currentScore < previousScore) {
            currentRank = index + 1; // Jump to next available rank after ties
        }
        
        internRanks.push({
            intern: intern,
            rank: currentRank,
            score: currentScore
        });
        
        previousScore = currentScore;
    });
    
    internRanks.forEach((internRank, index) => {
        const entry = document.createElement('div');
        entry.className = 'leaderboard-entry';
        entry.style.animationDelay = `${index * 0.1}s`;
        
        const rank = internRank.rank;
        const rankClass = rank <= 3 ? 'top-three' : '';
        const intern = internRank.intern;
        
        // Create elements safely to avoid XSS
        const rankDiv = document.createElement('div');
        rankDiv.className = `rank-number ${rankClass}`;
        rankDiv.textContent = rank;
        
        const internInfoDiv = document.createElement('div');
        internInfoDiv.className = 'intern-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'intern-name';
        nameDiv.textContent = intern.name;
        
        const designationDiv = document.createElement('div');
        designationDiv.className = 'intern-designation';
        designationDiv.textContent = intern.designation || 'Intern';
        
        internInfoDiv.appendChild(nameDiv);
        internInfoDiv.appendChild(designationDiv);
        
        // Create separate point columns
        const workPointsDiv = document.createElement('div');
        workPointsDiv.className = 'points-display work-points';
        workPointsDiv.textContent = intern.workCompletionPoints;
        
        const attendancePointsDiv = document.createElement('div');
        attendancePointsDiv.className = 'points-display attendance-points';
        attendancePointsDiv.textContent = intern.attendancePoints;
        
        const totalPointsDiv = document.createElement('div');
        totalPointsDiv.className = 'points-display total-points';
        totalPointsDiv.textContent = intern.workCompletionPoints + intern.attendancePoints;
        
        const badgesDiv = document.createElement('div');
        badgesDiv.className = 'badges-display';
        // Add badges safely
        const badges = generateBadgesHTML(intern.badges);
        if (badges) {
            badgesDiv.innerHTML = badges;
        }
        
        entry.appendChild(rankDiv);
        entry.appendChild(internInfoDiv);
        entry.appendChild(workPointsDiv);
        entry.appendChild(attendancePointsDiv);
        entry.appendChild(totalPointsDiv);
        entry.appendChild(badgesDiv);
        
        leaderboardContainer.appendChild(entry);
    });
}

function updateInternCards(interns) {
    const cardsContainer = document.getElementById('intern-cards-grid');
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    interns.forEach((intern, index) => {
        const card = document.createElement('div');
        card.className = 'intern-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-avatar">
                    <span class="avatar-initials">${intern.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div class="card-info">
                    <h3>${intern.name}</h3>
                    <p class="designation">${intern.designation || 'Intern'}</p>
                    <span class="rank no-rank">No Rank Yet</span>
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-item main-stat">
                    <h4>${intern.workCompletionPoints + intern.attendancePoints}</h4>
                    <p>Total Points</p>
                </div>
                <div class="stat-item">
                    <h4>${intern.workCompletionPoints}</h4>
                    <p>Work</p>
                </div>
                <div class="stat-item">
                    <h4>${intern.attendancePoints}</h4>
                    <p>Attendance</p>
                </div>
                <div class="stat-item">
                    <h4>${intern.badges.length}</h4>
                    <p>Badges</p>
                </div>
            </div>
            <div class="card-badges">
                <span class="card-badge" style="background: #e2e8f0; color: #718096;">No badges yet</span>
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
function addPoints(internName, points, pointType = 'workCompletion', badge = null) {
    const intern = interns.find(i => i.name === internName);
    if (intern) {
        if (pointType === 'attendance') {
            intern.attendancePoints += points;
        } else {
            intern.workCompletionPoints += points;
        }
        
        if (badge && !intern.badges.includes(badge)) {
            intern.badges.push(badge);
        }
        
        // Re-sort and update display
        const sortedInterns = [...interns].sort((a, b) => (b.workCompletionPoints + b.attendancePoints) - (a.workCompletionPoints + a.attendancePoints));
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
        intern.workCompletionPoints = 0;
        intern.attendancePoints = 0;
        intern.badges = [];
    });
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => (b.workCompletionPoints + b.attendancePoints) - (a.workCompletionPoints + a.attendancePoints));
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
    const adminToggleBtn = document.getElementById('admin-toggle-btn');
    console.log('Admin toggle button found:', adminToggleBtn);
    
    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', handleAdminToggle);
        console.log('Event listener added to admin toggle button');
    } else {
        console.error('Admin toggle button not found!');
    }
    
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
    console.log('Admin toggle clicked, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
        toggleAdminPanel();
    } else {
        showLoginModal();
    }
}

// Make function globally available
window.handleAdminToggle = handleAdminToggle;

// Simple test function
window.testLogin = function() {
    console.log('Test login function called!');
    alert('Login button is working!');
    showLoginModal();
};

// Simple login function
window.simpleLogin = function() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
};

// Simple close function
window.closeModal = function() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Simple login form handler
window.handleSimpleLogin = function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'Root' && password === 'RP@2025') {
        alert('Login successful!');
        closeModal();
        showAdminPanel();
    } else {
        alert('Invalid credentials!');
    }
};

// Show admin panel function
window.showAdminPanel = function() {
    const adminPanel = document.getElementById('admin-panel');
    const adminToggle = document.querySelector('.admin-toggle');
    
    if (adminPanel) {
        adminPanel.classList.remove('hidden');
        console.log('Admin panel shown');
    }
    
    if (adminToggle) {
        adminToggle.innerHTML = '<button onclick="hideAdminPanel()" class="admin-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>';
    }
};

// Hide admin panel function
window.hideAdminPanel = function() {
    const adminPanel = document.getElementById('admin-panel');
    const adminToggle = document.querySelector('.admin-toggle');
    
    if (adminPanel) {
        adminPanel.classList.add('hidden');
    }
    
    if (adminToggle) {
        adminToggle.innerHTML = '<button onclick="simpleLogin()" class="admin-btn"><i class="fas fa-sign-in-alt"></i> Login</button>';
    }
};

function showLoginModal() {
    console.log('showLoginModal called');
    const loginModal = document.getElementById('login-modal');
    console.log('Login modal element:', loginModal);
    if (loginModal) {
        console.log('Removing hidden class from login modal');
        loginModal.classList.remove('hidden');
        document.getElementById('username').focus();
    } else {
        console.error('Login modal not found!');
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
    const pointType = document.getElementById('point-type-select').value;
    
    if (!internName || !points || points <= 0) {
        showMessage('Please select an intern and enter positive points!', 'error');
        return;
    }
    
    // Add points using existing function
    addPoints(internName, points, pointType, null);
    
    // Clear form
    document.getElementById('intern-select').value = '';
    document.getElementById('points-input').value = '';
    
    // Show success message
    const pointTypeName = pointType === 'attendance' ? 'attendance' : 'work completion';
    showMessage(`Successfully awarded ${points} ${pointTypeName} points to ${internName}!`, 'success');
}

function removePoints() {
    // Check authentication
    if (!isAuthenticated) {
        showMessage('Please login to access admin features!', 'error');
        return;
    }
    
    const internName = document.getElementById('intern-select').value;
    const points = parseInt(document.getElementById('points-input').value);
    const pointType = document.getElementById('point-type-select').value;
    
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
    const currentPoints = pointType === 'attendance' ? intern.attendancePoints : intern.workCompletionPoints;
    if (currentPoints - points < 0) {
        if (!confirm(`This will reduce ${internName}'s ${pointType === 'attendance' ? 'attendance' : 'work completion'} points to 0. Continue?`)) {
            return;
        }
        if (pointType === 'attendance') {
            intern.attendancePoints = 0;
        } else {
            intern.workCompletionPoints = 0;
        }
    } else {
        if (pointType === 'attendance') {
            intern.attendancePoints -= points;
        } else {
            intern.workCompletionPoints -= points;
        }
    }
    
    // Re-sort and update display
    const sortedInterns = [...interns].sort((a, b) => (b.workCompletionPoints + b.attendancePoints) - (a.workCompletionPoints + a.attendancePoints));
    updateStats(sortedInterns);
    updatePodium(sortedInterns);
    updateLeaderboard(sortedInterns);
    updateInternCards(sortedInterns);
    updateAdminStats(sortedInterns);
    
    // Clear form
    document.getElementById('intern-select').value = '';
    document.getElementById('points-input').value = '';
    
    // Show success message
    const pointTypeName = pointType === 'attendance' ? 'attendance' : 'work completion';
    showMessage(`Successfully removed ${points} ${pointTypeName} points from ${internName}!`, 'success');
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
                workCompletionPoints: 0,
                attendancePoints: 0,
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
            workCompletionPoints: 0,
            attendancePoints: 0,
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
        const dataToSave = {
            interns: interns,
            lastSaved: new Date().toISOString(),
            version: '2.1.1'
        };
        console.log('Saving data manually:', dataToSave);
        localStorage.setItem('rewardData', JSON.stringify(dataToSave));
        console.log('Data saved successfully to localStorage');
        showMessage('Data saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving data:', error);
        showMessage('Error saving data!', 'error');
    }
}

function saveDataSilently() {
    // Save data without showing messages (for automatic saves)
    try {
        const dataToSave = {
            interns: interns,
            lastSaved: new Date().toISOString(),
            version: '2.1.1'
        };
        console.log('Saving data silently:', dataToSave);
        localStorage.setItem('rewardData', JSON.stringify(dataToSave));
        console.log('Data saved successfully to localStorage');
    } catch (error) {
        console.error('Error saving data silently:', error);
    }
}

function updateAdminStats(interns) {
    const totalPoints = interns.reduce((sum, intern) => sum + intern.workCompletionPoints + intern.attendancePoints, 0);
    const topPerformer = interns[0];
    
    document.getElementById('admin-total-points').textContent = totalPoints;
    
    if (totalPoints === 0) {
        document.getElementById('admin-top-performer').textContent = "Starting Soon!";
    } else {
        const topScore = topPerformer.workCompletionPoints + topPerformer.attendancePoints;
        const topPerformers = interns.filter(intern => (intern.workCompletionPoints + intern.attendancePoints) === topScore);
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
                            // Handle migration from old points structure
                            if (importedIntern.points !== undefined && importedIntern.workCompletionPoints === undefined) {
                                existingIntern.workCompletionPoints = importedIntern.points || 0;
                                existingIntern.attendancePoints = 0;
                            } else {
                                existingIntern.workCompletionPoints = importedIntern.workCompletionPoints || 0;
                                existingIntern.attendancePoints = importedIntern.attendancePoints || 0;
                            }
                            existingIntern.badges = importedIntern.badges || [];
                        }
                    });
                    
                    // Update display
                    const sortedInterns = [...interns].sort((a, b) => (b.workCompletionPoints + b.attendancePoints) - (a.workCompletionPoints + a.attendancePoints));
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
            // Create preview elements safely
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            
            const previewText = document.createElement('div');
            previewText.className = 'preview-text';
            previewText.textContent = file.name;
            
            preview.innerHTML = '';
            preview.appendChild(img);
            preview.appendChild(previewText);
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
    
    // Clear existing content
    resultsDiv.innerHTML = '';
    
    if (results.success.length > 0) {
        const successH4 = document.createElement('h4');
        successH4.textContent = '✅ Successfully Uploaded:';
        resultsDiv.appendChild(successH4);
        
        const successUl = document.createElement('ul');
        results.success.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            successUl.appendChild(li);
        });
        resultsDiv.appendChild(successUl);
    }
    
    if (results.failed.length > 0) {
        const failedH4 = document.createElement('h4');
        failedH4.textContent = '❌ Failed to Match:';
        resultsDiv.appendChild(failedH4);
        
        const failedUl = document.createElement('ul');
        results.failed.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name + ' - No matching intern found';
            failedUl.appendChild(li);
        });
        resultsDiv.appendChild(failedUl);
    }
    
    if (results.skipped.length > 0) {
        const skippedH4 = document.createElement('h4');
        skippedH4.textContent = '⏭️ Skipped:';
        resultsDiv.appendChild(skippedH4);
        
        const skippedUl = document.createElement('ul');
        results.skipped.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            skippedUl.appendChild(li);
        });
        resultsDiv.appendChild(skippedUl);
    }
    
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
    const sortedInterns = [...interns].sort((a, b) => (b.workCompletionPoints + b.attendancePoints) - (a.workCompletionPoints + a.attendancePoints));
    
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

// Test image display after a short delay
setTimeout(testImageDisplay, 1000);

// Force clear all data and reload function
window.forceReload = function() {
    console.log('Force reloading data...');
    localStorage.clear();
    location.reload();
};

// Debug function to check current data
window.debugData = function() {
    console.log('Current interns data:', interns);
    console.log('First intern:', interns[0]);
    console.log('Total points calculation:', interns.reduce((sum, intern) => sum + intern.workCompletionPoints + intern.attendancePoints, 0));
};
