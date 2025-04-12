// 🌾 Smart Agriculture Chatbot with Weather Integration 🌦️
// ------------------------------------------------------------

// Global variables to track status
let isFetchingWeather = false;
let isProcessing = false;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initChatbot();
});

// 🎯 Initialize Event Listeners Properly
function initChatbot() {
  const input = document.getElementById("userInput");
  const sendBtn = document.querySelector(".send-button");

  // Handle Enter key
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Handle send button click
  sendBtn.addEventListener("click", sendMessage);

  // Welcome message
  appendMessage(
    "bot",
    "Hello! I'm your FarmSmart Assistant. Ask me about weather, crops, pests, or farming advice."
  );
}
// let iCount=1;
// // 🔄 Main Send Message Function
// async function sendMessage() {
//   if (isProcessing) return;

//   const input = document.getElementById("userInput");
//   const message = input.value.trim();
//   if (!message) return;

//   isProcessing = true;
//   input.disabled = true;

//   try {
//     appendMessage("user", message);
//     input.value = "";

//     // Show typing indicator
//     const typingIndicator = showTypingIndicator();

//     // Simulate API call (replace with your actual API endpoint)
//     const response = await fetch("http://localhost:5501/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ message }),
//     });
//     document.querySelector(".searchData").innerHTML += `🔍${iCount}.${message.trim(10)};<br><hr>`
//     iCount++;

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     removeTypingIndicator(typingIndicator);
//     if (data.Predicted_tag && data.Predicted_tag.includes("crop_disease")) {
//       appendMessage("bot", data.reply, data.Predicted_tag);
//       appendMessage("bot","Checking Your Uploaded Image....Please Wait...",data.Predicted_tag);

//     }

//    else if (
//       data.Predicted_tag &&
//       (data.Predicted_tag.includes("weather") ||
//         data.Predicted_tag.includes("get_weather_by_location") ||
//         data.Predicted_tag.includes("get_weather_auto_location"))
//     ) {
//       await handleWeatherResponse(data.reply, message);
//     } else if (data.Predicted_tag && data.Predicted_tag.includes("imd")) {
//         appendMessage("bot", data.reply,data.Predicted_tag);
//     }
//         else if(data.Predicted_tag && data.Predicted_tag.includes("crop_disease")) {
//         appendMessage("bot", data.reply,data.Predicted_tag);
//         }
//     else {
//       appendMessage("bot", data.reply, data.Predicted_tag);
//     }

//   } catch (error) {
//     console.error("Chatbot error:", error);
//     appendMessage(
//       "bot",
//       "⚠️ Sorry, I'm having trouble responding. Please try again later."
//     );
//   } finally {
//     isProcessing = false;
//     input.disabled = false;
//     input.focus();
//   }
// }

// let isProcessing = false;
let contextHistory = []; // Store last 5 messages
let iCount = 1;
// let isProcessing = false; // Added missing declaration

async function sendMessage() {
  if (isProcessing) return;

  const input = document.getElementById("userInput");
  const message = input.value.trim();
  const file = imageInput.files[0]; // Get file if any

  if (!message && !file) return;

  isProcessing = true;
  input.disabled = true;

  try {
    // Store and show user message
    if (message) {
      appendMessage("user", message);
      contextHistory.push({ role: "user", content: message });
    }

    // Handle image upload separately if no message
    if (file && !message) {
      appendMessage("user", "[Image Uploaded]");
      contextHistory.push({ role: "user", content: "[Image Uploaded]" });
    }

    // Keep last 5 messages
    if (contextHistory.length > 5) {
      contextHistory = contextHistory.slice(-5);
    }

    input.value = "";
    const typingIndicator = showTypingIndicator();

    // Prepare form data
    const formData = new FormData();
    if (file) formData.append("image", file);
    if (message) formData.append("message", message);
    formData.append("context", JSON.stringify(contextHistory));

    const response = await fetch("http://localhost:5501/api/chat", {
      method: "POST",
      body: formData, // Let browser set Content-Type with boundary
    });

    // Update search history
    const searchData = document.querySelector(".searchData");
    if (searchData) {
      searchData.innerHTML += `🔍${iCount}.${message || "[Image]"};<br><hr>`;
      iCount++;
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    removeTypingIndicator(typingIndicator);

    // Store bot reply in context
    if (data.reply) {
      contextHistory.push({ role: "bot", content: data.reply });
    }

    // Handle by intent
    if (data.Predicted_tag?.includes("crop_disease")) {
      appendMessage("bot", data.reply, data.Predicted_tag);
      appendMessage(
        "bot",
        "Checking your uploaded image… Please wait…",
        data.Predicted_tag
      );

      if (data.image_url) {
        appendImage(data.image_url);
        showCropSelection(data.image_url);
      }
    } else if (data.Predicted_tag?.includes("weather")) {
      await handleWeatherResponse(data.reply, message);
    } else if (data.reply) {
      appendMessage("bot", data.reply, data.Predicted_tag);
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    appendMessage(
      "bot",
      "⚠️ Sorry, I'm having trouble responding. Please try again later."
    );
  } finally {
    isProcessing = false;
    input.disabled = false;
    input.focus();
    imageInput.value = ""; // Reset image input
    filenameDisplay.textContent = "";
  }
}

// Initialize image upload elements if they exist
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const filenameDisplay = document.querySelector(".TextImg");

if (uploadBtn && imageInput && filenameDisplay) {
  uploadBtn.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    filenameDisplay.textContent = file ? "✅Image Uploaded" : "";
  });
}

