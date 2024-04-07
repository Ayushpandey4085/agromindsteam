document.addEventListener("DOMContentLoaded", fetchData);

function fetchData() {
    setInterval(async () => {
        const apiKey = "ZKKI4TRB3XMG63AU";
        const channelId = "2401895";
       
        try {
            const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`);
            const data = await response.json();
            console.log(data);

            // Update temperature data
            document.getElementById("temperature").textContent = `Temperature: ${data.field1 || "N/A"}`;

            // Update humidity data
            document.getElementById("humidity").textContent = `Humidity: ${data.field2 || "N/A"}`;

            // Update soil moisture data
            document.getElementById("soilMoisture").textContent = `Soil Moisture: ${data.field3 || "N/A"}`;

            // Load iframes
            loadIframes();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, 10000); // 10 seconds interval
}

function loadIframes() {
    // Array of iframe URLs
    const iframeUrls = [
        'https://thingspeak.com/channels/2401895/status/recent',
        'https://thingspeak.com/channels/2401895/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Temperature&type=spline',
        'https://thingspeak.com/channels/2401895/charts/2?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Humidity&type=spline',
        'https://thingspeak.com/channels/2401895/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Soil+Moisture&type=spline'
        
    ];

    // Loop through each URL and update iframe src attribute
    iframeUrls.forEach((url, index) => {
        const iframe = document.createElement("iframe");
        iframe.width = "450";
        iframe.height = "260";
        iframe.style.border = "1px solid #cccccc";
        iframe.src = url;

        // Get the container for each iframe
        const containerId = `iframeContainer${index + 1}`;
        const iframeContainer = document.getElementById(containerId);

        // Clear existing content and append the new iframe
        iframeContainer.innerHTML = '';
        iframeContainer.appendChild(iframe);
    });
}


