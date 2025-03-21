// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEI-FLb2r0lsg-6c48jkY1KPw2RujVzXE",
    authDomain: "smart-irrigation-526a8.firebaseapp.com",
    databaseURL: "https://smart-irrigation-526a8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-irrigation-526a8",
    storageBucket: "smart-irrigation-526a8.firebasestorage.app",
    messagingSenderId: "1089495136680",
    appId: "1:1089495136680:web:b5315f910366748214c59d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get Canvas Contexts
const soilMoistureCtx = document.getElementById("soilMoistureChart").getContext("2d");
// Soil Moisture Chart
const soilMoistureChart = new Chart(soilMoistureCtx, {
    type: "line",
    data: {
        labels: [], // Time labels
        datasets: [{
            label: "Soil Moisture (%)",
            data: [],
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)",
            fill: true
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Soil Moisture (%)" } }
        }
    }
});

const tempHumidityCtx = document.getElementById("tempHumidityChart").getContext("2d");
// Temperature & Humidity Chart
const tempHumidityChart = new Chart(tempHumidityCtx, {
    type: "line",
    data: {
        labels: [], // Time labels
        datasets: [
            {
                label: "Temperature (°C)",
                data: [],
                borderColor: "red",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                fill: true
            },
            {
                label: "Humidity (%)",
                data: [],
                borderColor: "green",
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Values" } }
        }
    }
});

// Flow Rate Chart
const flowRateCtx = document.getElementById("flowRateChart").getContext("2d");
const flowRateChart = new Chart(flowRateCtx, {
    type: "line",
    data: {
        labels: [], // Time labels
        datasets: [{
            label: "Flow Rate (L/min)",
            data: [],
            borderColor: "purple",
            backgroundColor: "rgba(128, 0, 128, 0.2)",
            fill: true
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Flow Rate (L/min)" } }
        }
    }
});

// Total Liters Chart
const totalLitersCtx = document.getElementById("totalLitersChart").getContext("2d");
const totalLitersChart = new Chart(totalLitersCtx, {
    type: "line",
    data: {
        labels: [], // Time labels
        datasets: [{
            label: "Total Liters (L)",
            data: [],
            borderColor: "orange",
            backgroundColor: "rgba(255, 165, 0, 0.2)",
            fill: true
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Total Liters" } }
        }
    }
});

// Variables to store data history and CSV data
let dataHistory = [];
let previousData = null;
let csvContent = "data:text/csv;charset=utf-8,Timestamp,Temperature,Humidity,Soil Moisture,Motor Status,Rain Detected, Water Flow Rate, Motor Status\n";

// Create download button
function createDownloadButton() {
    const container = document.createElement("div");
    container.style.textAlign = "center";
    container.style.margin = "20px 0";
    container.style.backgroundColor = "white";
    container.style.padding = "20px";
    container.style.borderRadius = "8px";
    container.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    container.style.display = "flex";
    container.style.justifyContent = "center";

    const downloadBtn = document.createElement("button");
    downloadBtn.id = "downloadBtn";
    downloadBtn.textContent = "Download Data (CSV)";
    downloadBtn.style.padding = "10px 20px";
    downloadBtn.style.backgroundColor = "#4CAF50";
    downloadBtn.style.color = "white";
    downloadBtn.style.border = "none";
    downloadBtn.style.borderRadius = "4px";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.style.fontSize = "20px";

    downloadBtn.addEventListener("click", downloadCSV);

    container.appendChild(downloadBtn);

    // animate the button on hover
    var loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loadingOverlay";
    var spinner = document.createElement("div");
    spinner.classList.add("loading-spinner");
    loadingOverlay.appendChild(spinner);
    document.body.appendChild(loadingOverlay);

    // Create the success message
    var successMessage = document.createElement("div");
    successMessage.id = "successMessage";
    successMessage.innerHTML = "Success! The process is complete.";
    document.body.appendChild(successMessage);

    downloadBtn.onmouseover = () => {
        downloadBtn.style.backgroundColor = "#45a049";
    }

    downloadBtn.onmouseout = () => {
        downloadBtn.style.backgroundColor = "#4CAF50";
    }

    // Add click event for button
    downloadBtn.onclick = function () {
        // Show the loading overlay
        loadingOverlay.style.display = "flex";

        // Hide success message initially
        successMessage.style.display = "none";

        // After 2 seconds (loading time), show the success message
        setTimeout(function () {
            // Hide the loading overlay
            loadingOverlay.style.display = "none";

            // Show the success message
            successMessage.style.display = "block";
        }, 2000); // 2 seconds delay
    };

    // Append the button to the end of the body or a specific container
    // You may need to adjust this selector based on your HTML structure
    const targetElement = document.querySelector("body") || document.querySelector("#main-container");
    if (targetElement) {
        targetElement.appendChild(container);
    }
}

// Function to download CSV data
function downloadCSV() {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smart_irrigation_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to update CSV data
function updateCSVData(data, timestamp) {
    csvContent += `${timestamp},${data.temperature || ""},${data.humidity || ""},${data.soilMoisture || ""},${data.motorStatus ? "ON" : "OFF"},${data.rainDetected ? "TRUE" : "FALSE"},${data.flowRate || ""},${data.motorStatus ? "ON" : "OFF"}\n`;
}

// Function to check if data has changed
function hasDataChanged(newData, oldData) {
    if (!oldData) return true;

    return (
        newData.temperature !== oldData.temperature ||
        newData.humidity !== oldData.humidity ||
        newData.soilMoisture !== oldData.soilMoisture ||
        newData.motorStatus !== oldData.motorStatus ||
        newData.rainDetected !== oldData.rainDetected ||
        newData.floatRate !== oldData.flowRate ||
        newData.totalLiters !== oldData.totalLiters
    );
}

// Function to fetch data from Firebase and update both charts and HTML elements
function fetchData() {
    const dbRef = ref(database, "/SmartIrrigation");

    onValue(dbRef, (snapshot) => {
        console.log("Firebase Data Snapshot:", snapshot.val()); // Debugging log

        if (snapshot.exists()) {
            const data = snapshot.val();
            const now = new Date();
            const timestamp = now.toLocaleTimeString();
            const fullTimestamp = now.toISOString();

            // Update HTML elements
            document.getElementById("temperature").textContent = data.temperature || "--";
            document.getElementById("humidity").textContent = data.humidity || "--";
            document.getElementById("soilMoisture").textContent = data.soilMoisture || "--";
            // Inside fetchData function, add the following lines to update water flow and total water
            document.getElementById("flowRate").textContent = data.flowRate || "--";
            document.getElementById("totalLiters").textContent = data.totalLiters || "--";


            const motorStatusElem = document.getElementById("motorStatus");
            motorStatusElem.textContent = data.motorStatus ? "ON" : "OFF";
            motorStatusElem.className = data.motorStatus ? "status" : "status off";

            const waterLevel = document.getElementById("rainDetected");
            waterLevel.textContent = data.rainDetected ? "TRUE" : "FALSE";
            waterLevel.className = data.rainDetected ? "status" : "status off";

            // Update Soil Moisture Chart
            soilMoistureChart.data.labels.push(timestamp);
            soilMoistureChart.data.datasets[0].data.push(data.soilMoisture);

            // Update Temperature & Humidity Chart
            tempHumidityChart.data.labels.push(timestamp);
            tempHumidityChart.data.datasets[0].data.push(data.temperature);
            tempHumidityChart.data.datasets[1].data.push(data.humidity);

            // Inside fetchData function, update flow rate and total liters
            flowRateChart.data.labels.push(timestamp);
            flowRateChart.data.datasets[0].data.push(data.flowRate);

            // Update Total Liters Chart
            totalLitersChart.data.labels.push(timestamp);
            totalLitersChart.data.datasets[0].data.push(data.totalLiters);

            // Keep Only Last 10 Entries
            if (soilMoistureChart.data.labels.length > 10) {
                soilMoistureChart.data.labels.shift();
                soilMoistureChart.data.datasets[0].data.shift();
            }
            if (tempHumidityChart.data.labels.length > 10) {
                tempHumidityChart.data.labels.shift();
                tempHumidityChart.data.datasets.forEach((dataset) => dataset.data.shift());
            }

            // Keep Only Last 10 Entries
            if (flowRateChart.data.labels.length > 10) {
                flowRateChart.data.labels.shift();
                flowRateChart.data.datasets[0].data.shift();
            }
            if (totalLitersChart.data.labels.length > 10) {
                totalLitersChart.data.labels.shift();
                totalLitersChart.data.datasets[0].data.shift();
            }

            // Update Charts
            soilMoistureChart.update();
            tempHumidityChart.update();
            flowRateChart.update();
            totalLitersChart.update();

            // Check if data has changed and update CSV if it has
            if (hasDataChanged(data, previousData)) {
                updateCSVData(data, fullTimestamp);

                // Store this data point in history
                dataHistory.push({
                    timestamp: fullTimestamp,
                    ...data
                });

                // Update previous data
                previousData = { ...data };

                // Enable download button if it was disabled
                const downloadBtn = document.getElementById("downloadBtn");
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.style.opacity = "1";
                }
            }
        } else {
            console.log("No data found in Firebase!");
        }
    }, (error) => {
        console.error("Firebase Read Failed: ", error);
    });
}

// Initialize the page
function initPage() {
    // Create download button
    createDownloadButton();

    // Start fetching data
    fetchData();
}

// Call initPage when the page loads
window.addEventListener('DOMContentLoaded', initPage);