// 🌦️ Handle Weather Responses
async function handleWeatherResponse(reply, userMessage) {
  // First show the bot's textual response
  appendMessage("bot", reply, ["weather"]);

  // Try to extract location from user message
  const locationMatch =
    userMessage.match(/(weather|forecast|temperature).*(in|at|for) (.+)/i) ||
    userMessage.match(/(in|at|for) (.+)/i);
  const locationQuery = locationMatch
    ? locationMatch[locationMatch.length - 1]
    : null;

  try {
    if (locationQuery) {
      // Show loading message for specific location
      const loadingId = showLoadingMessage(
        `Fetching weather data for ${locationQuery}...`
      );

      try {
        const coords = await geocodeLocation(locationQuery);
        await displayFarmWeather(
          coords.latitude,
          coords.longitude,
          locationQuery
        );
        removeLoadingMessage(loadingId);
      } catch (error) {
        removeLoadingMessage(loadingId);
        appendMessage(
          "bot",
          `⚠️ Couldn't find weather for ${locationQuery}. Trying your current location...`
        );
        await tryCurrentLocationWeather();
      }
    } else {
      // No specific location mentioned - try current location
      await tryCurrentLocationWeather();
    }
  } catch (error) {
    console.error("Weather fetch error:", error);
    appendMessage(
      "bot",
      "⚠️ Failed to load weather data. Please try again later."
    );
  }
}

// 🌍 Try to Get Current Location Weather
async function tryCurrentLocationWeather() {
  if (!navigator.geolocation) {
    appendMessage(
      "bot",
      "⚠️ Location services not available. Please enable them or specify a location."
    );
    return;
  }

  const loadingId = showLoadingMessage("Detecting your location...");

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
      });
    });

    removeLoadingMessage(loadingId);
    const location = await reverseGeocode(
      position.coords.latitude,
      position.coords.longitude
    );
    await displayFarmWeather(
      position.coords.latitude,
      position.coords.longitude,
      location.city || "your location"
    );
  } catch (error) {
    removeLoadingMessage(loadingId);
    appendMessage(
      "bot",
      "⚠️ Couldn't detect your location. Showing default weather..."
    );
    await displayFarmWeather(20.5937, 78.9629, "Central Farmlands");
  }
}

// 🌤️ Display Weather Information
async function displayFarmWeather(latitude, longitude, locationName) {
  if (isFetchingWeather) return;
  isFetchingWeather = true;

  try {
    const apiKey = "KEY1";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error("Weather API error");
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    createWeatherCard(currentData, forecastData, locationName);
  } catch (error) {
    console.error("Weather fetch error:", error);
    throw error;
  } finally {
    isFetchingWeather = false;
  }
}

//Miscellaneous functions
function copyDivContent() {
  const content = document.querySelector(".farm-weather-card").innerText;
  navigator.clipboard
    .writeText(content)
    .then(() => {
      alert("✅ Content copied to clipboard!");
    })
    .catch((err) => {
      alert("❌ Failed to copy: " + err);
    });
}

