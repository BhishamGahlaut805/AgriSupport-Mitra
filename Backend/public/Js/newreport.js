// const ttsButtonHTML=`<div class="tts-container">
//     <h3>🔊 Listen to Report</h3>
//     <div class="radio-group">
//         <label class="radio-option">
//             <input type="radio" name="language" value="en" checked onchange="changeLanguage('en')"> 🇬🇧 English
//         </label>
//         <label class="radio-option">
//             <input type="radio" name="language" value="hi" onchange="changeLanguage('hi')"> 🇮🇳 हिन्दी (Hindi)
//         </label>
//     </div>
//     <div class="tts-buttons">
//         <button id="tts-button" onclick="startSpeech()" class="btn-large">
//             <span id="mic-icon">🎤</span> Listen
//         </button>
//         <button id="stop-button" onclick="stopSpeech()" class="btn-large btn-danger">
//             ⏹️ Stop
//         </button>
//         <button id="increase-volume" onclick="increaseVolume()" class="btn-large btn-info">
//             🔊 Increase Voice
//         </button>
//         <button id="switch-voice" onclick="switchVoice()" class="btn-large btn-warning">
//             🎙️ Switch Voice
//         </button>
//     </div>
// </div>`;
// document.addEventListener("DOMContentLoaded", function () {
//     const reportContainer = document.getElementById("report-container");

//     // ✅ Get report from localStorage
//     let reportData = localStorage.getItem("cropReport");

//     try {
//         reportData = JSON.parse(reportData);
//     } catch (error) {
//         console.error("❌ Error parsing report data:", error);
//         reportContainer.innerHTML = "<p class='text-danger text-center'>❌ Error loading report.</p>";
//         return;
//     }

//     console.log("✅ Received Crop Report:", reportData);

//     // ✅ Extract data
//     reportContainer.innerHTML += ttsButtonHTML;
//     const {
//         crop = "Unknown",
//         disease = "Unknown",
//         confidence = "N/A",
//         imageUrl = "/images/placeholder.png",
//         pathogen = "N/A",
//         pathogen_type = "N/A",
//         spread = "N/A",
//         favorable_conditions = "N/A",
//         best_practices = [],
//         natural_methods = [],
//         chemical_pesticides = [],
//         ideal_conditions = "N/A",
//         preventive_measures = "N/A",
//         water_fertilization = "N/A",
//         common_threats = "N/A"
//     } = reportData;

//     const isHealthy = disease.toLowerCase().includes("healthy");

//     // ✅ Healthy Crop Section
//     let healthyHTML = `
//                 <div class="report-card healthy">
//                     <h2>🌿 Healthy Crop Report</h2>
//                     <img src="${imageUrl}" alt="Healthy Crop Image">
//                     <p><strong>🌱 Crop:</strong> ${crop}</p>
//                     <p><strong>✅ Status:</strong> Healthy</p>
//                     <p><strong>📊 Confidence:</strong> ${confidence}</p>
//                     <p><strong>🌍 Ideal Conditions:</strong> ${ideal_conditions}</p>
//                     <p><strong>🛑 Preventive Measures:</strong> ${preventive_measures}</p>
//                     <p><strong>💧 Water & Fertilization:</strong> ${water_fertilization}</p>
//                     <p><strong>⚠ Common Threats:</strong> ${common_threats}</p>
//                     <div class="report-section">
//                         <h3>✅ Best Practices</h3>
//                         <ul>
//                             ${best_practices.length > 0
//             ? best_practices.map(p => `<li><strong>${p.practice}:</strong> ${p.description}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                         </ul>
//                         <div class="audio-controls">
//                             <button onclick="playSection(this)" class="btn-audio">▶️ Play</button>
//                             <button onclick="pauseSection(this)" class="btn-audio">⏸️ Pause</button>
//                             <button onclick="increaseVolumeSection(this)" class="btn-audio">🔊 Increase Volume</button>
//                         </div>
//                     </div>
//                 </div>
//             `;

//     // ✅ Diseased Crop Section
//     let diseasedHTML = `
//                 <div class="report-card diseased">
//                     <h2>⚠ Diseased Crop Report</h2>
//                     <img src="${imageUrl}" alt="Diseased Crop Image">
//                     <p><strong>🌱 Crop:</strong> ${crop}</p>
//                     <p><strong>🦠 Disease:</strong> ${disease}</p>
//                     <p><strong>📊 Confidence:</strong> ${confidence}</p>
//                     <p><strong>🧬 Pathogen:</strong> ${pathogen}</p>
//                     <p><strong>🧫 Pathogen Type:</strong> ${pathogen_type}</p>
//                     <p><strong>🔬 Spread:</strong> ${spread}</p>
//                     <p><strong>🌦️ Favorable Conditions:</strong> ${favorable_conditions}</p>

//                     <div class="report-section">
//                         <h3>✅ Best Prevention Practices</h3>
//                         <ul>
//                             ${best_practices.length > 0
//             ? best_practices.map(p => `<li><strong>${p.practice}:</strong> ${p.description}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                         </ul>
//                         <div class="audio-controls">
//                             <button onclick="playSection(this)" class="btn-audio">▶️ Play</button>
//                             <button onclick="pauseSection(this)" class="btn-audio">⏸️ Pause</button>
//                             <button onclick="increaseVolumeSection(this)" class="btn-audio">🔊 Increase Volume</button>
//                         </div>
//                     </div>

//                     <div class="report-section">
//                         <h3>🌿 Natural Treatment Methods</h3>
//                         <ul>
//                             ${natural_methods.length > 0
//             ? natural_methods.map(m => `<li><strong>${m.name}:</strong> ${m.description}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                         </ul>
//                         <div class="audio-controls">
//                             <button onclick="playSection(this)" class="btn-audio">▶️ Play</button>
//                             <button onclick="pauseSection(this)" class="btn-audio">⏸️ Pause</button>
//                             <button onclick="increaseVolumeSection(this)" class="btn-audio">🔊 Increase Volume</button>
//                         </div>
//                     </div>

