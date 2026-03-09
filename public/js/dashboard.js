// ========================================
// Dashboard JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    checkAuth();

    // Initialize components
    initializeMap();
    loadNews();
    loadCases();
    updateLastUpdated();
    initializeModals();
    initializeNavigation();
    initializeMobileMenu();

    // Set up auto-refresh
    setInterval(updateLastUpdated, 60000); // Update every minute
});

// ========================================
// Mobile Menu
// ========================================

function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (!menuToggle) return;

    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside (mobile only)
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Close sidebar when a nav item is clicked
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.id !== 'reportCaseBtn') {
            item.addEventListener('click', function () {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('active');
                }
            });
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('active');
        }
    });
}

// ========================================
// Authentication
// ========================================

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Update user display
    const username = sessionStorage.getItem('username');
    if (username) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = username;
        }
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = 'index.html';
        }
    });
}

// ========================================
// Map Initialization
// ========================================

let map;
let markers = [];

function initializeMap() {

    // Create map first (temporary center)
    map = L.map('map').setView([19.0760, 72.8777], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Move map to user location
                map.setView([userLat, userLng], 13);

                // Add marker for user
                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup("You are here")
                    .openPopup();

            },
            function (error) {
                console.log("Location access denied. Using default Mumbai.");
            }
        );
    }

    // Add sample incident markers
    const incidents = [
        {
            lat: 19.0596,
            lng: 72.8295,
            severity: 'critical',
            type: 'Fire',
            description: 'Building fire reported in Bandra area',
            caseId: 'DS-2024-001'
        },
        {
            lat: 19.0176,
            lng: 72.8562,
            severity: 'medium',
            type: 'Flood',
            description: 'Street flooding in Dadar',
            caseId: 'DS-2024-002'
        },
        {
            lat: 19.1197,
            lng: 72.8464,
            severity: 'low',
            type: 'Accident',
            description: 'Traffic accident near Andheri Metro',
            caseId: 'DS-2024-003'
        },
        {
            lat: 18.9067,
            lng: 72.8147,
            severity: 'critical',
            type: 'Storm',
            description: 'Storm damage reported in Colaba',
            caseId: 'DS-2024-004'
        },
        {
            lat: 19.1176,
            lng: 72.9060,
            severity: 'medium',
            type: 'Landslide',
            description: 'Minor landslide in Powai hills',
            caseId: 'DS-2024-005'
        }
    ];

    incidents.forEach(incident => {
        addMarker(incident);
    });

    // Map filter controls
    const filterBtns = document.querySelectorAll('.map-control-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterMarkers(filter);
        });
    });
}

