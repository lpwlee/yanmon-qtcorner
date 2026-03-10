document.getElementById("fetchButton").addEventListener("click", function () {
  fetch("YOUR_APPS_SCRIPT_URL") // Replace with your Google Apps Script URL
    .then((response) => response.json())
    .then((data) => {
      const dataDisplay = document.getElementById("dataDisplay");
      dataDisplay.innerHTML = ""; // Clear previous data

      data.forEach((row) => {
        const rowDiv = document.createElement("div");
        rowDiv.textContent = row.join(", "); // Join columns with a comma
        dataDisplay.appendChild(rowDiv);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check the console for details.");
    });
});