//                     <div class="report-section">
//                         <h3>🧪 Chemical Pesticides</h3>
//                         <ul>
//                             ${chemical_pesticides.length > 0
//             ? chemical_pesticides.map(p => `<li><strong>${p.name} (Quantity: ${p.quantity}):</strong> ${p.note}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                         </ul>
//                         <div class="audio-controls">
//                             <button onclick="playSection(this)" class="btn-audio">▶️ Play</button>
//                             <button onclick="pauseSection(this)" class="btn-audio">⏸️ Pause</button>
//                             <button onclick="increaseVolumeSection(this)" class="btn-audio">🔊 Increase Volume</button>
//                         </div>
//                     </div>
//                 </div>
//             `;

//     // ✅ Inject into report container
//     reportContainer.innerHTML += isHealthy ? healthyHTML : diseasedHTML;

//     // ✅ Add translation button
//     const translateButton = document.createElement("button");
//     translateButton.id = "translate-button";
//     translateButton.className = "btn-large btn-translate";
//     translateButton.textContent = "🌐 Translate Report";
//     translateButton.onclick = translateReport;
//     reportContainer.prepend(translateButton);
// });



// // ✅ TTS Functions
// let currentUtterance = null; // Track the current speech utterance

// function startSpeech() {
//     const reportText = document.querySelector(".report-card").innerText; // Get the report text
//     const selectedLanguage = document.querySelector('input[name="language"]:checked').value;

//     // Stop any ongoing speech
//     if (currentUtterance) {
//         window.speechSynthesis.cancel();
//     }

//     // Create a new utterance
//     currentUtterance = new SpeechSynthesisUtterance(reportText);
//     currentUtterance.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US"; // Set language
//     currentUtterance.volume = 1; // Default volume
//     currentUtterance.rate = 1; // Default speed
//     currentUtterance.pitch = 1; // Default pitch

//     // Speak the text
//     window.speechSynthesis.speak(currentUtterance);

//     // Update button UI
//     const micIcon = document.getElementById("mic-icon");
//     micIcon.textContent = "🔊"; // Change icon to indicate active speech
// }

// function stopSpeech() {
//     if (currentUtterance) {
//         window.speechSynthesis.cancel(); // Stop speech
//         currentUtterance = null; // Reset utterance
//     }

//     // Update button UI
//     const micIcon = document.getElementById("mic-icon");
//     micIcon.textContent = "🎤"; // Reset icon
// }

// function increaseVolume() {
//     if (currentUtterance) {
//         currentUtterance.volume = Math.min(1, currentUtterance.volume + 0.1); // Increase volume by 10%
//     }
// }

// function switchVoice() {
//     const voices = window.speechSynthesis.getVoices();
//     if (voices.length === 0) {
//         alert("No voices available. Please try again later.");
//         return;
//     }

//     if (currentUtterance) {
//         const currentVoice = currentUtterance.voice;
//         const currentLanguage = currentUtterance.lang;

//         // Find the next voice for the current language
//         const availableVoices = voices.filter(voice => voice.lang === currentLanguage);
//         const currentIndex = availableVoices.findIndex(voice => voice === currentVoice);
//         const nextIndex = (currentIndex + 1) % availableVoices.length;

//         currentUtterance.voice = availableVoices[nextIndex]; // Switch to the next voice
//         window.speechSynthesis.cancel(); // Stop current speech
//         window.speechSynthesis.speak(currentUtterance); // Restart with the new voice
//     }
// }

// // ✅ Translation Function
// function translateReport() {
//     if (!window.google || !window.google.translate) {
//         alert("Google Translate API not loaded!");
//         return;
//     }
//     new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
// }

// // ✅ Audio Control Functions for Sections
// function playSection(button) {
//     const section = button.closest('.report-section');
//     const text = section.innerText;
//     const selectedLanguage = document.querySelector('input[name="language"]:checked').value;

//     // Stop any ongoing speech
//     if (currentUtterance) {
//         window.speechSynthesis.cancel();
//     }

//     // Create a new utterance for the section
//     currentUtterance = new SpeechSynthesisUtterance(text);
//     currentUtterance.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US";
//     window.speechSynthesis.speak(currentUtterance);
// }

// function pauseSection(button) {
//     window.speechSynthesis.pause();
// }

// function increaseVolumeSection(button) {
//     if (currentUtterance) {
//         currentUtterance.volume = Math.min(1, currentUtterance.volume + 0.1); // Increase volume by 10%
//     }
// }

// // ✅ Load voices when the page loads
// window.speechSynthesis.onvoiceschanged = () => {
//     console.log("Voices loaded:", window.speechSynthesis.getVoices());
// };







const ttsButtonHTML = `
<div class="tts-container">
    <div class="tts2"></div>
    <div class="tts1">
    <h3>🔊 Listen to Report</h3>
    <div class="radio-group">
        <label class="radio-option">
            <input type="radio" name="language" value="en" checked onchange="changeLanguage('en')"> 🇬🇧 English
        </label>
        <label class="radio-option">
            <input type="radio" name="language" value="hi" onchange="changeLanguage('hi')"> 🇮🇳 हिन्दी (Hindi)
        </label>
    </div>
    <div class="tts-buttons">
        <button id="tts-button" onclick="startSpeech()" class="btn-large">
            <span id="mic-icon">🎤</span> Listen
        </button>
        <button id="stop-button" onclick="stopSpeech()" class="btn-large btn-danger">
            ⏹️ Stop
        </button>
        <button id="increase-volume" onclick="increaseVolume()" class="btn-large btn-info">
            🔊 Increase Voice
        </button>
        <button id="switch-voice" onclick="switchVoice()" class="btn-large btn-warning">
            🎙️ Switch Voice
        </button>
    </div>
    </div>
</div>`;