function downloadDivAsImage() {
  const div = document.querySelector(".farm-weather-card");
  html2canvas(div).then((canvas) => {
    const link = document.createElement("a");
    link.download = "farmer_update.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// Text-to-Speech using Swara-style Hindi voice
let isPaused = false;
let currentUtterance = null;


// Speak the div content
function speakContent() {
  const content = document.querySelector(".farm-weather-card").innerText;
  const utterance = new SpeechSynthesisUtterance(content);

  // Voice Settings: look for Swara or fallback to Hindi
  const voices = speechSynthesis.getVoices();
  const swaraVoice = voices.find(
    (v) => v.name.toLowerCase().includes("swara") || v.lang === "hi-IN"
  );

  if (swaraVoice) {
    utterance.voice = swaraVoice;
  }

  // Make it farmer-friendly
  utterance.pitch = 1.5; // High pitch
  utterance.rate = 0.8; // Slower pace
  utterance.volume = 1;

  // Speak and keep reference
  currentUtterance = utterance;
  speechSynthesis.speak(utterance);
  isPaused = false;
}

// Pause/Resume speech
function pauseSpeech() {
  if (speechSynthesis.speaking) {
    if (!isPaused) {
      speechSynthesis.pause();
      isPaused = true;
    } else {
      speechSynthesis.resume();
      isPaused = false;
    }
  }
}
// Preload voices (some browsers require interaction before listing)
window.speechSynthesis.onvoiceschanged = function() {
    speechSynthesis.getVoices();
};

// 🖼️ Create Weather Card
function createWeatherCard(currentData, forecastData, locationName) {
  const chatWindow = document.getElementById("chatWindow");
  const weatherCard = document.createElement("div");
  weatherCard.className = "farm-weather-card";

  weatherCard.innerHTML = `
                    <div class="weather-location">
                        <h2>🌱 ${locationName || currentData.name}</h2>
                        <p>${new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</p>
                    </div>
                    <div class="current-conditions" style="font-size:25px;">
                        <div class="weather-visual">
                            <div class="weather-icon ${getWeatherClass(
                              currentData.weather[0].main
                            )}">
                                ${getWeatherEmoji(currentData.weather[0].main)}
                            </div>
                            <div class="temp-display">
                                <span class="current-temp">${Math.round(
                                  currentData.main.temp
                                )}°C</span>
                                <span class="feels-like">Feels like ${Math.round(
                                  currentData.main.feels_like
                                )}°C</span>
                            </div>
                        </div>
                    </div>
                    <div class="weather-details-grid">
                        <div class="detail-item">
                            <span class="detail-icon">💧</span>
                            <span class="detail-value">${
                              currentData.main.humidity
                            }% Humidity</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🌬️</span>
                            <span class="detail-value">${
                              currentData.wind.speed
                            } m/s Wind</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">☀️</span>
                            <span class="detail-value">${
                              currentData.main.pressure
                            } hPa</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">👁️</span>
                            <span class="detail-value">${
                              currentData.visibility / 1000
                            } km Visibility</span>
                        </div>
                    </div>
                    <div class="farming-tips">
                        <h3>🌾 Farming Advisory</h3>
                        <p>${getFarmingRecommendations(
                          currentData,
                          forecastData
                        )}</p>
                    </div>
                    <div class="forecast-section">
                        <h3>📅 3-Day Outlook</h3>
                        <div class="forecast-days">
                            ${[1, 2, 3]
                              .map((i) => {
                                const dayForecast = forecastData.list[i * 8];
                                return `
                                    <div class="forecast-day">
                                        <div class="forecast-date">${new Date(
                                          dayForecast.dt * 1000
                                        ).toLocaleDateString("en-US", {
                                          weekday: "short",
                                        })}</div>
                                        <div class="forecast-icon ${getWeatherClass(
                                          dayForecast.weather[0].main
                                        )}">
                                            ${getWeatherEmoji(
                                              dayForecast.weather[0].main
                                            )}
                                        </div>
                                        <div class="forecast-temp">
                                            <span>${Math.round(
                                              dayForecast.main.temp_max
                                            )}°</span>/<span>${Math.round(
                                  dayForecast.main.temp_min
                                )}°</span>
                                        </div>
                                    </div>
                                `;
                              })
                              .join("")}
                        </div>
                        </div>
                      <div class="weather-footer text-center mt-4"></div>
</div>
                `;
                buttonSection=document.createElement("div");
               buttonSection.innerHTML = `
<div class="container mt-4">
  <p class="mb-3 fw-semibold text-primary">
    <i class="bi bi-cloud-sun-fill me-2"></i>Choose an option below for weather info:
  </p>

  <!-- Horizontal button group with consistent sizing -->
  <div class="d-flex flex-wrap gap-3 justify-content-center">
    <!-- Detailed Weather -->
    <a href="http://localhost:3000/weather/weatherDisplay" target="_blank"
       class="btn btn-primary d-flex align-items-center gap-2">
      <i class="bi bi-cloud-sun"></i> Detailed Weather
    </a>
      <a href="http://localhost:3000/weather/weatherDetail" target="_blank"
       class="btn btn-primary d-flex align-items-center gap-2">
      <i class="bi bi-cloud-sun"></i>Summarized Crop-Specific Weather Information
    </a>

    <!-- Audio Weather -->
    <a href="http://localhost:3000/weather/weatherDisplay" target="_blank"
       class="btn btn-success d-flex align-items-center gap-2">
      <i class="bi bi-megaphone"></i> Audio Report
    </a>

    <!-- Copy -->
    <button onclick="copyDivContent()"
            class="btn btn-outline-primary d-flex align-items-center gap-2">
      <i class="bi bi-clipboard"></i> Copy
    </button>

    <!-- Download -->
    <button onclick="downloadDivAsImage()"
            class="btn btn-outline-success d-flex align-items-center gap-2">
      <i class="bi bi-download"></i> Download
    </button>

    <!-- Speak -->
    <button onclick="speakContent()"
            class="btn btn-info d-flex align-items-center gap-2">
      <i class="bi bi-volume-up"></i> Speak
    </button>

    <!-- Pause/Resume -->
    <button onclick="pauseSpeech()"
            class="btn btn-secondary d-flex align-items-center gap-2">
      <i class="bi bi-pause-btn"></i> Pause
    </button>
  </div>
</div>
`;

  chatWindow.appendChild(weatherCard);
  chatWindow.appendChild(buttonSection);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 🌾 Get Farming Recommendations
function getFarmingRecommendations(currentData, forecastData) {
  const conditions = currentData.weather[0].main.toLowerCase();
  const temp = currentData.main.temp;
  const rainForecast = forecastData.list.some(
    (item) => item.weather[0].main === "Rain"
  );

  if (conditions.includes("rain")) {
    return "Ideal for rice cultivation. Avoid spraying pesticides as rain will wash them away. Good for water-intensive crops.";
  } else if (temp > 30) {
    return "High temperatures detected. Increase irrigation for sensitive crops. Provide shading for young plants.";
  } else if (temp < 5) {
    return "Frost warning! Protect sensitive crops with covers. Delay planting warm-season crops.";
  } else if (rainForecast) {
    return "Rain expected soon. Good time to fertilize as rain helps nutrients penetrate soil. Prepare drainage.";
  } else {
    return "Moderate conditions favorable for most crops. Good day for fieldwork and planting.";
  }
}

// 🌍 Geocode Location from Place Name
async function geocodeLocation(placeName) {
  try {
    const apiKey = "KEY2";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      placeName
    )}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        latitude: data.results[0].geometry.lat,
        longitude: data.results[0].geometry.lng,
      };
    }
    throw new Error("Location not found");
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
}

