// // ✅ Get User's Location
// async function getUserLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(async (position) => {
//             let lat = position.coords.latitude;
//             let lon = position.coords.longitude;

//             console.log(`📍 Latitude: ${lat}, Longitude: ${lon}`);

//             // Reverse Geocode to Find District
//             let district = await getDistrictFromCoords(lat, lon);

//             if (district) {
//                 console.log(`🏙️ Nearest District: ${district}`);
//                 // Fetch IMD Advisory using Gemini Pro 1.5
//                 await fetchIMDAdvisory(district);
//             } else {
//                 console.log("❌ Could not determine the district.");
//             }
//         }, () => {
//             console.log("❌ Location access denied. Enable location services.");
//         });
//     } else {
//         console.log("❌ Geolocation is not supported by this browser.");
//     }
// }

// // ✅ Reverse Geocoding to Get District Name
// async function getDistrictFromCoords(lat, lon) {
//     let apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

//     try {
//         let response = await fetch(apiUrl);
//         let data = await response.json();
//         return data.address.county || data.address.state_district || data.address.state || "Unknown District";
//     } catch (error) {
//         console.log("❌ Error fetching district name:", error);
//         return null;
//     }
// }

// // ✅ Fetch IMD Advisory Using Gemini Pro 1.5
// async function fetchIMDAdvisory(district) {
//     const GEMINI_API_KEY = "AIzaSyBwAw7qquiXFpTxH_74x0WldA_r7jkh7mQ";  // Replace with your valid API Key
//     const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

//     const requestBody = {
//         contents: [{
//             parts: [{
//                 text: `Provide the latest detailed agricultural weather advisory issued by IMD for the district ${district}, India.Web scap the information and show in the format below correctly.
//                 Include:
//                 - Weather Forecast for the next 5 days (Rainfall, Temperature, Humidity).
//                 - Weather Warnings (Thunderstorms, Heatwaves, etc.).
//                 - Crop-Specific Advisory (Wheat, Rice, Mustard, Vegetables, Fruits).
//                 - Livestock & Dairy Recommendations.
//                 - Irrigation Guidelines.
//                 - Pest & Disease Control Measures.`
//             }]
//         }]
//     };

//     try {
//         let response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(requestBody)
//         });

//         let result = await response.json();

//         // ✅ Ensure response contains the expected structure
//         if (result?.candidates?.length > 0 && result.candidates[0]?.content?.parts?.length > 0) {
//             console.log("📢 IMD Advisory:", result.candidates[0].content.parts[0].text);
//         } else {
//             console.log("❌ Unexpected API response format:", result);
//         }
//     } catch (error) {
//         console.log("❌ Error fetching IMD advisory:", error);
//     }
// }

// // ✅ Run Script on Page Load
// document.addEventListener("DOMContentLoaded", getUserLocation);



// ✅ Function to Get IMD Advisory from Gemini API
// async function fetchIMDAdvisory(query) {
//     const GEMINI_API_KEY = "AIzaSyBwAw7qquiXFpTxH_74x0WldA_r7jkh7mQ"; // 🔹 Replace with your valid API Key
//     const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

//     const requestBody = {
//         contents: [{
//             parts: [{
//                 text: `Provide the latest detailed agricultural weather advisory issued by IMD for ${query}, India.
//                 Include:
//                 - Weather Forecast for the next 5 days (Rainfall, Temperature, Humidity).
//                 - Weather Warnings (Thunderstorms, Heatwaves, etc.).
//                 - Crop-Specific Advisory (Wheat, Rice, Mustard, Vegetables, Fruits).
//                 - Livestock & Dairy Recommendations.
//                 - Irrigation Guidelines.
//                 - Pest & Disease Control Measures.
//                 Format the response in structured bullet points.`
//             }]
//         }]
//     };

//     try {
//         let response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(requestBody)
//         });

//         let result = await response.json();

//         // ✅ Check if response contains expected data
//         if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
//             console.log("📢 IMD Advisory for", query, ":\n", result.candidates[0].content.parts[0].text);
//         } else {
//             console.log("❌ Unexpected API response format:", result);
//         }
//     } catch (error) {
//         console.log("❌ Error fetching IMD advisory:", error);
//     }
// }

// // ✅ Example Usage: Search for IMD Advisory for Jhajjar
// fetchIMDAdvisory("Jhajjar, Haryana");



// ✅ Function to Get IMD Advisory from OpenAI API (GPT-4 Turbo)
// ✅ Function to Get IMD Advisory from OpenAI API (GPT-4 Turbo)
// async function fetchIMDAdvisory(query) {
//     const OPENAI_API_KEY = "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"; // 🔹 Replace with your actual OpenAI API Key
//     const url = "https://api.openai.com/v1/chat/completions";

//     const requestBody = {
//         model: "gpt-4o-mini",
//         messages: [{
//             role: "system",
//             content: "You are an assistant that provides accurate agricultural weather advisories from IMD for Indian districts."
//         }, {
//             role: "user",
//             content: `Provide the latest detailed agricultural weather advisory issued by IMD for ${query}, India.
//             Include:
//             - Weather Forecast for the next 5 days (Rainfall, Temperature, Humidity).
//             - Weather Warnings (Thunderstorms, Heatwaves, etc.).
//             - Crop-Specific Advisory (Wheat, Rice, Mustard, Vegetables, Fruits).
//             - Livestock & Dairy Recommendations.
//             - Irrigation Guidelines.
//             - Pest & Disease Control Measures.
//             Format the response in structured bullet points.`
//         }],
//         temperature: 0.7,
//         max_tokens: 500
//     };

//     try {
//         let response = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${OPENAI_API_KEY}`
//             },
//             body: JSON.stringify(requestBody)
//         });

//         let result = await response.json();

//         // ✅ Ensure response contains expected data
//         if (result?.choices?.[0]?.message?.content) {
//             console.log("📢 IMD Advisory for", query, ":\n", result.choices[0].message.content);
//         } else {
//             console.log("❌ Unexpected API response format:", result);
//         }
//     } catch (error) {
//         console.log("❌ Error fetching IMD advisory:", error);
//     }
// }

// // ✅ Example Usage: Search for IMD Advisory for Jhajjar
// fetchIMDAdvisory("Jhajjar, Haryana");