document.addEventListener("DOMContentLoaded", function () {
    const reportContainer = document.getElementById("report-container");

    // ✅ Get report from localStorage
    let reportData = localStorage.getItem("cropReport");

    try {
        reportData = JSON.parse(reportData);
    } catch (error) {
        console.error("❌ Error parsing report data:", error);
        reportContainer.innerHTML = "<p class='text-danger text-center'>❌ Error loading report.</p>";
        return;
    }

    console.log("✅ Received Crop Report:", reportData);

    // ✅ Extract data
    reportContainer.innerHTML += ttsButtonHTML;
    const {
        crop = "Unknown",
        disease = "Unknown",
        confidence = "N/A",
        imageUrl = "/images/placeholder.png",
        pathogen = "N/A",
        pathogen_type = "N/A",
        spread = "N/A",
        favorable_conditions = "N/A",
        best_practices = [],
        natural_methods = [],
        chemical_pesticides = [],
        ideal_conditions = "N/A",
        preventive_measures = "N/A",
        water_fertilization = "N/A",
        common_threats = "N/A"
    } = reportData;

    const isHealthy = disease.toLowerCase().includes("healthy");

    // ✅ Healthy Crop Section
    let healthyHTML = `
                <div class="report-card healthy">
                    <h2>🌿 Healthy Crop Report</h2>
                    <img src="${imageUrl}" alt="Healthy Crop Image">
                    <p><strong>🌱 Crop:</strong> ${crop}</p>
                    <p><strong>✅ Status:</strong> Healthy</p>
                    <p><strong>📊 Confidence:</strong> ${confidence}</p>
                    <p><strong>🌍 Ideal Conditions:</strong> ${ideal_conditions}</p>
                    <p><strong>🛑 Preventive Measures:</strong> ${preventive_measures}</p>
                    <p><strong>💧 Water & Fertilization:</strong> ${water_fertilization}</p>
                    <p><strong>⚠ Common Threats:</strong> ${common_threats}</p>
                    <div class="report-section">
                        <h3>✅ Best Practices</h3>
                        <ul>
                            ${best_practices.length > 0
            ? best_practices.map(p => `<li><strong>${p.practice}:</strong> ${p.description}</li>`).join("")
            : "<li>No data available</li>"
        }
                        </ul>
                         <div class="audio-controls">
                    <button onclick="playSection(this)" class="btn-audio">
    <div class="icon-cont"><div class="play-icon"></div><div class="icon-text">Start Listening</div></div>
</button>
                            <button onclick="pauseSection(this)" class="btn-audio">
                            <div class="icon-cont"><div class="pause-icon"></div><div class="icon-text">Stop Listening</div></div>
                            </button>
                            <button onclick="increaseVolumeSection(this)" class="btn-audio"><div class="icon-cont"><div class="vol-icon"></div><div class="icon-text">Raise the Volume</div></div></button>
                        </div>
                    </div>
                </div>
            `;

    // ✅ Diseased Crop Section
    let diseasedHTML = `
                <div class="report-card diseased">
                    <h2>⚠ Diseased Crop Report</h2>
                    <img src="${imageUrl}" alt="Diseased Crop Image">
                    <p><strong>🌱 Crop:</strong> ${crop}</p>
                    <p><strong>🦠 Disease:</strong> ${disease}</p>
                    <p><strong>📊 Confidence:</strong> ${confidence}</p>
                    <p><strong>🧬 Pathogen:</strong> ${pathogen}</p>
                    <p><strong>🧫 Pathogen Type:</strong> ${pathogen_type}</p>
                    <div class="report-section text-white">
                    <p><strong>🔬 Spread:</strong> ${spread}</p>
                     <div class="audio-controls">
                    <button onclick="playSection(this)" class="btn-audio">
    <div class="icon-cont"><div class="play-icon"></div><div class="icon-text">Start Listening</div></div>
</button>
                            <button onclick="pauseSection(this)" class="btn-audio">
                            <div class="icon-cont"><div class="pause-icon"></div><div class="icon-text">Stop Listening</div></div>
                            </button>
                            <button onclick="increaseVolumeSection(this)" class="btn-audio"><div class="icon-cont"><div class="vol-icon"></div><div class="icon-text">Raise the Volume</div></div></button>
                        </div>
                    </div>
                    <div class="report-section text-white">
                    <p><strong>Favorable Conditions:</strong> ${favorable_conditions}</p>
                     <div class="audio-controls">
                    <button onclick="playSection(this)" class="btn-audio">
    <div class="icon-cont"><div class="play-icon"></div><div class="icon-text">Start Listening</div></div>
</button>
                            <button onclick="pauseSection(this)" class="btn-audio">
                            <div class="icon-cont"><div class="pause-icon"></div><div class="icon-text">Stop Listening</div></div>
                            </button>
                            <button onclick="increaseVolumeSection(this)" class="btn-audio"><div class="icon-cont"><div class="vol-icon"></div><div class="icon-text">Raise the Volume</div></div></button>
                        </div>
                    </div>
                    <div class="report-section">
                        <h3>✅ Best Prevention Practices</h3>
                        <ul>
                            ${best_practices.length > 0
            ? best_practices.map(p => `<li><strong>${p.practice}:</strong> ${p.description}</li>`).join("")
            : "<li>No data available</li>"
        }
                        </ul>
                        <div class="audio-controls">
                    <button onclick="playSection(this)" class="btn-audio">
    <div class="icon-cont"><div class="play-icon"></div><div class="icon-text">Start Listening</div></div>
</button>
                            <button onclick="pauseSection(this)" class="btn-audio">
                            <div class="icon-cont"><div class="pause-icon"></div><div class="icon-text">Stop Listening</div></div>
                            </button>
                            <button onclick="increaseVolumeSection(this)" class="btn-audio"><div class="icon-cont"><div class="vol-icon"></div><div class="icon-text">Raise the Volume</div></div></button>
                        </div>
                    </div>

                    <div class="report-section">
                        <h3>Natural Treatment Methods</h3>
                        <ul>
                            ${natural_methods.length > 0
            ? natural_methods.map(m => `<li><strong>${m.name}:</strong> ${m.description}</li>`).join("")
            : "<li>No data available</li>"
        }
                        </ul>
                        <div class="audio-controls">
                    <button onclick="playSection(this)" class="btn-audio">
    <div class="icon-cont"><div class="play-icon"></div><div class="icon-text">Start Listening</div></div>
</button>
                            <button onclick="pauseSection(this)" class="btn-audio">
                            <div class="icon-cont"><div class="pause-icon"></div><div class="icon-text">Stop Listening</div></div>
                            </button>
                            <button onclick="increaseVolumeSection(this)" class="btn-audio"><div class="icon-cont"><div class="vol-icon"></div><div class="icon-text">Raise the Volume</div></div></button>
                        </div>
                    </div>

                    <div class="report-section">
                        <h3>Chemical Pesticides</h3>
                        <ul>
                            ${chemical_pesticides.length > 0
            ? chemical_pesticides.map(p => `<li><strong>${p.name} (Quantity: ${p.quantity}):</strong> ${p.note}</li>`).join("")
            : "<li>No data available</li>"
        }
                        </ul>
                        <div class="audio-controls">
                    <button onclick="playSection(this)" class="btn-audio">
    <div class="icon-cont"><div class="play-icon"></div><div class="icon-text">Start Listening</div></div>
</button>
                            <button onclick="pauseSection(this)" class="btn-audio">
                            <div class="icon-cont"><div class="pause-icon"></div><div class="icon-text">Stop Listening</div></div>
                            </button>
                            <button onclick="increaseVolumeSection(this)" class="btn-audio"><div class="icon-cont"><div class="vol-icon"></div><div class="icon-text">Raise the Volume</div></div></button>
                        </div>
                    </div>
                </div>
            `;

    // ✅ Inject into report container
    reportContainer.innerHTML += isHealthy ? healthyHTML : diseasedHTML;

    // ✅ Add translation button
    const translateButton = document.createElement("button");
    translateButton.id = "translate-button";
    translateButton.className = "btn-large btn-translate";
    translateButton.textContent = "🌐 Translate Report";
    translateButton.onclick = translateReport;
    reportContainer.prepend(translateButton);
});

