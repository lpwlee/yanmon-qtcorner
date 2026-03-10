// Initialize Flatpickr calendar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
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

// Format date to match the format in your sheet (actual value is "2026/3/6", display is "3月6日")
function formatDateToSheetFormat(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const day = date.getDate();
    
    // Return in the format that matches the actual cell value (YYYY/M/D)
    // This is what the Google Sheets API will use for comparison
    return `${year}/${month}/${day}`;
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
    console.log("Fetching devotional for:", formattedDate);
    
    // Show loading state
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = '<div class="loading">Loading devotional...</div>';
    
    // Disable button while fetching
    const fetchButton = document.getElementById("fetchButton");
    fetchButton.disabled = true;
    
    // Construct the URL with date parameter
    const scriptURL = "https://script.google.com/macros/s/AKfycbzl2A929u7gXOCj3patlyyTnQVsnuv7SzxvWH7-XC3Uqxzu9v6a9tZPR1270Dn4_ey5/exec";
    const urlWithParam = `${scriptURL}?date=${encodeURIComponent(formattedDate)}`;
    
    fetch(urlWithParam)
        .then(response => response.json())
        .then(data => {
            displayDevotionalData(data);
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
function displayDevotionalData(response) {
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
    
    // Add date
    const dateDiv = document.createElement("div");
    dateDiv.className = "devotional-date";
    dateDiv.textContent = data.date;
    cardDiv.appendChild(dateDiv);
    
    // Add title
    const titleDiv = document.createElement("div");
    titleDiv.className = "devotional-title";
    titleDiv.textContent = data.title;
    cardDiv.appendChild(titleDiv);
    
    // Add Bible verse
    const verseDiv = document.createElement("div");
    verseDiv.className = "devotional-verse";
    verseDiv.textContent = data.bible_chapter;
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
        // Optional: You could auto-fetch today's devotional when signed in
        // fetchDevotionalForDate();
    }
}

// Note: The original fetch button event listener and displayData function
// have been replaced by the new devotional-specific functions above.
// If you need to keep the original functionality for any reason,
// you can add it back here.