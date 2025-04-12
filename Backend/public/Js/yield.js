async function fetchPrediction(event) {
  event.preventDefault(); // Prevent default form submission

  let form = document.getElementById("predictionForm");
  let formData = new URLSearchParams(new FormData(form)); // Convert FormData to URL params

  let latitude = document.getElementById("latitude").value;
  let longitude = document.getElementById("longitude").value;

  if (!latitude || !longitude) {
    alert("❌ Location data is missing! Enable location services.");
    return;
  }

  try {
    let response = await fetch("http://localhost:5501/crop/Yield-prediction", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result = await response.json();

    // Display basic prediction results
    let resultDiv = document.getElementById("predictionResult");
    resultDiv.innerHTML = `
            <p>✅ <strong>Predicted Yield:</strong> ${result[
              "Predicted Yield (tons/hectare)"
            ].toFixed(2)} tons/hectare</p>
            <p>🌾 <strong>In Quintals per Acre:</strong> ${result[
              "Predicted Yield (quintals/acre)"
            ].toFixed(2)} quintals/acre</p>
        `;

    // Get additional insights from Gemini
    await sendToGemini(result);
  } catch (error) {
    console.error("❌ Error:", error);
    document.getElementById("predictionResult").innerHTML = `
            <p style="color: red;">❌ Error: ${
              error.message || "Failed to fetch prediction"
            }</p>
        `;
  }
}

async function sendToGemini(result) {
  const API_KEY = "KEY4"; // 🔑 Replace with your Gemini API key

  const prompt = `
You are a farmer-friendly AI agriculture assistant. Based on the following data:

📍 Region: ${result.Region}
🌾 Crop: ${result["Crop Type"]}
🌱 Soil: ${result["Soil Type"]}
☁️ Weather: ${result["Weather Condition"]}
📌 Location: Latitude ${result.Latitude}, Longitude ${result.Longitude}
📅 Days to Harvest: ${result.Days}
🧪 Fertilizer Level (1-3): ${result.Fertilizer}
🚿 Irrigation Level (1-3): ${result.Irrigation}
🌧️ Annual Rainfall Estimate: ${result["Estimated Annual Rainfall"]} mm

📈 Predicted Yield:
• ${result["Predicted Yield (tons/hectare)"].toFixed(2)} tons/hectare
• ${result["Predicted Yield (quintals/acre)"].toFixed(2)} quintals/acre

Please give a report in SIMPLE FARMER LANGUAGE with:
1. Crop performance summary.
2. Advice on fertilizer and irrigation.
3. Weather-based tips or warnings.
4. Any crop risk factors.
Keep it friendly, brief, and include emojis.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
              role: "user",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ No extra advice available.";

    const insightsDiv =
      document.getElementById("predictionResult1")

    insightsDiv.innerHTML += `
      <div style="
        background: #f3fdf3;
        border-left: 6px solid #34a853;
        padding: 16px;
        font-size: 20px;
        margin:30px;
        padding: 30px;
        margin-top: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        font-family: 'Segoe UI', sans-serif;
      ">
        <h3 style="color: #2e7d32; margin-bottom: 10px;">🌿 AI Farming Advice</h3>
        <div style="line-height: 1.6; font-size: 20px; margin:30px;
        padding: 30px; color: #333;">
          ${reply.replace(/\n/g, "<br>")}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error getting insights:", error);
    const insightsDiv =
      document.getElementById("predictionResult1") ||
      document.getElementById("predictionResult");
    insightsDiv.innerHTML += `
      <div style="color: #b71c1c; margin-top: 10px;">
        ⚠️ Gemini insights could not be fetched: ${
          error.message || "Unknown error"
        }
      </div>
    `;
  }
}


//Crop Recommendation code
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getRecommendedCrops(latitude, longitude) {
  try {
    console.log("📢 Fetching Recommended Crops for:", latitude, longitude);

    // ✅ Show Loading Message Before Fetching
    document.getElementById(
      "outputR"
    ).innerHTML = `<p style="color: blue;">⏳ Fetching recommended crops...</p>`;

    const response = await fetch("http://localhost:5501/recommend-crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: latitude, longitude: longitude }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("❌ Error:", data.error);
      document.getElementById(
        "outputR"
      ).innerHTML = `<p style="color: red;">❌ ${data.error}</p>`;
    } else {
      let stateName = data.state ? data.state : "Unknown"; // ✅ Handle missing state
      let resultHTML = `<h3>📍 Location: ${stateName}</h3>`;
      resultHTML += `<h3>🌾 Top 3 Recommended Crops</h3><ul>`;

      data.recommended_crops.forEach((crop) => {
        resultHTML += `<li><b>${crop.crop}</b>: ${crop.probability}% probability</li>`;
      });

      resultHTML += `</ul>`;
      document.getElementById("outputR").innerHTML = resultHTML;
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    document.getElementById(
      "outputR"
    ).innerHTML = `<p style="color: red;">❌ Failed to fetch recommendations.</p>`;
  }
}

window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        document.getElementById("latitude").value = position.coords.latitude;
        document.getElementById("longitude").value = position.coords.longitude;
        // getRecommendedCrops(position.coords.latitude, position.coords.longitude);
      },
      function (error) {
        alert("❌ Geolocation failed. Please allow location access.");
        console.error("Geolocation Error:", error);
      }
    );
  } else {
    alert("❌ Geolocation is not supported by this browser.");
  }
};

// window.onload = function () {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//             function (position) {
//                 document.getElementById("latitude").value = position.coords.latitude;
//                 document.getElementById("longitude").value = position.coords.longitude;
//                 getRecommendedCrops(position.coords.latitude, position.coords.longitude);
//             },
//             function (error) {
//                 alert("❌ Geolocation failed. Please allow location access.");
//                 console.error("Geolocation Error:", error);
//             }
//         );
//     } else {
//         alert("❌ Geolocation is not supported by this browser.");
//     }
// };