// 📍 Reverse Geocode to Get City Name from Coordinates
async function reverseGeocode(latitude, longitude) {
  try {
    const apiKey = "KEY3";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].components;
      return {
        city:
          location.city || location.town || location.village || location.county,
        country: location.country || "Unknown country",
      };
    }
    throw new Error("No results found");
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return { city: "Unknown location", country: "" };
  }
}

// 🌤️ Weather Visualization Helpers
function getWeatherClass(weatherCondition) {
  const condition = weatherCondition.toLowerCase();
  if (condition.includes("rain")) return "weather-rainy";
  if (condition.includes("cloud")) return "weather-cloudy";
  if (condition.includes("clear")) return "weather-sunny";
  if (condition.includes("snow")) return "weather-snowy";
  if (condition.includes("thunder")) return "weather-stormy";
  return "weather-fair";
}

function getWeatherEmoji(weatherCondition) {
  const condition = weatherCondition.toLowerCase();
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("clear")) return "☀️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("thunder")) return "⛈️";
  return "🌤️";
}

// 💬 Append Message to Chat Window
function appendMessage(sender, text, tag) {
  const chatWindow = document.getElementById("chatWindow");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  if (tag && tag.includes("weather")) {
    msg.innerHTML = `<div class="weather-response">🌦️ ${text}</div>`;
  } else {
    msg.innerHTML = text;
  }

  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function appendImage(url, sender = "bot") {
  const chatWindow = document.getElementById("chatWindow");

  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  const img = document.createElement("img");
  img.src = url;
  img.alt = "Uploaded Image";
  img.style.maxWidth = "200px";
  img.style.borderRadius = "10px";
  img.style.marginTop = "8px";

  msg.appendChild(img);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}


// ⏳ Show Typing Indicator
function showTypingIndicator() {
  const id = "typing-" + Date.now();
  const chatWindow = document.getElementById("chatWindow");
  const indicator = document.createElement("div");
  indicator.id = id;
  indicator.className = "message bot typing-indicator";
  indicator.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatWindow.appendChild(indicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return id;
}

// ❌ Remove Typing Indicator
function removeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) element.remove();
}