// ✅ TTS Functions
// let currentUtterance = null; // Track the current speech utterance

// function startSpeech() {
//     const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
//     const isHindi = selectedLanguage === "hi";

//     // Generate a welcoming message
//     const reportData = JSON.parse(localStorage.getItem("cropReport"));
//     const { crop, disease, confidence, favorable_conditions } = reportData;

//     const welcomeMessageEnglish = `Your crop, ${crop}, has been diagnosed with ${disease}. The confidence level is ${confidence}. Favorable conditions for this disease are: ${favorable_conditions}.Thank You`;
//     const welcomeMessageHindi = `आपकी फसल, ${crop}, को ${disease} रोग हुआ है। निदान की विश्वसनीयता ${confidence} है। और अधिक  जानकारी के  लिए  नीचे  दी   गई  जानकारी पढे `;

//     const welcomeMessage = isHindi ? welcomeMessageHindi : welcomeMessageEnglish;

//     // Stop any ongoing speech
//     if (currentUtterance) {
//         window.speechSynthesis.cancel();
//     }

//     // Create a new utterance for the welcoming message
//     currentUtterance = new SpeechSynthesisUtterance(welcomeMessage);
//     currentUtterance.lang = isHindi ? "hi-IN" : "en-US";
//     currentUtterance.volume = 1; // Default volume
//     currentUtterance.rate = 1; // Default speed
//     currentUtterance.pitch = 1; // Default pitch

//     // Speak the welcoming message
//     window.speechSynthesis.speak(currentUtterance);

//     // After the welcoming message, read the full report
//     currentUtterance.onend = () => {
//         const reportText = document.querySelector(".report-card").innerText;
//         currentUtterance = new SpeechSynthesisUtterance(reportText);
//         currentUtterance.lang = isHindi ? "hi-IN" : "en-US";
//         window.speechSynthesis.speak(currentUtterance);
//     };

//     // Update button UI
//     const micIcon = document.getElementById("mic-icon");
//     micIcon.textContent = "🔊"; // Change icon to indicate active speech
// }

// function stopSpeech() {
//     if (currentUtterance) {
//         window.speechSynthesis.cancel(); // Stop speech
//         currentUtterance = null; // Reset utterance
//     }

//     // Update button UI
//     const micIcon = document.getElementById("mic-icon");
//     micIcon.textContent = "🎤"; // Reset icon
// }

// function increaseVolume() {
//     if (currentUtterance) {
//         currentUtterance.volume = Math.min(1, currentUtterance.volume + 0.1); // Increase volume by 10%
//     }
// }

// function switchVoice() {
//     const voices = window.speechSynthesis.getVoices();
//     if (voices.length === 0) {
//         alert("No voices available. Please try again later.");
//         return;
//     }

//     if (currentUtterance) {
//         const currentVoice = currentUtterance.voice;
//         const currentLanguage = currentUtterance.lang;

