document.addEventListener("DOMContentLoaded", () => {

const newsContainer = document.getElementById("newsList");
const refreshBtn = document.getElementById("refreshNews");

const USGS_API =
"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

async function fetchDisasterAlerts() {

    if (!newsContainer) return;

    newsContainer.innerHTML = "<p>Loading live disaster alerts...</p>";

    try {

        const response = await fetch(USGS_API);
        const data = await response.json();

        displayAlerts(data.features.slice(0, 8));

        updateTimestamp();

    } catch (error) {

        console.error("Alert Fetch Error:", error);

        newsContainer.innerHTML =
        "<p>⚠ Unable to load disaster alerts</p>";

    }

}

function displayAlerts(alerts) {

    newsContainer.innerHTML = "";

    alerts.forEach(alert => {

        const { place, mag, time, url } = alert.properties;

        const magnitude = mag ? mag.toFixed(1) : "N/A";

        const item = document.createElement("div");
        item.classList.add("news-item");

        item.innerHTML = `

        <div class="alert-header">

            <strong>🌍 Earthquake</strong>
            <span class="alert-mag">M ${magnitude}</span>

        </div>

        <p><strong>Location:</strong> ${place}</p>

        <p><strong>Time:</strong> 
        ${new Date(time).toLocaleString()}</p>

        <a href="${url}" target="_blank">View Details</a>

        `;

        newsContainer.appendChild(item);

    });

}

function updateTimestamp(){

    const lastUpdated = document.getElementById("lastUpdated");

    if(lastUpdated){
        lastUpdated.textContent = new Date().toLocaleTimeString();
    }

}

if(refreshBtn){
    refreshBtn.addEventListener("click", fetchDisasterAlerts);
}

fetchDisasterAlerts();

setInterval(fetchDisasterAlerts, 300000);

});