// ⏳ Show Loading Message
function showLoadingMessage(text) {
  const loadingId = "loading-" + Date.now();
  const loadingMsg = document.createElement("div");
  loadingMsg.id = loadingId;
  loadingMsg.className = "message bot loading-message";
  loadingMsg.innerHTML = `<div class="weather-loading">⏳ ${text}</div>`;
  document.getElementById("chatWindow").appendChild(loadingMsg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return loadingId;
}

// ❌ Remove Loading Message
function removeLoadingMessage(id) {
  const element = document.getElementById(id);
  if (element) element.remove();
}

// 🚜 Quick Question Buttons
function quickQuestion(type) {
  const questions = {
    weather: "What's the weather forecast for my farm?",
    crops: "What crops are best to plant this season?",
    pests: "How can I identify and treat common crop pests?",
    fertilizer: "What's the best fertilizer for rice cultivation?",
  };

  const input = document.getElementById("userInput");
  input.value = questions[type];
  input.focus();
}

/**
 * Uploads image and crop data to server for disease analysis
 * @param {string} crop_name - Name of the selected crop
 * @param {File|string} url_image - Image file or URL to analyze
 */
function sendMessageWithCrop(crop_name, url_image) {
  // Validate inputs
  if (!crop_name || typeof crop_name !== 'string') {
    console.error('Invalid crop name:', crop_name);
    return appendMessage('bot', 'Please select a valid crop.', 'crop_disease');
  }

  if (!url_image) {
    return appendMessage('bot', 'Please provide an image for analysis.', 'crop_disease');
  }

  // Show loading message
  appendMessage(
    'bot',
    `🔍 Analyzing your ${crop_name} image for diseases... Please wait.`,
    'crop_disease'
  );

  const formData = new FormData();
  formData.append('crop', crop_name);

  // Handle both File objects and URLs
  if (url_image instanceof File) {
    formData.append('file', url_image);
    uploadToServer(formData, crop_name);
  } else if (typeof url_image === 'string') {
    fetchImageAsFile(url_image)
      .then(file => {
        formData.append('file', file);
        uploadToServer(formData, crop_name);
      })
      .catch(error => {
        console.error('Image processing error:', error);
        appendMessage(
          'bot',
          '⚠️ Could not process the image. Please try another image.',
          'crop_disease'
        );
      });
  } else {
    appendMessage(
      'bot',
      '⚠️ Invalid image format. Please upload a proper image file.',
      'crop_disease'
    );
  }
}

/**
 * Fetches image from URL and converts to File object
 * @param {string} url - Image URL
 * @returns {Promise<File>}
 */
async function fetchImageAsFile(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.blob();
    })
    .then(blob => {
      if (!blob.type.startsWith('image/')) {
        throw new Error('File is not an image');
      }
      return new File([blob], 'uploaded_image.jpg', { type: blob.type });
    });
}

/**
 * Uploads data to server for processing
 * @param {FormData} formData - Form data with image and crop info
 * @param {string} cropName - Name of the crop
 */
function uploadToServer(formData, cropName) {
  fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data) throw new Error('Empty response from server');
      validateServerData(data);
      displayResultsCard(cropName, data);
    })
    .catch(error => {
      console.error('Upload error:', error);
      appendMessage('bot', '⚠️ Server error. Please try again later.', 'crop_disease');
    });
}

