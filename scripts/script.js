// ==================== CONFIGURATION ====================
const CONFIG = {
    // Google Apps Script URL
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzSwX_v1yJuNDfbQWHKffGMFSDQO7KuIKxxof8vHvxRbU7ikDCkAA0nt_SvD0Ost4pU/exec",
    
    // Google API Configuration
    GOOGLE_API_KEY: "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",
    GOOGLE_CLIENT_ID: "175179802624-jn015u8b1ecjb62c6b05u91btu9ts325.apps.googleusercontent.com",
    
    // Date formats
    DATE_FORMAT: {
        PICKER: "Y-m-d",
        API: "YYYY/MM/DD",
        DISPLAY: "M月D日"
    },
    
    // Sheet configuration
    SHEET: {
        ID: "1boe5G7SQAkVQqzkokAkT3kjjObDckiUhxQ4d1mLZEqA",
        RANGE: "Sheet1!A1:E366",
        COLUMNS: {
            DATE: 0,           // Column A
            TITLE: 1,          // Column B
            BIBLE_CHAPTER: 2,  // Column C
            BIBLE_CONTENT: 3,  // Column D
            THINKING: 4        // Column E
        }
    },
    
    // UI Text
    TEXTS: {
        LOADING: "Loading devotional...",
        NO_DATE: "Please select a date first",
        NO_TITLE: "No title",
        NO_BIBLE_CHAPTER: "No Bible reference",
        NO_BIBLE_CONTENT: "No Bible content",
        NO_THINKING: "No reflection available",
        ERROR_PREFIX: "❌",
        FETCH_ERROR: "Error fetching data"
    }
};
// =======================================================

// Store flatpickr instance globally
let flatpickrInstance = null;

// Initialize Flatpickr calendar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    
    flatpickrInstance = flatpickr("#datePicker", {
        dateFormat: CONFIG.DATE_FORMAT.PICKER,
        defaultDate: today,
        maxDate: today,
        monthSelectorType: "static",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Selected date:", dateStr);
        }
    });
    
    document.getElementById("fetchButton").addEventListener("click", fetchDevotionalForDate);
    
    // Setup navigation buttons
    setupNavigationButtons();
    
    // Initialize font size controls
    initFontSizeControls();
});

// Setup Previous and Next Day buttons
function setupNavigationButtons() {
    const prevBtn = document.getElementById("prevDayButton");
    const nextBtn = document.getElementById("nextDayButton");
    
    if (!prevBtn || !nextBtn) {
        console.error("Navigation buttons not found");
        return;
    }
    
    // Previous day button
    prevBtn.addEventListener("click", function() {
        navigateDays(-1);
    });
    
    // Next day button
    nextBtn.addEventListener("click", function() {
        navigateDays(1);
    });
}

// Navigate to previous or next day
function navigateDays(delta) {
    if (!flatpickrInstance) {
        console.error("Flatpickr not initialized");
        return;
    }
    
    const prevBtn = document.getElementById("prevDayButton");
    const nextBtn = document.getElementById("nextDayButton");
    
    // Disable buttons temporarily to prevent spam
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    
    const currentDate = flatpickrInstance.input.value;
    let targetDate;
    
    if (currentDate) {
        targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() + delta);
    } else {
        targetDate = new Date();
    }
    
    // Check date constraints
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set minimum date (assuming data from Jan 1, 2024)
    const minDate = new Date(2024, 0, 1);
    
    if (targetDate <= today && targetDate >= minDate) {
        const formattedDate = formatDateForFlatpickr(targetDate);
        flatpickrInstance.setDate(formattedDate);
        
        // Show loading state on buttons
        if (delta === -1 && prevBtn) {
            const originalText = prevBtn.innerHTML;
            prevBtn.innerHTML = "⏳ 載入中...";
            setTimeout(() => {
                prevBtn.innerHTML = originalText;
            }, 500);
        } else if (delta === 1 && nextBtn) {
            const originalText = nextBtn.innerHTML;
            nextBtn.innerHTML = "⏳ 載入中...";
            setTimeout(() => {
                nextBtn.innerHTML = originalText;
            }, 500);
        }
        
        // Fetch the devotional for the new date
        fetchDevotionalForDate();
    } else if (targetDate > today) {
        alert("📅 無法選擇未來的日期 (靈修資料只到今日)");
    } else if (targetDate < minDate) {
        alert("📅 無法選擇2024年之前的日期");
    }
    
    // Re-enable buttons after a short delay
    setTimeout(() => {
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    }, 600);
}

