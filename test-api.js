const testPayload = {
    title: "Test Mumbai Party",
    venueName: "Test Venue Mumbai",
    citySlug: "mumbai",
    date: "2026-01-26",
    startTime: "23:00",
    sourceType: "automated"
};

fetch("https://www.toocooltoparty.com/api/events", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 953bd82999f04679a0c2622a4b00581a"
    },
    body: JSON.stringify(testPayload)
})
    .then(res => res.json())
    .then(data => console.log("Response:", data))
    .catch(err => console.error("Error:", err));