//         // Find the next voice for the current language
//         const availableVoices = voices.filter(voice => voice.lang === currentLanguage);
//         const currentIndex = availableVoices.findIndex(voice => voice === currentVoice);
//         const nextIndex = (currentIndex + 1) % availableVoices.length;

//         currentUtterance.voice = availableVoices[nextIndex]; // Switch to the next voice
//         window.speechSynthesis.cancel(); // Stop current speech
//         window.speechSynthesis.speak(currentUtterance); // Restart with the new voice
//     }
// }

// // ✅ Translation Function
// function translateReport() {
//     if (!window.google || !window.google.translate) {
//         alert("Google Translate API not loaded!");
//         return;
//     }
//     new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
// }

// // ✅ Audio Control Functions for Sections
// function playSection(button) {
//     const section = button.closest('.report-section');
//     const text = section.innerText;
//     const selectedLanguage = document.querySelector('input[name="language"]:checked').value;

//     // Stop any ongoing speech
//     if (currentUtterance) {
//         window.speechSynthesis.cancel();
//     }

//     // Create a new utterance for the section
//     currentUtterance = new SpeechSynthesisUtterance(text);
//     currentUtterance.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US";
//     window.speechSynthesis.speak(currentUtterance);
// }

// function pauseSection(button) {
//     window.speechSynthesis.pause();
// }

// function increaseVolumeSection(button) {
//     if (currentUtterance) {
//         currentUtterance.volume = Math.min(1, currentUtterance.volume + 0.1); // Increase volume by 10%
//     }
// }

// // ✅ Load voices when the page loads
// window.speechSynthesis.onvoiceschanged = () => {
//     console.log("Voices loaded:", window.speechSynthesis.getVoices());
// };



let currentUtterance = null; // Track the current speech utterance
let isPaused = false; // Track if speech is paused
let initialVoiceSet = false; // Track if the initial voice is set
let voiceChangeCount = 1; // Count voice switch attempts

function startSpeech() {
    const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
    const isHindi = selectedLanguage === "hi";

    // Generate a welcoming message
    const reportData = JSON.parse(localStorage.getItem("cropReport")) || {};
    const { crop = "your crop", disease = "unknown disease", confidence = "N/A", favorable_conditions = "N/A" } = reportData;

    const welcomeMessageEnglish = `Your crop, ${crop}, has been diagnosed with ${disease}. The confidence level is ${confidence}. Favorable conditions for this disease are: ${favorable_conditions}. Thank You.`;
    const welcomeMessageHindi = `आपकी फसल, ${crop}, को ${disease} रोग हुआ है। निदान की विश्वसनीयता ${confidence} है। और अधिक जानकारी के लिए नीचे दी गई जानकारी पढ़ें।`;

    const welcomeMessage = isHindi ? welcomeMessageHindi : welcomeMessageEnglish;

    // Stop any ongoing speech
    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }

    // Create a new utterance for the welcoming message
    currentUtterance = new SpeechSynthesisUtterance(welcomeMessage);
    currentUtterance.lang = isHindi ? "hi-IN" : "en-US";
    currentUtterance.volume = 1;
    currentUtterance.rate = 1;
    currentUtterance.pitch = 1;

    setInitialVoice(); // ✅ Ensure voice is set before speaking

    window.speechSynthesis.speak(currentUtterance);

    // After the welcoming message, read the full report
    currentUtterance.onend = () => {
        const reportText = document.querySelector(".report-card")?.innerText || "No report available.";
        currentUtterance = new SpeechSynthesisUtterance(reportText);
        currentUtterance.lang = isHindi ? "hi-IN" : "en-US";
        setInitialVoice(); // ✅ Ensure voice is set before speaking
        window.speechSynthesis.speak(currentUtterance);
    };

    // Update button UI
    document.getElementById("mic-icon").textContent = "🔊"; // Change icon to indicate active speech
}

function stopSpeech() {
    if (currentUtterance) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
        isPaused = false;
        resetSpeechSettings();
    }

    // Update button UI
    document.getElementById("mic-icon").textContent = "🎤"; // Reset icon
}

function pauseSection() {
    if (window.speechSynthesis.speaking && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        console.log("⏸️ Speech paused");
    }
}

function resumeSection() {
    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        console.log("▶️ Speech resumed");
    }
}

function increaseVolume() {
    if (currentUtterance) {
        currentUtterance.volume = Math.min(1, currentUtterance.volume + 0.1);
    }
}

function switchVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        alert("❌ No voices available. Please try again later.");
        return;
    }

    if (!currentUtterance) return;

    const currentVoice = currentUtterance.voice;
    const currentLanguage = currentUtterance.lang;

    const availableVoices = voices.filter(voice => voice.lang === currentLanguage);
    if (availableVoices.length === 0) {
        alert(`⚠ No voices available for ${currentLanguage}`);
        return;
    }

    if (!initialVoiceSet) {
        setInitialVoice();
        initialVoiceSet = true;
        console.log(`🎤 Initial voice set to: ${currentUtterance.voice.name}`);
    } else {
        voiceChangeCount++;
        if (voiceChangeCount < 3) {
            console.log(`🔄 Voice change count: ${voiceChangeCount} (Waiting for 3 clicks)`);
            return;
        }
        voiceChangeCount = 0;

        const currentIndex = availableVoices.findIndex(voice => voice === currentVoice);
        const nextIndex = (currentIndex + 1) % availableVoices.length;

        currentUtterance.voice = availableVoices[nextIndex];
        console.log(`✅ Voice changed to: ${currentUtterance.voice.name}`);
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(currentUtterance);
}