// Helper function to format date for flatpickr (YYYY-MM-DD)
function formatDateForFlatpickr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateToSheetFormat(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

function fetchDevotionalForDate() {
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    
    if (!selectedDate) {
        alert(CONFIG.TEXTS.NO_DATE);
        return;
    }
    
    const formattedDate = formatDateToSheetFormat(selectedDate);
    const displayDate = formatDateForDisplay(selectedDate);
    
    console.log("Selected date (raw):", selectedDate);
    console.log("Sending to API (YYYY/MM/DD):", formattedDate);
    console.log("Display format (M月D日):", displayDate);
    
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = `<div class="loading">${CONFIG.TEXTS.LOADING}</div>`;
    
    const fetchButton = document.getElementById("fetchButton");
    if (fetchButton) fetchButton.disabled = true;
    
    const urlWithParam = `${CONFIG.SCRIPT_URL}?date=${encodeURIComponent(formattedDate)}`;
    
    console.log("Fetching URL:", urlWithParam);
    
    fetch(urlWithParam)
        .then(response => response.json())
        .then(data => {
            console.log("Response received:", data);
            displayDevotionalData(data, displayDate);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            dataDisplay.innerHTML = `<div class="error-message">${CONFIG.TEXTS.ERROR_PREFIX} ${CONFIG.TEXTS.FETCH_ERROR}: ${error.message}</div>`;
        })
        .finally(() => {
            if (fetchButton) fetchButton.disabled = false;
        });
}

function displayDevotionalData(response, displayDate) {
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = "";
    
    if (!response.success) {
        dataDisplay.innerHTML = `<div class="error-message">${CONFIG.TEXTS.ERROR_PREFIX} ${response.message}</div>`;
        return;
    }
    
    const data = response.data;
    
    // Create devotional card
    const cardDiv = document.createElement("div");
    cardDiv.className = "devotional-card";
    
    // Date
    const dateDiv = document.createElement("div");
    dateDiv.className = "devotional-date";
    dateDiv.textContent = displayDate;
    cardDiv.appendChild(dateDiv);
    
    // Title
    const titleDiv = document.createElement("div");
    titleDiv.className = "devotional-title";
    titleDiv.textContent = data.title || CONFIG.TEXTS.NO_TITLE;
    cardDiv.appendChild(titleDiv);
    
    // Bible Chapter
    const chapterDiv = document.createElement("div");
    chapterDiv.className = "devotional-chapter";
    chapterDiv.textContent = data.bible_chapter || CONFIG.TEXTS.NO_BIBLE_CHAPTER;
    cardDiv.appendChild(chapterDiv);
    
    // Bible Content
    const contentDiv = document.createElement("div");
    contentDiv.className = "devotional-content";
    contentDiv.textContent = data.bible_content || CONFIG.TEXTS.NO_BIBLE_CONTENT;
    cardDiv.appendChild(contentDiv);
    
    // Thinking/Reflection
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "devotional-thinking";
    
    const thinkingLabel = document.createElement("div");
    thinkingLabel.className = "thinking-label";
    thinkingLabel.textContent = "💭 反思與應用";
    thinkingDiv.appendChild(thinkingLabel);
    
    const thinkingText = document.createElement("div");
    thinkingText.className = "thinking-text";
    thinkingText.textContent = data.thinking || CONFIG.TEXTS.NO_THINKING;
    thinkingDiv.appendChild(thinkingText);
    
    cardDiv.appendChild(thinkingDiv);
    
    dataDisplay.appendChild(cardDiv);
    
    // Apply current font size to new content
    const savedSize = localStorage.getItem('preferredFontSize');
    if (savedSize) {
        applyFontSizeToContent(parseInt(savedSize));
    }
}

// Google API functions (kept for compatibility)
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}

function initClient() {
    gapi.client
        .init({
            apiKey: CONFIG.GOOGLE_API_KEY,
            clientId: CONFIG.GOOGLE_CLIENT_ID,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
        })
        .then(function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log("Signed in to Google");
    }
}

// Font size control functionality
function initFontSizeControls() {
    const decreaseBtn = document.getElementById('decreaseFont');
    const increaseBtn = document.getElementById('increaseFont');
    const resetBtn = document.getElementById('resetFont');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    
    if (!decreaseBtn || !increaseBtn || !resetBtn) return;
    
    // Default font size (in percent)
    let currentFontSize = 100;
    const minFontSize = 70;
    const maxFontSize = 200;
    const step = 10;
    
    // Apply font size to devotional content
    function applyFontSize(size) {
        currentFontSize = size;
        applyFontSizeToContent(size);
        
        // Update display
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = size + '%';
        }
        
        // Save preference to localStorage
        localStorage.setItem('preferredFontSize', size);
    }
    
    // Increase font size
    increaseBtn.addEventListener('click', function() {
        if (currentFontSize < maxFontSize) {
            applyFontSize(currentFontSize + step);
        }
    });
    
    // Decrease font size
    decreaseBtn.addEventListener('click', function() {
        if (currentFontSize > minFontSize) {
            applyFontSize(currentFontSize - step);
        }
    });
    
    // Reset font size
    resetBtn.addEventListener('click', function() {
        applyFontSize(100);
    });
    
    // Load saved preference
    const savedSize = localStorage.getItem('preferredFontSize');
    if (savedSize) {
        applyFontSize(parseInt(savedSize));
    }
}

// Helper function to apply font size to content
function applyFontSizeToContent(size) {
    const dataDisplay = document.getElementById('dataDisplay');
    if (!dataDisplay) return;
    
    const devotionalElements = dataDisplay.querySelectorAll(
        '.devotional-title, .devotional-chapter, .devotional-content, .devotional-thinking, .thinking-text, .devotional-date'
    );
    
    devotionalElements.forEach(element => {
        element.style.fontSize = size + '%';
    });
}