function sendMessageWithCrop(crop_name, url_image) {
  // Show loading message to user
  appendMessage(
    "bot",
    `Your Selected Crop is: ${crop_name}. Please wait while we analyze the image...`,
    "crop_disease"
  );

  // Create FormData and append the image file and crop name
  const formData = new FormData();

  // Check if url_image is a File object or a path
  if (url_image instanceof File) {
    formData.append("file", url_image);
  } else {
    // If it's a URL, we need to fetch it first and convert to Blob
    fetch(url_image)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "uploaded_image.jpg", {
          type: blob.type,
        });
        formData.append("file", file);
        formData.append("crop", crop_name);
        return uploadToServer(formData,url_image,crop_name);
      })
      .catch((error) => handleUploadError(error));
    return;
  }

  formData.append("crop", crop_name);
  uploadToServer(formData);
}

/**
 * Handles the image upload and displays results in a card format
 * @param {FormData} formData - Form data containing image and crop info
 * @param {string} imageUrl - Original image URL
 * @param {string} crop_name - Name of the selected crop
 */
function uploadToServer(formData, imageUrl, crop_name) {
  fetch("http://localhost:5000/api/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("✅ Server Response:", data);
      displayResultCard(data, crop_name, imageUrl);
    })
    .catch((error) => {
      console.error("❌ Upload Error:", error);
      appendMessage(
        "bot",
        "⚠️ Sorry, we encountered an error processing your image. Please try again.",
        "crop_disease"
      );
    });
}

/**
 * Displays the analysis results in a well-formatted card
 * @param {object} data - Analysis results from server
 * @param {string} cropName - Name of the analyzed crop
 * @param {string} originalImageUrl - URL of the original uploaded image
 */
function displayResultCard(data, cropName, originalImageUrl) {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) {
    console.error("Chat window not found");
    return;
  }

  // Create card container
  const card = document.createElement("div");
  card.className = "result-card";

  // Card Header
  const header = document.createElement("div");
  header.className = "card-header";
  header.innerHTML = `<h3>🌱 Crop Disease Analysis</h3>`;
  card.appendChild(header);

  // Image Container
  const imageContainer = document.createElement("div");
  imageContainer.className = "card-image-container";

  // Original Image
  if (originalImageUrl) {
    const originalImg = document.createElement("div");
    originalImg.className = "image-box";
    originalImg.innerHTML = `
      <p class="image-label">Original Image</p>
      <img src="${originalImageUrl}" alt="Original crop image" loading="lazy">
    `;
    imageContainer.appendChild(originalImg);
  }

  // Processed Image (if available)
  if (data.image_url) {
    const processedImg = document.createElement("div");
    processedImg.className = "image-box";
    processedImg.innerHTML = `
      <p class="image-label">Analysis Result</p>
      <img src="${data.image_url}" alt="Processed crop image" loading="lazy">
    `;
    imageContainer.appendChild(processedImg);
  }

  card.appendChild(imageContainer);

  // Results Body
  const body = document.createElement("div");
  body.className = "card-body";

  // Helper function to create consistent info rows
  const createInfoRow = (label, value, icon) => {
    const row = document.createElement("div");
    row.className = "info-row";
    row.innerHTML = `
      <span class="info-label">${icon} ${label}:</span>
      <span class="info-value">${value || "Not available"}</span>
    `;
    return row;
  };

  // Add information rows
  body.appendChild(createInfoRow("Crop Type", cropName, "🌾"));
  body.appendChild(createInfoRow("Disease Detected", data.prediction || data.Prediction, "🔍"));

  // Format confidence percentage
  const confidence = data.confidence;
  const confidenceValue = `${confidence}`;
  body.appendChild(createInfoRow("Confidence Level", confidenceValue, "📊"));

  // Add treatment suggestions if available
  if (data.suggestions || data.treatment_advice) {
    const suggestionsDiv = document.createElement("div");
    suggestionsDiv.className = "suggestions-box";
    suggestionsDiv.innerHTML = `
      <div class="suggestions-header">💡 Recommendations</div>
      <div class="suggestions-content">
        ${data.suggestions || data.treatment_advice}
      </div>
    `;
    body.appendChild(suggestionsDiv);
  }
  const buttonsdiv=document.createElement("div");
  buttonsdiv.innerHTML = `<div class="btn-container">
    <button class="btn btn-primary" onclick="openLink('http://localhost:3000/cropMonitoring/Crop/DiseasePrediction')">Detailed Information</button>
    <button class="btn btn-success" onclick="openLink('http://localhost:3000/cropMonitoring/crop/Community')">Community-Support</button>
    <button class="btn btn-warning" onclick="openLink('http://localhost:3000/Contact/us')">Help and Support</button>
    <button class="btn btn-danger" onclick="openLink('http://localhost:3000/cropMonitoring/Crop/DiseasePrediction')">Related Images and Detailed Reports</button>
  </div>`;
  card.appendChild(body);
  card.appendChild(buttonsdiv);
  chatWindow.appendChild(card);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Add styles if they don't exist
  addCardStyles();
}