// ✅ Function to Set Initial Voice to Microsoft Swara (Hindi)
function setInitialVoice() {
    const voices = window.speechSynthesis.getVoices();
    const swaraVoice = voices.find(voice => voice.name.includes("Microsoft Swara Online"));

    if (swaraVoice) {
        if (currentUtterance) {
            currentUtterance.voice = swaraVoice;
        }
        console.log(`✅ Initial voice set to: ${swaraVoice.name}`);
    } else {
        console.warn("⚠ Microsoft Swara voice not found, using default voice.");
    }
}

// ✅ Function to Translate Report (No Change)
function translateReport() {
    if (!window.google || !window.google.translate) {
        alert("Google Translate API not loaded!");
        return;
    }
    new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
}

// ✅ Function to Read Specific Sections
function playSection(button) {
    const section = button.closest(".report-section");
    const text = section?.innerText || "No section available.";
    const selectedLanguage = document.querySelector('input[name="language"]:checked')?.value || "en";

    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US";
    setInitialVoice();
    window.speechSynthesis.speak(currentUtterance);
}

// ✅ Reset Speech Settings
function resetSpeechSettings() {
    currentUtterance = null;
    voiceChangeCount = 1;
    initialVoiceSet = false;
    isPaused = false;
    console.log("🔄 Speech settings reset!");
}

// ✅ Load voices when the page loads
window.speechSynthesis.onvoiceschanged = () => {
    console.log("✅ Voices loaded");
    setInitialVoice();
};

// ✅ Reset everything when the page refreshes
window.onload = function () {
    window.speechSynthesis.cancel();
    stopSpeech();
    resetSpeechSettings();
};


lottie.loadAnimation({
    container: document.querySelector(".tts2"), // The target div
    renderer: "svg",
    loop: true, // Set false if you want it to run once
    autoplay: true,
    path: "/path-to-your-lottie-file.json", // Make sure to provide the JSON file path
});















// const ttsButtonHTML = `
//                             <div class="tts-container">
//                                 <h3>🔊 Listen to Report</h3>
//                                 <div class="radio-group">
//                                     <label class="radio-option">
//                                         <input type="radio" name="language" value="en" checked onchange="changeLanguage('en')"> 🇬🇧 English
//                                     </label>
//                                     <label class="radio-option">
//                                         <input type="radio" name="language" value="hi" onchange="changeLanguage('hi')"> 🇮🇳 हिन्दी (Hindi)
//                                     </label>
//                                 </div>
//                                 <div class="tts-buttons">
//                                     <button id="tts-button" onclick="startSpeech()" class="btn-large">
//                                         <span id="mic-icon"><i class="bi bi-mic"></i></span> Listen
//                                     </button>
//                                     <button id="stop-button" onclick="stopSpeech()" class="btn-large btn-danger">
//                                         <i class="bi bi-stop-circle"></i> Stop
//                                     </button>
//                                     <button id="increase-volume" onclick="increaseVolume()" class="btn-large btn-info">
//                                         <i class="bi bi-volume-up"></i> Increase Voice
//                                     </button>
//                                     <button id="switch-voice" onclick="switchVoice()" class="btn-large btn-warning">
//                                         <i class="bi bi-person-circle"></i> Switch Voice
//                                     </button>
//                                 </div>
//                             </div>
//                             `;

// document.addEventListener("DOMContentLoaded", function () {
//     const reportContainer = document.getElementById("report-container");

//     // ✅ Get report from localStorage
//     let reportData = localStorage.getItem("cropReport");

//     try {
//         reportData = JSON.parse(reportData);
//     } catch (error) {
//         console.error("❌ Error parsing report data:", error);
//         reportContainer.innerHTML = "<p class='text-danger text-center'>❌ Error loading report.</p>";
//         return;
//     }

//     console.log("✅ Received Crop Report:", reportData);

//     // ✅ Extract data
//     reportContainer.innerHTML += ttsButtonHTML;
//     const {
//         crop = "Unknown",
//         disease = "Unknown",
//         confidence = "N/A",
//         imageUrl = "/images/placeholder.png",
//         pathogen = "N/A",
//         pathogen_type = "N/A",
//         spread = "N/A",
//         favorable_conditions = "N/A",
//         best_practices = [],
//         natural_methods = [],
//         chemical_pesticides = [],
//         ideal_conditions = "N/A",
//         preventive_measures = "N/A",
//         water_fertilization = "N/A",
//         common_threats = "N/A"
//     } = reportData;

//     const isHealthy = disease.toLowerCase().includes("healthy");

//     // ✅ Healthy Crop Section
//     let healthyHTML = `
//                             <div class="report-card healthy">
//                                 <h2>🌿 Healthy Crop Report</h2>
//                                 <img src="${imageUrl}" alt="Healthy Crop Image">
//                                     <p><strong>🌱 Crop:</strong> ${crop}</p>
//                                     <p><strong>✅ Status:</strong> Healthy</p>
//                                     <p><strong>📊 Confidence:</strong> ${confidence}</p>
//                                     <p><strong>🌍 Ideal Conditions:</strong> ${ideal_conditions}</p>
//                                     <p><strong>🛑 Preventive Measures:</strong> ${preventive_measures}</p>
//                                     <p><strong>💧 Water & Fertilization:</strong> ${water_fertilization}</p>
//                                     <p><strong>⚠ Common Threats:</strong> ${common_threats}</p>
//                                     <div class="report-section">
//                                         <h3>✅ Best Practices</h3>
//                                         <ul>
//                                             ${best_practices.length > 0
//             ? best_practices.map(p => `<li><strong>${p.practice}:</strong> ${p.description}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                                         </ul>
//                                         <div class="audio-controls">
//                                             <button onclick="playSection(this)" class="btn-audio"><i class="bi bi-play-circle"></i></button>
//                                             <button onclick="pauseSection(this)" class="btn-audio"><i class="bi bi-pause-circle"></i></button>
//                                             <button onclick="increaseVolumeSection(this)" class="btn-audio"><i class="bi bi-volume-up"></i></button>
//                                         </div>
//                                     </div>
//                             </div>
//                             `;