function addMarker(incident) {
    const color = getMarkerColor(incident.severity);

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 2s ease-in-out infinite;
        "></div>`,
        iconSize: [24, 24]
    });

    const marker = L.marker([incident.lat, incident.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <div style="font-family: 'Barlow', sans-serif;">
                <strong style="font-size: 14px; color: #0F1419;">${incident.type}</strong><br>
                <span style="font-size: 12px; color: #6B7785;">${incident.caseId}</span><br>
                <p style="font-size: 12px; margin: 8px 0; color: #3A4556;">${incident.description}</p>
                <span style="
                    display: inline-block;
                    padding: 2px 8px;
                    background: ${color}20;
                    color: ${color};
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                ">${incident.severity}</span>
            </div>
        `);

    marker.incident = incident;
    markers.push(marker);
}

function getMarkerColor(severity) {
    switch (severity) {
        case 'critical': return '#EF233C';
        case 'medium': return '#FFB703';
        case 'low': return '#06D6A0';
        default: return '#6B7785';
    }
}

function filterMarkers(filter) {
    markers.forEach(marker => {
        if (filter === 'all' || marker.incident.severity === filter) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

// ========================================
// News Updates
// ========================================

// ========================================
// News Updates
// ========================================

async function loadNews() {

    const newsList = document.getElementById('newsList');

    if (!newsList) return;

    newsList.innerHTML = '';

    const API_URL = "https://gnews.io/api/v4/search?q=disaster OR flood OR cyclone OR earthquake&lang=en&country=in&max=6&token=fdfb9e5b394271a3b276d5b9c8d0f00e";

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            newsList.innerHTML = "<p>No news available.</p>";
            return;
        }

        data.articles.forEach((article, index) => {

            const badge = getBadgeType(article.title || "");

            const newsItem = document.createElement('div');

            newsItem.className = 'news-item';

            newsItem.style.animationDelay = `${index * 0.1}s`;
            newsItem.style.animation = 'fadeIn 0.4s ease-out both';

            newsItem.innerHTML = `
                <div class="news-badge badge-${badge}">${badge}</div>
                <div class="news-title">${article.title || "No title available"}</div>
                <div class="news-time">${formatTime(article.publishedAt)}</div>
            `;

            newsItem.addEventListener('click', function () {

                if (article.url) {
                    window.open(article.url, "_blank");
                }

            });

            newsList.appendChild(newsItem);

        });

    } catch (error) {

        console.error("News Load Error:", error);

        newsList.innerHTML = "<p>Failed to load news.</p>";

    }

}


// ========================================
// Badge Type
// ========================================

function getBadgeType(title) {

    const text = title.toLowerCase();

    if (text.includes("earthquake") || text.includes("cyclone") || text.includes("tsunami")) {
        return "breaking";
    }

    if (text.includes("warning") || text.includes("alert")) {
        return "alert";
    }

    return "update";
}


// ========================================
// Safe Time Formatter
// ========================================

function formatTime(dateString) {

    if (!dateString) return "Recently";

    const published = new Date(dateString);

    if (isNaN(published.getTime())) return "Recently";

    const now = new Date();

    const diff = Math.floor((now - published) / 1000);

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;

    return published.toLocaleDateString();

}
// Refresh news
document.getElementById('refreshNews').addEventListener('click', function () {
    this.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        this.style.transform = 'rotate(0deg)';
        loadNews();
    }, 400);
});

document.addEventListener("DOMContentLoaded", loadNews);

// ========================================
// Cases Table
// ========================================

const casesData = [
    {
        id: 'DS-2024-001',
        type: 'Fire',
        location: 'Manhattan, NY',
        severity: 'critical',
        status: 'active',
        reported: '10 min ago'
    },
    {
        id: 'DS-2024-002',
        type: 'Flood',
        location: 'Central Park, NY',
        severity: 'medium',
        status: 'active',
        reported: '25 min ago'
    },
    {
        id: 'DS-2024-003',
        type: 'Accident',
        location: 'Queens, NY',
        severity: 'low',
        status: 'resolved',
        reported: '1 hour ago'
    },
    {
        id: 'DS-2024-004',
        type: 'Storm',
        location: 'Brooklyn, NY',
        severity: 'critical',
        status: 'active',
        reported: '1.5 hours ago'
    },
    {
        id: 'DS-2024-005',
        type: 'Landslide',
        location: 'Manhattan, NY',
        severity: 'medium',
        status: 'active',
        reported: '2 hours ago'
    },
    {
        id: 'DS-2024-006',
        type: 'Earthquake',
        location: 'Bronx, NY',
        severity: 'critical',
        status: 'resolved',
        reported: '3 hours ago'
    },
    {
        id: 'DS-2024-007',
        type: 'Fire',
        location: 'Staten Island, NY',
        severity: 'low',
        status: 'resolved',
        reported: '4 hours ago'
    },
    {
        id: 'DS-2024-008',
        type: 'Flood',
        location: 'Queens, NY',
        severity: 'medium',
        status: 'resolved',
        reported: '5 hours ago'
    }
];

function loadCases() {
    renderCases(casesData);

    // Search functionality
    document.getElementById('searchCases').addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = casesData.filter(c =>
            c.id.toLowerCase().includes(searchTerm) ||
            c.type.toLowerCase().includes(searchTerm) ||
            c.location.toLowerCase().includes(searchTerm)
        );
        renderCases(filtered);
    });

    // Filter functionality
    document.getElementById('filterStatus').addEventListener('change', function (e) {
        const filterValue = e.target.value;
        const filtered = filterValue === 'all'
            ? casesData
            : casesData.filter(c => c.severity === filterValue || c.status === filterValue);
        renderCases(filtered);
    });
}

function renderCases(cases) {
    const tbody = document.getElementById('casesTableBody');
    tbody.innerHTML = '';

    cases.forEach(caseItem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="case-id">${caseItem.id}</span></td>
            <td><span class="case-type">${caseItem.type}</span></td>
            <td>${caseItem.location}</td>
            <td>
                <span class="severity-badge severity-${caseItem.severity}">
                    ${caseItem.severity}
                </span>
            </td>
            <td>
                <span class="status-badge-table ${caseItem.status === 'resolved' ? 'status-resolved' : 'status-active-table'}">
                    ${caseItem.status}
                </span>
            </td>
            <td>${caseItem.reported}</td>
            <td>
                <div class="case-actions">
                    <button class="btn-action" onclick="viewCase('${caseItem.id}')" title="View details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn-action" onclick="editCase('${caseItem.id}')" title="Edit case">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-action" onclick="deleteCase('${caseItem.id}')" title="Delete case">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Case actions
function viewCase(id) {
    const caseItem = casesData.find(c => c.id === id);
    if (caseItem) {
        alert(`Case Details:\n\nID: ${caseItem.id}\nType: ${caseItem.type}\nLocation: ${caseItem.location}\nSeverity: ${caseItem.severity}\nStatus: ${caseItem.status}\nReported: ${caseItem.reported}`);
    }
}

function editCase(id) {
    alert(`Edit functionality for case ${id} would be implemented here`);
}

function deleteCase(id) {
    if (confirm(`Are you sure you want to delete case ${id}?`)) {
        const index = casesData.findIndex(c => c.id === id);
        if (index > -1) {
            casesData.splice(index, 1);
            loadCases();
        }
    }
}

// ========================================
// Modals
// ========================================

function initializeModals() {
    // Report Case Modal
    const reportModal = document.getElementById('reportModal');
    const reportBtn = document.getElementById('reportCaseBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelReport = document.getElementById('cancelReport');
    const reportForm = document.getElementById('reportForm');

    reportBtn.addEventListener('click', function (e) {
        e.preventDefault();
        reportModal.classList.add('active');
    });

    closeModal.addEventListener('click', function () {
        reportModal.classList.remove('active');
        reportForm.reset();
    });

    cancelReport.addEventListener('click', function () {
        reportModal.classList.remove('active');
        reportForm.reset();
    });

    reportModal.addEventListener('click', function (e) {
        if (e.target === reportModal) {
            reportModal.classList.remove('active');
            reportForm.reset();
        }
    });

    reportForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            type: document.getElementById('caseType').value,
            severity: document.getElementById('caseSeverity').value,
            location: document.getElementById('caseLocation').value,
            description: document.getElementById('caseDescription').value,
            contact: document.getElementById('caseContact').value,
            people: document.getElementById('casePeople').value
        };

        // Generate new case ID
        const newId = `DS-2024-${String(casesData.length + 1).padStart(3, '0')}`;

        // Add new case
        const newCase = {
            id: newId,
            type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
            location: formData.location,
            severity: formData.severity,
            status: 'active',
            reported: 'Just now'
        };

        casesData.unshift(newCase);

        // Update stats
        updateStats();

        // Reload cases table
        renderCases(casesData);

        // Show success message
        alert(`Case ${newId} has been successfully reported!\n\nType: ${newCase.type}\nLocation: ${newCase.location}\nSeverity: ${newCase.severity}`);

        // Close modal and reset form
        reportModal.classList.remove('active');
        reportForm.reset();
    });

    // Profile Modal
    const profileModal = document.getElementById('profileModal');
    const profileBtn = document.getElementById('profileBtn');
    const closeProfileModal = document.getElementById('closeProfileModal');

    profileBtn.addEventListener('click', function (e) {
        e.preventDefault();
        profileModal.classList.add('active');
    });

    closeProfileModal.addEventListener('click', function () {
        profileModal.classList.remove('active');
    });

    profileModal.addEventListener('click', function (e) {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });
}

// ========================================
// Stats Update
// ========================================

function updateStats() {
    const activeCases = casesData.filter(c => c.status === 'active').length;
    const resolvedCases = casesData.filter(c => c.status === 'resolved').length;
    const criticalCases = casesData.filter(c => c.severity === 'critical' && c.status === 'active').length;

    document.getElementById('activeCases').textContent = activeCases;
    document.getElementById('resolvedCases').textContent = resolvedCases;
    document.getElementById('criticalCases').textContent = criticalCases;
}

// ========================================
// Last Updated Time
// ========================================

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = timeString;
}

// ========================================
// Navigation
// ========================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Don't prevent default for report case button (handled by modal)
            if (this.id !== 'reportCaseBtn') {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');

                // Get the menu item text for future use
                const menuText = this.textContent.trim();
                console.log('Navigating to:', menuText);

                // Handle navigation
                showSection(menuText);
            }
        });
    });
}

function showSection(sectionName) {

    const statsCards = document.querySelector('.stats-cards');
    const contentGrid = document.querySelector('.content-grid');

    const casesSection = document.getElementById('casesSection');
    const communitySection = document.getElementById('communitySection');
    const emergencyResourcesSection = document.getElementById('emergencyResourcesSection');
    const alertsSection = document.getElementById('alertsSection');
    const settingsSection = document.getElementById('settingsSection');

    // Hide everything first
    if (casesSection) casesSection.style.display = 'none';
    if (communitySection) communitySection.style.display = 'none';
    if (emergencyResourcesSection) emergencyResourcesSection.style.display = 'none';
    if (alertsSection) alertsSection.style.display = 'none';
    if (settingsSection) settingsSection.style.display = 'none';

    if (sectionName === 'Community') {

        statsCards.style.display = 'none';
        contentGrid.style.display = 'none';

        if (communitySection) communitySection.style.display = 'block';

        if (typeof initializeCommunity === "function") {
            initializeCommunity();
        }

    } else if (sectionName === 'Emergency Resources') {

        statsCards.style.display = 'none';
        contentGrid.style.display = 'none';

        if (emergencyResourcesSection) emergencyResourcesSection.style.display = 'block';

        if (typeof initializeEmergencyResources === "function") {
            initializeEmergencyResources();
        }

    } else if (sectionName === 'Alerts') {

        statsCards.style.display = 'none';
        contentGrid.style.display = 'none';

        if (alertsSection) alertsSection.style.display = 'block';

        if (typeof initializeAlerts === "function") {
            initializeAlerts();
        }

    } else if (sectionName === 'Settings') {

        statsCards.style.display = 'none';
        contentGrid.style.display = 'none';

        if (settingsSection) settingsSection.style.display = 'block';

        if (typeof initializeSettings === "function") {
            initializeSettings();
        }

    } else {

        // Dashboard (Home)
        if (statsCards) statsCards.style.display = 'grid';
        if (contentGrid) contentGrid.style.display = 'grid';
        if (casesSection) casesSection.style.display = 'block';

    }

}// Community Features section moved to community.js
// Emergency Resources section moved to emergency-resources.js

// ========================================
// Utility Functions
// ========================================

// Add CSS for marker pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
    }
`;
document.head.appendChild(style);