function openLink(url) {
  window.open(url, "_blank");
}
/**
 * Adds the required CSS styles for the card if they're not already present
 */
function addCardStyles() {
  const styleId = 'crop-disease-card-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .result-card {
      border-radius: 10px;
      min-height:555px;
      width:90%;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin: 15px 0;
      background: white;
      max-width: 600px;
      border: 1px solid #e0e0e0;
    }

    .card-header {
      background: #4CAF50;
      color: white;
      padding: 12px 15px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-image-container {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: #f8f8f8;
      border-bottom: 1px solid #eee;
      flex-wrap: wrap;
    }

    .image-box {
      flex: 1;
      min-width: 250px;
    }

    .image-box img {
      width: 100%;
      max-height: 200px;
      object-fit: contain;
      border-radius: 5px;
      border: 1px solid #ddd;
      background: white;
    }

    .image-label {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
      color: #666;
      font-weight: bold;
    }

    .card-body {
      padding: 15px;
    }

    .info-row {
      display: flex;
      margin-bottom: 10px;
      align-items: center;
    }

    .info-label {
      font-weight: bold;
      min-width: 150px;
      color: #555;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .info-value {
      flex: 1;
      word-break: break-word;
    }

    .suggestions-box {
      margin-top: 20px;
      padding: 12px;
      background: #f0f7ff;
      border-radius: 5px;
      border-left: 4px solid #2196F3;
    }

    .suggestions-header {
      font-weight: bold;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2196F3;
    }

    .suggestions-content {
      line-height: 1.5;
    }
  `;

  document.head.appendChild(style);
}
// Helper function for error handling
function handleUploadError(error) {
  console.error("❌ Image Processing Error:", error);
  appendMessage(
    "bot",
    "Sorry, we couldn't process your image. Please try again with a different image.",
    "crop_disease"
  );
}

function showCropSelection(url) {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) {
    console.error("Chat window element not found");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "message bot crop-selection";

  const label = document.createElement("p");
  label.textContent = "🌾 Please select the crop for disease diagnosis:";
  label.style.marginBottom = "10px";
  label.style.fontWeight = "bold";
  wrapper.appendChild(label);

  const cropContainer = document.createElement("div");
  cropContainer.className = "crop-button-group";

  const crops = ["Potato", "Cotton", "Others"];
  crops.forEach((crop) => {
    const btn = document.createElement("button");
    btn.textContent = crop;
    btn.className = "crop-btn styled-btn";
    btn.onclick = () => {
      // Remove the selection UI immediately
      wrapper.remove();
      // Start the upload process
      sendMessageWithCrop(crop, url);
    };
    cropContainer.appendChild(btn);
  });

  wrapper.appendChild(cropContainer);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

//Input using speaking
const mic = document.getElementById("mic");
const textInput = document.getElementById("userInput");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  // Use Indian language setting to understand both Hindi and Indian-accented English
  // recognition.lang = "hi-IN";

  mic.addEventListener("click", () => {
    try {
      textInput.value = "Listening...";
      recognition.start();
    } catch (err) {
      console.error("Recognition error:", err);
    }
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    textInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    textInput.value = "Speech recognition error.";
  };

  recognition.onend = () => {
    if (textInput.value === "Listening...") {
      textInput.value = "No speech detected.";
    }
  };
} else {
  console.warn("Speech Recognition not supported in this browser.");
  if (textInput) {
    textInput.value = "Speech recognition not supported.";
  }
}