//     // ✅ Diseased Crop Section
//     let diseasedHTML = `
//                             <div class="report-card diseased">
//                                 <h2>⚠ Diseased Crop Report</h2>
//                                 <img src="${imageUrl}" alt="Diseased Crop Image">
//                                     <p><strong>🌱 Crop:</strong> ${crop}</p>
//                                     <p><strong>🦠 Disease:</strong> ${disease}</p>
//                                     <p><strong>📊 Confidence:</strong> ${confidence}</p>
//                                     <p><strong>🧬 Pathogen:</strong> ${pathogen}</p>
//                                     <p><strong>🧫 Pathogen Type:</strong> ${pathogen_type}</p>
//                                     <p><strong>🔬 Spread:</strong> ${spread}</p>
//                                     <p><strong>🌦️ Favorable Conditions:</strong> ${favorable_conditions}</p>

//                                     <div class="report-section">
//                                         <h3>✅ Best Prevention Practices</h3>
//                                         <ul>
//                                             ${best_practices.length > 0
//             ? best_practices.map(p => `<li><strong>${p.practice}:</strong> ${p.description}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                                         </ul>
//                                         <div class="audio-controls">
//                                             <button onclick="playSection(this)" class="btn-audio"><i class="bi bi-play-circle"></i></button>
//                                             <button onclick="pauseSection(this)" class="btn-audio"><i class="bi bi-pause-circle"></i></button>
//                                             <button onclick="increaseVolumeSection(this)" class="btn-audio"><i class="bi bi-volume-up"></i></button>
//                                         </div>
//                                     </div>

//                                     <div class="report-section">
//                                         <h3>🌿 Natural Treatment Methods</h3>
//                                         <ul>
//                                             ${natural_methods.length > 0
//             ? natural_methods.map(m => `<li><strong>${m.name}:</strong> ${m.description}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                                         </ul>
//                                         <div class="audio-controls">
//                                             <button onclick="playSection(this)" class="btn-audio"><i class="bi bi-play-circle"></i></button>
//                                             <button onclick="pauseSection(this)" class="btn-audio"><i class="bi bi-pause-circle"></i></button>
//                                             <button onclick="increaseVolumeSection(this)" class="btn-audio"><i class="bi bi-volume-up"></i></button>
//                                         </div>
//                                     </div>

//                                     <div class="report-section">
//                                         <h3>🧪 Chemical Pesticides</h3>
//                                         <ul>
//                                             ${chemical_pesticides.length > 0
//             ? chemical_pesticides.map(p => `<li><strong>${p.name} (Quantity: ${p.quantity}):</strong> ${p.note}</li>`).join("")
//             : "<li>No data available</li>"
//         }
//                                         </ul>
//                                         <div class="audio-controls">
//                                             <button onclick="playSection(this)" class="btn-audio"><i class="bi bi-play-circle"></i></button>
//                                             <button onclick="pauseSection(this)" class="btn-audio"><i class="bi bi-pause-circle"></i></button>
//                                             <button onclick="increaseVolumeSection(this)" class="btn-audio"><i class="bi bi-volume-up"></i></button>
//                                         </div>
//                                     </div>
//                             </div>
//                             `;

//     // ✅ Inject into report container
//     reportContainer.innerHTML += isHealthy ? healthyHTML : diseasedHTML;

//     // ✅ Add translation button
//     const translateButton = document.createElement("button");
//     translateButton.id = "translate-button";
//     translateButton.className = "btn-large btn-translate";
//     translateButton.textContent = "🌐 Translate Report";
//     translateButton.onclick = translateReport;
//     reportContainer.prepend(translateButton);
// });

// // ✅ Translation Function
// // function translateReport() {
// //     if (!window.google || !window.google.translate) {
// //         alert("Google Translate API not loaded!");
// //         return;
// //     }
// //     new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
// // }

// function loadGoogleTranslate() {
//     if (!document.getElementById("google-translate-script")) {
//         let script = document.createElement("script");
//         script.id = "google-translate-script";
//         script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";
//         script.onload = () => {
//             console.log("✅ Google Translate API Loaded Successfully. Initializing...");
//             setTimeout(googleTranslateInit, 2000); // Ensure it’s fully ready before calling init
//         };
//         script.onerror = () => console.error("❌ Failed to load Google Translate API");
//         document.body.appendChild(script);
//     }
// }

// function checkGoogleTranslate() {
//     fetch("https://translate.google.com/")
//         .then(() => console.log("✅ Google Translate is accessible"))
//         .catch(() => console.error("❌ Google Translate may be blocked or unreachable"));
// }
// checkGoogleTranslate();
// loadGoogleTranslate();


// function googleTranslateInit() {
//     new google.translate.TranslateElement(
//         { pageLanguage: 'en', includedLanguages: 'hi', layout: google.translate.TranslateElement.InlineLayout.SIMPLE },
//         'google_translate_element'
//     );
// }


// function translateReport() {
//     if (typeof google === "undefined" || typeof google.translate === "undefined") {
//         console.error("❌ Google Translate API is not available.");
//         loadGoogleTranslate();
//         setTimeout(() => googleTranslateInit(), 2000);
//         return;
//     }
//     googleTranslateInit();
// }


// // ✅ Audio Control Functions
// // function playSection(button) {
// //     const section = button.closest('.report-section');
// //     const text = section.innerText;
// //     const utterance = new SpeechSynthesisUtterance(text);
// //     utterance.lang = document.querySelector('input[name="language"]:checked').value === "hi" ? "hi-IN" : "en-US";
// //     window.speechSynthesis.speak(utterance);
// // }

