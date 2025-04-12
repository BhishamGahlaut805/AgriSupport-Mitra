const getLocationBtn = document.getElementById('getLocationBtn');
const output = document.getElementById('output');

const reverseGeocode = async (latitude, longitude) => {
    try {
        // Use a reverse geocoding API like OpenCage or OpenStreetMap
        const apiKey = 'KEY5'; // Replace with your API key
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const location = data.results[0].components;
            const city = location.city || location.town || location.village;
            const country = location.country || 'Unknown country';

            return { city, country };
        } else {
            throw new Error('No results found for the given coordinates.');
        }
    } catch (error) {
        throw new Error(`Error fetching location details: ${error.message}`);
    }
};

// Using mic option for Searching
const micBtn = document.querySelector(".cityMic");
const wordInput = document.querySelector(".dataLocation");
const search = document.querySelector(".searchBtn1");

micBtn.addEventListener("click", () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition. Try Chrome.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.start();
    recognition.onstart = () => {
        wordInput.placeholder = '🎤 Listening... Speak now';
        wordInput.style.color = "blue";
    };

    recognition.onresult = async (event) => {
        let transcript = event.results[0][0].transcript.trim();
        transcript = transcript.endsWith(".") ? transcript.slice(0, -1) : transcript;
        wordInput.value = transcript;
        wordInput.innerHTML = `🔍 Searching For City: <strong>${transcript}</strong>`;
        wordInput.style.color = "black";

        try {
            const coordinates = await fetchLatLon(transcript);
            if (coordinates) {
                search.addEventListener("click", () => {
                    data_weather1(coordinates.latitude, coordinates.longitude, transcript);
                    fetchHourlyWeather(coordinates.latitude, coordinates.longitude);
                    fetchFutureWeather_daily(coordinates.latitude, coordinates.longitude);
                    fetchSeasonalWeather(coordinates.latitude, coordinates.longitude);
                });

                wordInput.innerHTML = `✅ City Found: <strong>${transcript}</strong>. Click search!`;
                wordInput.style.color = "green";
            } else {
                wordInput.innerHTML = "❌ Location not found. Try again.";
                wordInput.style.color = "red";
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
            wordInput.innerHTML = "⚠️ Error fetching data. Try again.";
            wordInput.style.color = "red";
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        wordInput.innerHTML = "⚠️ Speech recognition failed. Try again.";
        wordInput.style.color = "red";
    };

    recognition.onend = () => {
        wordInput.placeholder = 'Search for a city...';
        wordInput.style.color = "black";
        console.log("Speech recognition ended.");
    };
});


getLocationBtn.addEventListener('click', async () => {
    console.log("Clicked");
    if (!navigator.geolocation) {
        output.textContent = 'Geolocation is not supported by your browser.';
        return;
    }

    // Fetch the user's location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(latitude, longitude);
            try {
                // Get city and country using reverse geocoding
                const locationDetails = await reverseGeocode(latitude, longitude);

                // Display the location as JSON
                const locationData = { latitude, longitude, ...locationDetails };
                output.textContent = JSON.stringify(locationData, null, 2);
                data_weather1(latitude, longitude, locationDetails.city);
                fetchHourlyWeather(latitude, longitude);
                fetchFutureWeather_daily(latitude, longitude);
                fetchSeasonalWeather(latitude, longitude);

            } catch (error) {
                output.textContent = `Error: ${error.message}`;
            }
        },
        (error) => {
            output.textContent = `Error: ${error.message}`;
        }
    );
});

//Main weather details

function datetime(unixTimestamp) {
    // Convert to milliseconds
    const date = new Date(unixTimestamp * 1000);

    // Format the date
    const formattedDate = date.toLocaleString();

    return (formattedDate); // Output: "10/1/2021, 12:00:00 AM" (example output)

}
function getCardinalDirection(deg) {
    if (deg > 337.5 || deg <= 22.5) {
        return 'N';
    } else if (deg > 22.5 && deg <= 67.5) {
        return 'NE';
    } else if (deg > 67.5 && deg <= 112.5) {
        return 'E';
    } else if (deg > 112.5 && deg <= 157.5) {
        return 'SE';
    } else if (deg > 157.5 && deg <= 202.5) {
        return 'S';
    } else if (deg > 202.5 && deg <= 247.5) {
        return 'SW';
    } else if (deg > 247.5 && deg <= 292.5) {
        return 'W';
    } else if (deg > 292.5 && deg <= 337.5) {
        return 'NW';
    }
}

