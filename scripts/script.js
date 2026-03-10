// Initialize Flatpickr calendar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const today = new Date();
    
    flatpickr("#datePicker", {
        dateFormat: "Y-m-d",
        defaultDate: today,
        maxDate: today, // Can't select future dates
        monthSelectorType: "static",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Selected date:", dateStr);
        }
    });
    
    // Add event listener to fetch button
    document.getElementById("fetchButton").addEventListener("click", fetchDevotionalForDate);
});

// Format date to match the format in your sheet (actual value is "2026/3/6")
function formatDateToSheetFormat(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const day = date.getDate();
    
    // Return in YYYY/M/D format (no leading zeros)
    return `${year}/${month}/${day}`;
}

// Format date for display (M月D日)
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

// Fetch devotional for selected date
function fetchDevotionalForDate() {
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    
    if (!selectedDate) {
        alert("Please select a date first");
        return;
    }
    
    const formattedDate = formatDateToSheetFormat(selectedDate);
    const displayDate = formatDateForDisplay(selectedDate);
    
    console.log("Selected date (raw):", selectedDate);
    console.log("Sending to API (YYYY/M/D):", formattedDate); // Should be "2026/3/9"
    console.log("Display format (M月D日):", displayDate); // Should be "3月9日"
    
    // Show loading state
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = '<div class="loading">Loading devotional...</div>';
    
    // Disable button while fetching
    const fetchButton = document.getElementById("fetchButton");
    fetchButton.disabled = true;
    
    // Construct the URL with date parameter
    const scriptURL = "https://script.google.com/macros/s/AKfycbzl2A929u7gXOCj3patlyyTnQVsnuv7SzxvWH7-XC3Uqxzu9v6a9tZPR1270Dn4_ey5/exec";
    const urlWithParam = `${scriptURL}?date=${encodeURIComponent(formattedDate)}`;
    
    console.log("Fetching URL:", urlWithParam);
    
    fetch(urlWithParam)
        .then(response => response.json())
        .then(data => {
            console.log("Response received:", data);
            displayDevotionalData(data, displayDate);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            dataDisplay.innerHTML = `<div class="error-message">Error fetching data: ${error.message}</div>`;
        })
        .finally(() => {
            fetchButton.disabled = false;
        });
}

// Display the devotional data
function displayDevotionalData(response, displayDate) {
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = ""; // Clear previous data
    
    if (!response.success) {
        dataDisplay.innerHTML = `<div class="error-message">❌ ${response.message}</div>`;
        return;
    }
    
    const data = response.data;
    
    // Create a nice card layout for the devotional
    const cardDiv = document.createElement("div");
    cardDiv.className = "devotional-card";
    
    // Add date - use the display format we created earlier
    const dateDiv = document.createElement("div");
    dateDiv.className = "devotional-date";
    dateDiv.textContent = displayDate; // Use the display format (3月9日)
    cardDiv.appendChild(dateDiv);
    
    // Add title
    const titleDiv = document.createElement("div");
    titleDiv.className = "devotional-title";
    titleDiv.textContent = data.title || "No title";
    cardDiv.appendChild(titleDiv);
    
    // Add Bible verse
    const verseDiv = document.createElement("div");
    verseDiv.className = "devotional-verse";
    verseDiv.textContent = data.bible_chapter || "No verse";
    cardDiv.appendChild(verseDiv);
    
    dataDisplay.appendChild(cardDiv);
}

// Keep the existing Google API functions
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}

function initClient() {
    gapi.client
        .init({
            apiKey: "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",
            clientId: "175179802624-jn015u8b1ecjb62c6b05u91btu9ts325.apps.googleusercontent.com",
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