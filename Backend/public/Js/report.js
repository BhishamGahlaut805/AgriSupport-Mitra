// ✅ Get User's Location
async function getUserLocation111() {
    const statusElement = document.getElementById("status");
    const advisoryResult = document.getElementById("advisoryResult");

    if (navigator.geolocation) {
        statusElement.textContent = "📡 Fetching location... Please wait.";

        navigator.geolocation.getCurrentPosition(async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            console.log(`📍 Latitude: ${lat}, Longitude: ${lon}`);

            let state = await getStateFromCoords(lat, lon);

            if (state !== "Haryana" || state != "haryana" || state != "HARYANA") {
                state = "Haryana";
            }

            if (state) {
                console.log(`🏙️ Detected State: ${state}`);
                statusElement.innerHTML = `✅ Detected State: <b>${state}</b>. Fetching advisory...`;
                fetchIMDAdvisory(state);
            } else {
                statusElement.textContent = "❌ Could not determine the state.";
            }
        }, () => {
            statusElement.textContent = "❌ Location access denied. Enable location services.";
        });
    } else {
        statusElement.textContent = "❌ Geolocation is not supported by this browser.";
    }
}

// ✅ Reverse Geocoding to Get State Name
async function getStateFromCoords(lat, lon) {
    let apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        return "Haryana"
        // return data.address.state || "Haryana";
    } catch (error) {
        console.error("❌ Error fetching state name:", error);
        return null;
    }
}

// ✅ Global Variables
// ✅ Global Variables
let weatherSpeechXYZ = null;
let langXYZ = "en";
let isPausedXYZ = false;
let voiceChangeCountXYZ = 1;
let initialVoiceSetXYZ = false;

// ✅ Get User Location & Fetch Advisory
async function getUserLocationXYZ() {
    const statusElement = document.getElementById("status");
    const advisoryResult = document.getElementById("advisoryResult");

    if (navigator.geolocation) {
        statusElement.textContent = "📡 Fetching location... Please wait.";

        navigator.geolocation.getCurrentPosition(async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            console.log(`📍 Latitude: ${lat}, Longitude: ${lon}`);

            let state = await getStateFromCoordsXYZ(lat, lon);

            if (state) {
                console.log(`🏙️ Detected State: ${state}`);
                statusElement.innerHTML = `✅ Detected State: <b>${state}</b>. Fetching advisory...`;
                fetchCropAdvisoryXYZ(state);
            } else {
                statusElement.textContent = "❌ Could not determine the state.";
            }
        }, () => {
            statusElement.textContent = "❌ Location access denied. Enable location services.";
        });
    } else {
        statusElement.textContent = "❌ Geolocation is not supported by this browser.";
    }
}

// ✅ Reverse Geocoding to Get State Name
async function getStateFromCoordsXYZ(lat, lon) {
    let apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        return data.address.state || "Unknown State";
    } catch (error) {
        console.error("❌ Error fetching state name:", error);
        return null;
    }
}

// ✅ Fetch Crop Advisory
async function fetchCropAdvisoryXYZ(stateName) {
  const statusElement = document.getElementById("status");
  const advisoryResult = document.getElementById("advisoryResult");

  try {
    // Step 1: Fetch from your backend
    let response = await fetch("http://localhost:5501/get_bulletin_text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: stateName }),
    });

    let data = await response.json();

    if (data.error) {
      statusElement.textContent = "❌ Error: " + data.error;
      advisoryResult.innerHTML = "";
      return;
    }

    statusElement.textContent = "✅ Advisory received successfully!";
    let advisoryText = data.bulletin_text;
    let lines = advisoryText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    let pdfIframe = `
        <iframe
            src="http://localhost:5501${data.pdf_url}"
            width="100%"
            height="600px"
            style="border: 1px solid #ccc; border-radius: 8px;"></iframe>`;

    // Try to extract advisory section
    let startIndex = lines.findIndex((line) =>
      line.includes("Crop Advisories and Plant Protection")
    );
    let advisorySection =
      startIndex !== -1 ? lines.slice(startIndex).join("\n") : advisoryText;

    advisoryResult.innerHTML = `
          <h5 class="mb-2">📄 Bulletin for ${data.state}</h5>
          <div id="formattedAdvisory" class="mt-4"><em>Loading formatted summary...</em></div>
          <p><strong>Original Bulletin Text:</strong></p>
          <h6 class="mt-3">🖼️PDF:</h6>
          ${pdfIframe}

        `;

    // Step 2: Send to Gemini 1.5 Pro
    const formattedText = await sendToGemini(advisorySection);
    document.getElementById("formattedAdvisory").innerHTML = `
            <h4>✨Summarized Crop Advisory</h4>
            <p>${formattedText}</p>
        `;
  } catch (error) {
    statusElement.textContent = "❌ Error fetching advisory.";
    console.error("Error:", error);
  }
}