// function playSection(button) {
//     const section = button.closest('.report-section');
//     if (!section) return;

//     const text = section.innerText;
//     const utterance = new SpeechSynthesisUtterance(text);
//     const lang = document.querySelector('input[name="language"]:checked').value === "hi" ? "hi-IN" : "en-US";

//     utterance.lang = lang;
//     utterance.rate = 0.85;
//     utterance.pitch = 0.9;
//     utterance.volume = globalVolume;

//     const voices = speechSynthesis.getVoices();
//     utterance.voice = voices[currentVoiceIndex] || voices[0];

//     window.speechSynthesis.speak(utterance);
// }


// function pauseSection(button) {
//     window.speechSynthesis.pause();
// }

// function increaseVolumeSection(button) {
//     const utterance = new SpeechSynthesisUtterance();
//     utterance.volume = Math.min(1, utterance.volume + 0.1);
// }

// // ✅ Change Language Function
// // function changeLanguage(lang) {
// //     if (lang === "hi") {
// //         // Load Google Translate API
// //         let translateScript = document.createElement("script");
// //         translateScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";
// //         document.body.appendChild(translateScript);
// //     } else {
// //         location.reload(); // Refresh to restore English content
// //     }
// // }

// function changeLanguage(lang) {
//     if (lang === "hi") {
//         loadGoogleTranslate();
//         setTimeout(() => googleTranslateInit(), 2000); // Delay to allow API to load
//     } else {
//         document.location.reload();
//     }
// }


// // ✅ Start Speech Function
// function startSpeech() {
//     const synth = window.speechSynthesis;
//     const lang = document.querySelector('input[name="language"]:checked').value;
//     const micIcon = document.getElementById("mic-icon");

//     // Fetch Data from localStorage
//     let reportData = localStorage.getItem("cropReport");
//     if (!reportData) {
//         alert("❌ No report data found!");
//         return;
//     }

//     reportData = JSON.parse(reportData);

//     const {
//         crop, disease, confidence, pathogen, pathogen_type,
//         spread, favorable_conditions, ideal_conditions,
//         preventive_measures, water_fertilization, common_threats
//     } = reportData;

//     let isHealthy = disease.toLowerCase().includes("healthy");

//     let text = lang === "hi"
//         ? `नमस्ते किसान साथी! ${isHealthy ? `आपकी फसल ${crop} स्वस्थ है।` : `आपकी फसल ${crop} को ${disease} रोग हुआ है।`}
//                             विश्वास स्तर ${confidence} प्रतिशत है। रोगजनक ${pathogen} है और यह ${spread} से फैलता है। कृपया सुझाए गए उपाय अपनाएँ। धन्यवाद।`
//         : `Hello Farmer Friend! ${isHealthy ? `Your crop ${crop} is healthy.` : `Your crop ${crop} is affected by ${disease}.`}
//                             Confidence level is ${confidence} percent. The pathogen responsible is ${pathogen} and spreads through ${spread}.
//                             Please follow the recommended measures. Thank you.`;

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
//     utterance.rate = 0.85; // Slower for clarity
//     utterance.pitch = 0.9; // Deeper male voice
//     utterance.volume = 1;

//     // Select a male voice dynamically
//     // const voices = synth.getVoices();
//     // utterance.voice = voices.find(voice => voice.lang === utterance.lang && voice.name.includes("Male")) || voices[0];

//     let voices = [];

//     window.speechSynthesis.onvoiceschanged = function () {
//         voices = window.speechSynthesis.getVoices();
//     };

//     utterance.voice = voices[currentVoiceIndex] || voices[0];


//     // Start Mic Animation
//     micIcon.innerHTML = "<i class='bi bi-mic'></i>";
//     micIcon.style.animation = "pulse 1s infinite";

//     utterance.onend = () => {
//         // Stop Animation when Speech Ends
//         micIcon.innerHTML = "<i class='bi bi-mic'></i>";
//         micIcon.style.animation = "";
//     };

//     synth.speak(utterance);
// }

// // ✅ Stop Speech Function
// // function stopSpeech() {
// //     window.speechSynthesis.cancel();
// // }

// function stopSpeech() {
//     window.speechSynthesis.cancel();
//     const micIcon = document.getElementById("mic-icon");
//     if (micIcon) {
//         micIcon.innerHTML = "<i class='bi bi-mic'></i>";
//         micIcon.style.animation = "";
//     }
// }


// // ✅ Increase Volume Function
// // function increaseVolume() {
// //     const utterance = new SpeechSynthesisUtterance();
// //     utterance.volume = Math.min(1, utterance.volume + 0.1);
// // }

// let globalVolume = 1.0;

// function increaseVolume() {
//     globalVolume = Math.min(1, globalVolume + 0.1);
//     alert(`🔊 Volume increased to ${Math.round(globalVolume * 100)}%`);
// }


// // ✅ Switch Voice Function
// // function switchVoice() {
// //     const synth = window.speechSynthesis;
// //     const voices = synth.getVoices();
// //     const currentVoice = synth.voice;
// //     const nextVoice = voices[(voices.indexOf(currentVoice) + 1) % voices.length];
// //     synth.voice = nextVoice;
// // }

// let currentVoiceIndex = 0;

// function switchVoice() {
//     const synth = window.speechSynthesis;
//     const voices = synth.getVoices();
//     if (voices.length === 0) {
//         alert("❌ No voices available!");
//         return;
//     }

//     currentVoiceIndex = (currentVoiceIndex + 1) % voices.length;
//     alert(`🔄 Switched to voice: ${voices[currentVoiceIndex].name}`);
// }