//Fetching country name

async function fetchCountryData() {
    try {
        const response = await fetch('countries.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching country data:', error);
        return [];
    }
}

// Function to get country name by code
function getCountryNameByCode(code, countryData) {
    const country = countryData.find(country => country.code === code);
    console.log(country);
    return country ? country.name : 'Unknown Country';

}

//fetch city data
async function fetchCityData(cityName) {
    try {
        // Fetch the states data from the JSON file
        const response = await fetch('cities.json');

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the JSON data
        const data = await response.json();

        // Log the data for debugging (optional)
        console.log(data);

        // Traverse through states and their cities to find the matching city
        for (const state of data) {
            const city = state.cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
            if (city) {
                return state.name; // Return the state name if the city is found
            }
        }

        // If no city is found, return "Unknown State"
        return '';
    } catch (error) {
        // Log the error and return "Unknown State"
        console.error('Error fetching city data:', error);
        return '';
    }
}

//for weather data to appear on the screen

//using any location
// Function to fetch latitude and longitude of a location
async function fetchLatLon(location) {
    const baseUrl = 'https://geocoding-api.open-meteo.com/v1/search';

    try {
        const response = await fetch(`${baseUrl}?name=${encodeURIComponent(location)}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const { latitude, longitude } = data.results[0];
            console.log(`Location: ${location}`);
            console.log(`Latitude: ${latitude}`);
            console.log(`Longitude: ${longitude}`);
            return { latitude, longitude };
        } else {
            console.error('No results found for the specified location.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return null;
    }
}

// Fetching location from the backend
document.querySelector('.formLocation').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const locationInput = document.querySelector('.dataLocation').value.trim();
    if (!locationInput) {
        console.log('Error: Location is empty.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/weather/search-location', {
            //const response = await fetch('http://192.168.1.8:3000/search-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location2: locationInput }),
        });

        const data = await response.json();
        if (response.ok) {
            // console.log('Success:', data.message);

            // Fetch coordinates after getting the response
            const coordinates = await fetchLatLon(data.location2);
            if (coordinates) {
                // console.log('Coordinates fetched successfully:', coordinates);
                data_weather1(coordinates.latitude, coordinates.longitude, data.location);
                fetchHourlyWeather(coordinates.latitude, coordinates.longitude);
                fetchFutureWeather_daily(coordinates.latitude, coordinates.longitude);
                fetchSeasonalWeather(coordinates.latitude, coordinates.longitude);
            }
        } else {
            console.log('Error:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


//Function to Create Weather Elements Dynamically

function createWeatherElements() {
    // City and Date Section
    const cityDiv = document.createElement("div");
    cityDiv.className = "city d-flex justify-content-center align-items-start mt-3 mb-3";
    cityDiv.id = "city";

    const dtDiv = document.createElement("div");
    dtDiv.className = "dt d-flex justify-content-center align-items-start mt-3 mb-3";
    dtDiv.id = "dt";

    // Sun Section
    const sunDiv = document.createElement("div");
    sunDiv.className = "d-flex justify-content-between mb-3";
    sunDiv.id = "sun";

    const sunriseDiv = document.createElement("div");
    sunriseDiv.className = "me-2 d-flex flex-row";
    sunriseDiv.style.fontSize = "calc(1rem + 0.5vw)";
    sunriseDiv.id = "sunrise";

    const sunsetDiv = document.createElement("div");
    sunsetDiv.className = "me-2 d-flex flex-row";
    sunsetDiv.style.fontSize = "calc(1rem + 0.5vw)";
    sunsetDiv.id = "sunset";

    sunDiv.append(sunriseDiv, sunsetDiv);

    // Temperature Section
    const tempBoxDiv = document.createElement("div");
    tempBoxDiv.className = "temp_box d-flex justify-content-between mb-3";

    const tempDiv = document.createElement("div");
    tempDiv.className = "me-2";
    tempDiv.id = "temp";

    const highDiv = document.createElement("div");
    highDiv.className = "me-2";
    highDiv.id = "high";

    const lowDiv = document.createElement("div");
    lowDiv.id = "low";

    tempBoxDiv.append(tempDiv, highDiv, lowDiv);

    // Weather Details Section
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "d-flex flex-wrap justify-content-between";
    detailsDiv.id = "details";

    const feelslikeDiv = document.createElement("div");
    feelslikeDiv.className = "me-2 mb-2";
    feelslikeDiv.id = "feelslike";

    const desImgDiv = document.createElement("div");
    desImgDiv.className = "d-flex justify-content-center";
    desImgDiv.id = "des-img";

    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "me-2 mb-2";
    descriptionDiv.id = "description";

    detailsDiv.append(feelslikeDiv, desImgDiv, descriptionDiv);

    // Humidity Section
    const humidityDiv = document.createElement("div");
    humidityDiv.className = "d-flex flex-row justify-content-center align-items-center mb-2";

    const humidityInnerDiv = document.createElement("div");
    humidityInnerDiv.className = "me-2 fs-4";
    humidityInnerDiv.id = "humidity";

    humidityDiv.appendChild(humidityInnerDiv);

    // Visibility Section
    const visibilityDiv = document.createElement("div");
    visibilityDiv.className = "d-flex flex-row justify-content-center align-items-center mb-2";

    const visibilityInnerDiv = document.createElement("div");
    visibilityInnerDiv.className = "me-2 fs-4";
    visibilityInnerDiv.id = "visibility";

    visibilityDiv.appendChild(visibilityInnerDiv);

    // Wind Section
    const windDiv = document.createElement("div");
    windDiv.className = "d-flex flex-row justify-content-center align-items-center mb-2";

    const windInnerDiv = document.createElement("div");
    windInnerDiv.className = "wind d-flex flex-row justify-content-between w-100";

    const windSpeedDiv = document.createElement("div");
    windSpeedDiv.className = "fs-4";
    windSpeedDiv.id = "wind_s";

    const windDirDiv = document.createElement("div");
    windDirDiv.className = "fs-4";
    windDirDiv.id = "wind_dir";

    windInnerDiv.append(windSpeedDiv, windDirDiv);
    windDiv.appendChild(windInnerDiv);

    // Cloud Section
    const cloudDiv = document.createElement("div");
    cloudDiv.className = "d-flex flex-row justify-content-center align-items-center mb-2";

    const cloudInnerDiv = document.createElement("div");
    cloudInnerDiv.className = "me-2 fs-4";
    cloudInnerDiv.id = "cloud";

    cloudDiv.appendChild(cloudInnerDiv);

    // Rain Chance Section
    const rainChanceDiv = document.createElement("div");
    rainChanceDiv.className = "d-flex flex-row justify-content-center align-items-center mb-2";

    const rainChanceInnerDiv = document.createElement("div");
    rainChanceInnerDiv.className = "me-2 fs-4";
    rainChanceInnerDiv.id = "r_chance";

    rainChanceDiv.appendChild(rainChanceInnerDiv);

    // Rain Section
    const rainDiv = document.createElement("div");
    rainDiv.className = "d-flex flex-row justify-content-between align-items-center mb-2 w-100";

    const rain1Div = document.createElement("div");
    rain1Div.className = "fs-4";
    rain1Div.id = "r1";

    const rain3Div = document.createElement("div");
    rain3Div.className = "fs-4";
    rain3Div.id = "r3";

    rainDiv.append(rain1Div, rain3Div);

    // Snow Section
    const snowDiv = document.createElement("div");
    snowDiv.className = "d-flex flex-row justify-content-between align-items-center mb-2 w-100";

    const snow1Div = document.createElement("div");
    snow1Div.className = "fs-4";
    snow1Div.id = "s1";

    const snow3Div = document.createElement("div");
    snow3Div.className = "fs-4";
    snow3Div.id = "s3";

    snowDiv.append(snow1Div, snow3Div);

    // Append all sections to the weather-box
    const weatherBox = document.querySelector(".weather-box");
    weatherBox.append(cityDiv, dtDiv, sunDiv, tempBoxDiv, detailsDiv, humidityDiv, visibilityDiv, windDiv, cloudDiv, rainChanceDiv, rainDiv, snowDiv);
}

// Updated data_weather function
let currentWeatherData = "";
let cityName= "";
async function data_weather1(latitude, longitude, city) {
    try {
        const apiKey = "2b0d2611a41f0127715cfef77b8c353a";
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        createWeatherElements(); // Create weather elements dynamically
        currentWeatherData = data;
        const countryData = await fetchCountryData(); // Fetch the country data
        const countryName = getCountryNameByCode(data.sys.country, countryData); // Get the country name using the code
        const stateName = await fetchCityData(data.name); // Fetch the state name using the city name

        document.querySelector("#city").innerHTML = `near.. <strong>${data.name}  ${stateName}, ${countryName} (${data.sys.country})</strong>`;
        document.querySelector("#dt").innerHTML = datetime(data.dt);
        cityName += data.name + stateName + countryName + data.sys.country + datetime(data.dt);
        const srise = datetime(data.sys.sunrise);
        const sset = datetime(data.sys.sunset);

        document.querySelector("#sunrise").innerHTML = `<div id="sun-img" class="d-flex flex-row"></div> ${srise}`;
        document.querySelector("#sunset").innerHTML = `<div id="set-img" class="d-flex flex-row"></div> ${sset}`;

        const tempUnit = data.main.temp > 100 ? 'K' : 'C';
        const tempValue = tempUnit === 'K' ? data.main.temp - 273.15 : data.main.temp;

        document.querySelector("#temp").innerHTML = `${Math.round(tempValue)}<span>°C</span>`;
        document.querySelector("#high").innerHTML = `High: ${Math.round(data.main.temp_max)}<span>°C</span>`;
        document.querySelector("#low").innerHTML = `Low: ${Math.round(data.main.temp_min)}<span>°C</span>`;
        document.querySelector("#feelslike").innerHTML = `Feels like ${Math.round(data.main.feels_like)}<span>°C</span>`;
        document.querySelector("#humidity").innerHTML = `<i class="bi bi-droplet fs-1 me-2 text-primary"></i>Humidity: ${Math.round(data.main.humidity)}<span>%</span>`;
        document.querySelector("#visibility").innerHTML = `<i class="bi bi-eye fs-1 me-2 text-warning"></i>Visibility: ${(data.visibility)}<span>Meters</span>`;

        document.querySelector(".c1Info2").innerHTML = `Temperature:<strong> ${Math.round(tempValue)}°C`;

        document.querySelector("#description").innerHTML = `Weather: ${data.weather[0].description}`;
        updateWeatherIcon(data.weather[0].description);// Update weather icon based on description

        document.querySelector(".c1Info").innerHTML = `${data.weather[0].description}`;
        const weatherCondition = data.weather[0].main;
        const desImg = document.querySelector("#des-img");
        desImg.className = "des-img"; // Reset className

        switch (weatherCondition) {
            case 'Clear':
                desImg.classList.add("clear");
                break;
            case 'Rain':
                desImg.classList.add("rain");
                break;
            case 'Snow':
                desImg.classList.add("snow");
                break;
            case 'Clouds':
                desImg.classList.add("cloud");
                break;
            case 'Mist':
                desImg.classList.add("mist");
                break;
            case 'Haze':
                desImg.classList.add("haze");
                break;
            default:
                desImg.classList.add("clear");
                break;
        }

        document.querySelector("#wind_s").innerHTML = `<i class="bi bi-wind fs-1 me-2 text-info"></i>Wind-Speed: ${data.wind.speed} m/s`;
        document.querySelector("#wind_dir").innerHTML = `Wind-Direction: ${data.wind.deg}° ${getCardinalDirection(data.wind.deg)}`;

        const rain1 = data.rain ? `${data.rain['1h']} mm rain in last 1 hour` : 'No rain in last 1 hour';
        const rain3 = data.rain ? `${data.rain['3h']} mm rain in last 3 hours` : 'No rain in last 3 hours';
        document.querySelector("#r1").innerHTML = `<i class="bi bi-cloud-drizzle fs-1 me-2 text-info"></i>${rain1}`;
        document.querySelector("#r3").innerHTML = `${rain3}`;

        const snow1 = data.snow ? `${data.snow['1h']} mm snow in last 1 hour` : 'No snow in last 1 hour';
        const snow3 = data.snow ? `${data.snow['3h']} mm snow in last 3 hours` : 'No snow in last 3 hours';
        document.querySelector("#s1").innerHTML = `<i class="bi bi-snow fs-1 me-2 text-dark"></i>${snow1}`;
        document.querySelector("#s3").innerHTML = `${snow3}`;

        document.querySelector("#cloud").innerHTML = `<i class="bi bi-cloud fs-1 me-2 text-secondary"></i> Cloudiness: ${data.clouds.all}<span>%</span>`;
        chancesofrain(latitude, longitude);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}


async function chancesofrain(latitude, longitude) {

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Get the precipitation data for the next hour
    const nextHourPrecipitation = weatherData.hourly.precipitation[0];
    document.querySelector("#r_chance").innerHTML = ` <i class="bi bi-cloud-rain fs-1 me-2 text-primary"></i> Rain forecast for the next 1 hour : ${nextHourPrecipitation} mm`;
}


//Clear button
document.querySelector(".clearBtn").addEventListener('click', () => {
    window.location.reload();
});

//Function to update weather icon
function updateWeatherIcon(description) {
    // Mapping weather descriptions to Bootstrap icons
    const weatherIconMap = {
        "clear sky": "bi-sun",
        "few clouds": "bi-cloud-sun",
        "scattered clouds": "bi-cloud",
        "broken clouds": "bi-clouds",
        "shower rain": "bi-cloud-drizzle",
        "rain": "bi-cloud-rain",
        "thunderstorm": "bi-cloud-lightning",
        "snow": "bi-snow",
        "mist": "bi-cloud-fog",
        "haze": "bi-cloud-haze",
        "overcast clouds": "bi-clouds-fill",
        "light rain": "bi-cloud-drizzle",
        "heavy rain": "bi-cloud-rain-heavy",
        "light snow": "bi-snow2",
        "heavy snow": "bi-snow3",
        // Add more mappings as needed
    };

    // Default icon if the description is not mapped
    const defaultIcon = "bi-question-circle";

    // Get the corresponding icon class or the default
    const iconClass = weatherIconMap[description.toLowerCase()] || defaultIcon;

    // Get the element with the class 'c1_img'
    const iconElement = document.querySelector(".c1_img");

    // Get the element with the class 'c1' for color change
    const colorElement = document.querySelector(".c1");

    // Get the body background color
    const bodyColor = window.getComputedStyle(document.body).backgroundColor;
    const isDarkBackground = isDarkColor(bodyColor);

    if (iconElement) {
        // Clear existing icon classes and reset to base class
        iconElement.className = "c1_img";

        // Add the new Bootstrap icon class
        iconElement.classList.add(iconClass);

        // Set icon size to fs-1 (largest size)
        iconElement.classList.add("fs-1");  // fs-1 for largest size
    }

    if (colorElement) {
        // Add colors based on the weather condition
        let iconColor;
        switch (description.toLowerCase()) {
            case "clear sky":
                iconColor = "#ffcc00"; // Bright Yellow
                break;
            case "few clouds":
            case "scattered clouds":
            case "broken clouds":
                iconColor = "#b0c4de"; // Light steel blue
                break;
            case "shower rain":
            case "rain":
            case "heavy rain":
                iconColor = "#1e90ff"; // Dodger blue
                break;
            case "thunderstorm":
                iconColor = "#ff4500"; // Orange red
                break;
            case "snow":
            case "light snow":
            case "heavy snow":
                iconColor = "#ffffff"; // White
                break;
            case "mist":
            case "haze":
            case "overcast clouds":
                iconColor = "#a9a9a9"; // Dark grey
                break;
            default:
                iconColor = "#808080"; // Grey for unknown
                break;
        }

        // Adjust icon color for high contrast
        if (isDarkBackground) {
            // If the background is dark, choose bright contrasting colors
            iconColor = getHighContrastLightColor(iconColor);
        } else {
            // If the background is light, choose darker contrasting colors
            iconColor = getHighContrastDarkColor(iconColor);
        }

        // Apply the icon color
        if (iconElement) {
            iconElement.style.color = iconColor;
        }

        // Apply the color to the .c1 element as well
        colorElement.style.color = iconColor;
    } else {
        console.warn("Element with class 'c1' not found.");
    }
}

// Function to determine if a color is dark based on its RGB value
function isDarkColor(color) {
    const rgb = color.match(/\d+/g); // Extract RGB values
    if (rgb) {
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);
        // Calculate brightness using the formula for luminance
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return brightness < 128; // Dark if brightness is less than 128
    }
    return false;
}

// Function to get a bright contrasting color for dark backgrounds
function getHighContrastLightColor(baseColor) {
    // Brighten the color or set to white if it's already bright
    if (baseColor === "#ffffff") {
        return "#000000"; // If the color is already white, make it black
    }
    return "#ffffff"; // Use white for high contrast
}

// Function to get a dark contrasting color for light backgrounds
function getHighContrastDarkColor(baseColor) {
    // Darken the color or set to black if it's already dark
    if (baseColor === "#000000") {
        return "#ffffff"; // If the color is already black, make it white
    }
    return "#000000"; // Use black for high contrast
}


let weatherUtterance = null;
let lang = "en"; // Default language
let isPaused = false; // Track if speech is paused

function readWeatherReport() {
    const synth = window.speechSynthesis;
    if (!synth) {
        alert("❌ Text-to-speech is not supported in your browser.");
        return;
    }
    if (!currentWeatherData || Object.keys(currentWeatherData).length === 0) {
        return;
    }

    const city = cityName;
    const tempUnit1 = currentWeatherData.main.temp > 100 ? "K" : "C";
    const tempValue1 = tempUnit1 === "K" ? currentWeatherData.main.temp - 273.15 : currentWeatherData.main.temp;
    const temperature = tempValue1.toFixed(1);
    const high = Math.round(currentWeatherData.main.temp_max) || "N/A";
    const low = Math.round(currentWeatherData.main.temp_min) || "N/A";
    const humidity = Math.round(currentWeatherData.main.humidity) || "N/A";
    const windSpeed = currentWeatherData.wind.speed || "N/A";
    const description = currentWeatherData.weather[0].main || "N/A";
    const sunrise = new Date(currentWeatherData.sys.sunrise * 1000).toLocaleTimeString() || "N/A";
    const sunset = new Date(currentWeatherData.sys.sunset * 1000).toLocaleTimeString() || "N/A";
    const rain = currentWeatherData.rain ? `${currentWeatherData.rain["1h"]} mm in the last hour` : "No rain expected today.";
    const cloudiness = currentWeatherData.clouds.all || "No cloud data available.";

    let transcript = lang === "hi"
        ? `🌤 नमस्ते किसान साथी!
        आपके स्थान ${city} का आज का मौसम इस प्रकार है:
        वर्तमान तापमान ${temperature} डिग्री सेल्सियस है।
        अधिकतम तापमान ${high} डिग्री और न्यूनतम तापमान ${low} डिग्री रहेगा।
        हवा की गति ${windSpeed} मीटर प्रति सेकंड है और नमी ${humidity}% है।
        मौसम की स्थिति: ${description}.
        सूर्योदय का समय ${sunrise} और सूर्यास्त का समय ${sunset} है।
        वर्षा की जानकारी: ${rain}.
        बादल छाए रहने की संभावना: ${cloudiness}.
        कृपया अपने खेती कार्यों की योजना इस जानकारी के अनुसार बनाएं। धन्यवाद! 🌾`
        : `🌤 Hello Farmer Friend!
        Here is today's weather update for ${city}:
        The current temperature is ${temperature}°C.
        The maximum temperature is expected to be ${high}°C and the minimum will be ${low}°C.
        Wind speed is ${windSpeed} meters per second, and humidity is at ${humidity}%.
        Weather condition: ${description}.
        The sun will rise at ${sunrise} and set at ${sunset}.
        Rain forecast: ${rain}.
        Cloud coverage: ${cloudiness}.
        Please plan your farming activities accordingly. Thank you! 🌾`;

    if (weatherUtterance) {
        synth.cancel();
    }

    weatherUtterance = new SpeechSynthesisUtterance(transcript);
    weatherUtterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    weatherUtterance.rate = 0.9;
    weatherUtterance.pitch = 1;
    weatherUtterance.volume = 1;

    setTimeout(() => {
        setInitialVoice();
        synth.speak(weatherUtterance);
    }, 200);
}

// ✅ Function to Pause Speech
function pauseWeatherSpeech() {
    if (window.speechSynthesis.speaking && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        console.log("⏸️ Speech paused");
    }
}

// ✅ Function to Resume Speech
function resumeWeatherSpeech() {
    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        console.log("▶️ Speech resumed");
    }
}

// ✅ Function to Stop Speech and Reset Variables
function stopWeatherSpeech() {
    if (weatherUtterance) {
        window.speechSynthesis.cancel();
        weatherUtterance = null;
        isPaused = false;
        resetSpeechSettings();
    }
}

// ✅ Function to Reset Speech Settings
function resetSpeechSettings() {
    weatherUtterance = null;
    voiceChangeCount = 1;
    initialVoiceSet = false;
    isPaused = false;
    console.log("🔄 Speech settings reset!");
}

// ✅ Function to Set Initial Voice to Microsoft Swara (Hindi)
function setInitialVoice() {
    const voices = window.speechSynthesis.getVoices();
    const swaraVoice = voices.find(voice => voice.name.includes("Microsoft Swara Online"));

    if (swaraVoice) {
        weatherUtterance.voice = swaraVoice;
        console.log(`✅ Initial voice set to: ${swaraVoice.name}`);
    } else {
        console.warn("⚠ Microsoft Swara voice not found, using default voice.");
    }
}

// ✅ Function to Change Language
function toggleLanguage() {
    lang = lang === "en" ? "hi" : "en";
    console.log(`🌎 Language changed to ${lang === "hi" ? "Hindi" : "English"}`);
    readWeatherReport();
}

// ✅ Function to Change Voice
function changeVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        alert("❌ No voices available. Please try again later.");
        return;
    }

    if (!weatherUtterance) return;

    const availableVoices = voices.filter(voice => voice.lang.startsWith(lang));
    if (availableVoices.length === 0) {
        alert(`⚠ No voices available for ${lang === "hi" ? "Hindi" : "English"}`);
        return;
    }

    if (!initialVoiceSet) {
        setInitialVoice();
        initialVoiceSet = true;
        console.log(`🎤 Initial voice set to: ${weatherUtterance.voice.name}`);
    } else {
        voiceChangeCount++;

        if (voiceChangeCount < 3) {
            console.log(`🔄 Voice change count: ${voiceChangeCount} (Waiting for 3 clicks)`);
            return;
        }

        voiceChangeCount = 0;
        const currentVoice = weatherUtterance.voice;
        const currentIndex = availableVoices.findIndex(voice => voice === currentVoice);
        const nextIndex = (currentIndex + 1) % availableVoices.length;

        weatherUtterance.voice = availableVoices[nextIndex];
        console.log(`✅ Voice changed to: ${weatherUtterance.voice.name}`);
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(weatherUtterance);
}

// ✅ Load voices when the page loads
window.speechSynthesis.onvoiceschanged = () => {
    console.log("✅ Voices loaded");
    setInitialVoice();
};

// ✅ Reset everything when the page refreshes
window.onload = function () {
    window.speechSynthesis.cancel();
    stopWeatherSpeech();
    resetSpeechSettings();
};





// let weatherUtterance = null;
// let lang = "hi"; // Default language

// function readWeatherReport() {
//     const synth = window.speechSynthesis;
//     if (!synth) {
//         alert("❌ Text-to-speech is not supported in your browser.");
//         return;
//     }
//     if (currentWeatherData =="") {
//         // alert("⚠️ Weather data is unavailable. Please try again later.");
//         return;
//     }

//     const city = cityName;
//     const tempUnit1 = currentWeatherData.main.temp > 100 ? 'K' : 'C';
//     const tempValue1 = tempUnit1 === 'K' ? currentWeatherData.main.temp - 273.15 : currentWeatherData.main.temp;
//     const temperature = tempValue1;
//     const high = Math.round(currentWeatherData.main.temp_max) || "N/A";
//     const low = Math.round(currentWeatherData.main.temp_min) || "N/A";
//     const humidity = Math.round(currentWeatherData.main.humidity) || "N/A";
//     const windSpeed = currentWeatherData.wind.speed || "N/A";
//     const description = currentWeatherData.weather[0].main || "N/A";
//     const sunrise = datetime(currentWeatherData.sys.sunrise) || "N/A";
//     const sunset = datetime(currentWeatherData.sys.sunset) || "N/A";
//     const rain = currentWeatherData.rain || "No rain expected today.";
//     const cloudiness = currentWeatherData.clouds.all || "No cloud data available.";

//     let transcript;

//     if (lang === "hi") {
//         transcript = ` नमस्ते किसान साथी!
//         आपके स्थान ${city} का आज का मौसम इस प्रकार है:
//         वर्तमान तापमान ${temperature} डिग्री सेल्सियस है।
//         अधिकतम तापमान ${high} डिग्री और न्यूनतम तापमान ${low} डिग्री रहेगा।
//         हवा की गति ${windSpeed} मीटर प्रति सेकंड  है और नमी ${humidity}% है।
//         मौसम की स्थिति: ${description}.
//         सूर्योदय का समय ${sunrise} और सूर्यास्त का समय ${sunset} है।
//         वर्षा की जानकारी: ${rain}.
//         बादल छाए रहने की संभावना: ${cloudiness}.
//         कृपया अपने खेती कार्यों की योजना इस जानकारी के अनुसार बनाएं। धन्यवाद!`;
//     } else {
//         transcript = ` Hello Farmer Friend!
//         Here is today's weather update for ${city}:
//         The current temperature is ${temperature}°C.
//         The maximum temperature is expected to be ${high}°C and the minimum will be ${low}°C.
//         Wind speed is ${windSpeed} meter/sec, and humidity is at ${humidity}%.
//         Weather condition: ${description}.
//         The sun will rise at ${sunrise} and set at ${sunset}.
//         Rain forecast: ${rain}.
//         Cloud coverage: ${cloudiness}.
//         Please plan your farming activities accordingly. Thank you! `;
//     }

//     // Stop any ongoing speech
//     if (weatherUtterance) {
//         synth.cancel();
//     }

//     // Create a new utterance with a natural speech rate and tone
//     weatherUtterance = new SpeechSynthesisUtterance(transcript);
//     weatherUtterance.lang = lang === "hi" ? "hi-IN" : "en-US";
//     weatherUtterance.rate = 0.9;  // Slightly slower for better clarity
//     weatherUtterance.pitch = 1;
//     weatherUtterance.volume = 1;
//     setTimeout(() => {
//         setInitialVoice();
//         synth.speak(weatherUtterance);
//     }, 200);

//     // synth.speak(weatherUtterance);
// }

// // ✅ Function to Stop Speech
// // ✅ Function to Set Initial Voice to Microsoft Swara (Hindi)
// function setInitialVoice() {
//     const voices = window.speechSynthesis.getVoices();
//     const swaraVoice = voices.find(voice => voice.name.includes("Microsoft Swara Online"));

//     if (swaraVoice) {
//         weatherUtterance.voice = swaraVoice;
//         console.log(`✅ Initial voice set to: ${swaraVoice.name}`);
//     } else {
//         console.warn("⚠ Microsoft Swara voice not found, using default voice.");
//     }
// }

// // ✅ Function to Stop Speech
// function stopWeatherSpeech() {
//     if (weatherUtterance) {
//         window.speechSynthesis.cancel();
//         weatherUtterance = null;
//         resetSpeechSettings();
//     }
// }

// // ✅ Function to Pause Speech
// function pauseWeatherSpeech() {
//     window.speechSynthesis.pause();
//     resetSpeechSettings();
// }

// // ✅ Function to Reset Speech Settings
// function resetSpeechSettings() {
//     weatherUtterance = null;
//     voiceChangeCount = 1;
//     initialVoiceSet = false;
//     console.log("🔄 Speech settings reset!");
// }

// // ✅ Function to Change Language
// function toggleLanguage() {
//     lang = lang === "en" ? "hi" : "en";
//     console.log(`🌎 Language changed to ${lang === "hi" ? "Hindi" : "English"}`);
//     readWeatherReport();
// }

// // ✅ Function to Change Voice
// function changeVoice() {
//     const voices = window.speechSynthesis.getVoices();
//     if (voices.length === 0) {
//         alert("❌ No voices available. Please try again later.");
//         return;
//     }

//     if (!weatherUtterance) return;

//     const availableVoices = voices.filter(voice => voice.lang.startsWith(lang));
//     if (availableVoices.length === 0) {
//         alert(`⚠ No voices available for ${lang === "hi" ? "Hindi" : "English"}`);
//         return;
//     }

//     // ✅ Set the initial voice to Microsoft Swara if available
//     if (!initialVoiceSet) {
//         setInitialVoice();
//         initialVoiceSet = true;
//         console.log(`🎤 Initial voice set to: ${weatherUtterance.voice.name}`);
//     } else {
//         voiceChangeCount++;

//         if (voiceChangeCount < 3) {
//             console.log(`🔄 Voice change count: ${voiceChangeCount} (Waiting for 3 clicks)`);
//             return;
//         }

//         voiceChangeCount = 0;
//         const currentVoice = weatherUtterance.voice;
//         const currentIndex = availableVoices.findIndex(voice => voice === currentVoice);
//         const nextIndex = (currentIndex + 1) % availableVoices.length;

//         weatherUtterance.voice = availableVoices[nextIndex];
//         console.log(`✅ Voice changed to: ${weatherUtterance.voice.name}`);
//     }

//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(weatherUtterance);
// }

// // ✅ Ensure voices are loaded before setting initial voice
// window.speechSynthesis.onvoiceschanged = () => {
//     console.log("✅ Voices loaded");
//     setInitialVoice();
// };

// // ✅ Reset everything when the page refreshes
// window.onload = function () {
//     resetSpeechSettings();
// };