async function sendToGemini(advisoryText) {
  const API_KEY = "AIzaSyBwAw7qquiXFpTxH_74x0WldA_r7jkh7mQ"; // 🔒 Replace with your actual key
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
    API_KEY;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an agriculture assistant.

Summarize and format the following IMD crop advisory bulletin in a farmer-friendly way.
Use clean HTML formatting. The result will be shown inside a webpage.

✅ Format guidelines:
- Use simple and readable fonts (default browser fonts are okay)
- Make section headings bold and slightly larger
- Use bullet points where helpful
- Highlight critical info (e.g., pest warnings, irrigation advice) in bold
- Keep language simple and easy to understand for Indian farmers
- Do not add external CSS or styles, only use basic inline HTML

Bulletin:
${advisoryText}`,
          },
        ],
      },
    ],
  };


  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  const output = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  return output || "⚠️ No formatted summary returned.";
}


// ✅ Format Advisory Content
function formatAdvisoryXYZ(lines) {
    let formattedHTML = `<div class="advisory-container">`;
    let sectionTitle = "";
    let sectionContent = [];

    lines.forEach(line => {
        if (line.includes("WHEAT:") || line.includes("MUSTARD:") || line.includes("BARSEEM:") ||
            line.includes("MAIZE:") || line.includes("VEGETABLES:") || line.includes("FRUITS:") ||
            line.includes("ANIMAL HUSBANDARY")) {

            if (sectionContent.length > 0) {
                formattedHTML += createSectionCardXYZ(sectionTitle, sectionContent);
                sectionContent = [];
            }
            sectionTitle = line;
        } else {
            sectionContent.push(line);
        }
    });

    if (sectionContent.length > 0) {
        formattedHTML += createSectionCardXYZ(sectionTitle, sectionContent);
    }

    formattedHTML += `</div>`;
    return formattedHTML;
}

// ✅ Create Advisory Cards
function createSectionCardXYZ(title, content) {
    return `
        <div class="advisory-card">
            <h3>${getIconXYZ(title)} ${title}</h3>
            <ul>${content.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
    `;
}

// ✅ Assign Icons
function getIconXYZ(title) {
    if (title.includes("WHEAT")) return "🌾";
    if (title.includes("MUSTARD")) return "🌿";
    if (title.includes("BARSEEM")) return "🌱";
    if (title.includes("MAIZE")) return "🌽";
    if (title.includes("VEGETABLES")) return "🥦";
    if (title.includes("FRUITS")) return "🍎";
    if (title.includes("ANIMAL HUSBANDARY")) return "🐄";
    return "📌";
}

// ✅ Read Advisory with Speech
function readWeatherReportXYZ() {
    const synth = window.speechSynthesis;
    if (!synth) {
        alert("❌ Text-to-speech is not supported in your browser.");
        return;
    }
    const report = document.getElementById("advisoryResult").innerText;
    if (report == "") return;

    if (weatherSpeechXYZ) synth.cancel();

    weatherSpeechXYZ = new SpeechSynthesisUtterance(report);
    weatherSpeechXYZ.lang = langXYZ === "hi" ? "hi-IN" : "en-US";
    weatherSpeechXYZ.rate = 0.9;
    weatherSpeechXYZ.pitch = 1;
    weatherSpeechXYZ.volume = 1;

    // ✅ Set Microsoft Swara Voice if available
    const voices = synth.getVoices();
    const swaraVoice = voices.find(voice => voice.name.includes("Microsoft Swara"));
    if (swaraVoice) {
        weatherSpeechXYZ.voice = swaraVoice;
    }

    synth.speak(weatherSpeechXYZ);
}

// ✅ Stop Speech
function stopWeatherSpeechXYZ() {
    if (weatherSpeechXYZ) {
        window.speechSynthesis.cancel();
        weatherSpeechXYZ = null;
        isPausedXYZ = false;
    }
}

// ✅ Change Language
function toggleLanguageXYZ() {
    window.speechSynthesis.cancel();
    langXYZ = langXYZ === "en" ? "hi" : "en";
    console.log(`🌎 Language changed to ${langXYZ === "hi" ? "Hindi" : "English"}`);
    readWeatherReportXYZ();
}

// ✅ Pause Speech on Page Reload (Fixes Overheating)
window.onbeforeunload = function () {
    window.speechSynthesis.cancel();
};

// ✅ Load Microsoft Swara Voice on Page Load
window.speechSynthesis.onvoiceschanged = function () {
    const voices = window.speechSynthesis.getVoices();
    const swaraVoice = voices.find(voice => voice.name.includes("Microsoft Swara"));
    if (swaraVoice) {
        console.log(`✅ Voice Set to: ${swaraVoice.name}`);
    }
};

// // ✅ Load Voices & Advisory with Delay
// window.onload = function () {
//     setTimeout(getUserLocationXYZ, 1500);  // Added delay to prevent CPU overload
// };

