async function loadWeatherCodeDescriptions() {
    try {
        const response = await fetch('WMO.json'); // Adjust path to your JSON file
        if (!response.ok) {
            throw new Error('Failed to fetch WMO.json');
        }
        const weatherCodeDescriptions = await response.json();
        // console.log('Debugging 1 : Weather Code Descriptions:', weatherCodeDescriptions);
        return weatherCodeDescriptions;
    } catch (error) {
        console.error('Error loading weather code descriptions:', error);
        return null;
    }
}

async function fetchFutureWeather_daily(latitude, longitude) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=Asia/Kolkata&forecast_days=16`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const weatherData = await weatherResponse.json();
        console.log('Weather Data daily:', weatherData);
        await createWeatherBoxesDaily(weatherData);
        return weatherData;
    } catch (error) {
        console.error('Fetching weather data failed:', error);
    }
}

async function createWeatherBoxesDaily(dailyData) {
    const parentContainer = document.querySelector('.parentCont2'); // Parent container

    // Clear any existing boxes
    parentContainer.innerHTML = '';
    const weatherCodeDescriptions = await loadWeatherCodeDescriptions();
    if (!weatherCodeDescriptions) {
        console.error('Failed to load weather code descriptions');
        return;
    }
    // console.log("debugging3 : ", weatherCodeDescriptions);

    // Loop through the daily data
    for (let i = 0; i < dailyData.daily.time.length; i++) {
        // Create a new weather box
        const weatherBox = document.createElement('div');
        weatherBox.className = 'col-auto mx-3 border rounded d-flex flex-column justify-content-center align-items-center shadow-lg square-container invert-text';

        // Set fixed height and width
        weatherBox.style.height = '550px';
        weatherBox.style.width = '250px';

        // Get weather description, icon, and colors
        // console.log("debugging3 : ", weatherCodeDescriptions);
        const { description, image, bgColor, textColor } = getWeatherDescription_daily(dailyData, i, weatherCodeDescriptions);

        // console.log("debugging2 : ", description, image, bgColor, textColor);

        // Apply styles dynamically
        weatherBox.style.backgroundColor = bgColor;
        weatherBox.style.color = textColor;

        // Sunrise and sunset times
        const sunElement = document.createElement('div');
        sunElement.className = 'text-center display-4 mb-3 c1Info d-flex justify-content-between align-items-center w-100 bg-light p-3 rounded shadow';

        // Sunrise Icon and Time
        const sunriseContainer = document.createElement('div');
        sunriseContainer.className = 'd-flex flex-column align-items-center';

        const sunriseIcon = document.createElement('i');
        sunriseIcon.className = 'bi bi-sunrise-fill';
        sunriseIcon.style.fontSize = '3rem';
        sunriseIcon.style.color = '#ffa500'; // Orange color for sunrise
        sunriseContainer.appendChild(sunriseIcon);

        const sunriseText = document.createElement('span');
        const formattedSunriseTime = new Date(dailyData.daily.sunrise[i]).toLocaleTimeString('en-GB', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        sunriseText.className = 'mt-2 small text-muted';
        sunriseText.style.fontSize = '1rem';
        sunriseText.innerHTML = `${formattedSunriseTime}`;
        sunriseContainer.appendChild(sunriseText);

        sunElement.appendChild(sunriseContainer);

        // Sunset Icon and Time
        const sunsetContainer = document.createElement('div');
        sunsetContainer.className = 'd-flex flex-column align-items-center';

        const sunsetIcon = document.createElement('i');
        sunsetIcon.className = 'bi bi-sunset-fill';
        sunsetIcon.style.fontSize = '3rem';
        sunsetIcon.style.color = '#ff4500'; // Reddish-orange color for sunset
        sunsetContainer.appendChild(sunsetIcon);

        const sunsetText = document.createElement('span');
        const formattedSunsetTime = new Date(dailyData.daily.sunset[i]).toLocaleTimeString('en-GB', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        sunsetText.className = 'mt-2 small text-muted';
        sunsetText.style.fontSize = '1rem';
        sunsetText.innerHTML = `${formattedSunsetTime}`;
        sunsetContainer.appendChild(sunsetText);

        sunElement.appendChild(sunsetContainer);

        weatherBox.appendChild(sunElement);

        // Weather icon
        const weatherIcon = document.createElement('i');
        weatherIcon.className = `${image} display-2 mb-3`;
        weatherBox.appendChild(weatherIcon);

        //description of weather
        const weatherDescription = document.createElement('h5');
        weatherDescription.className = 'text-center h5';
        weatherDescription.innerHTML = `<strong>${description}</strong>`;
        weatherBox.appendChild(weatherDescription);

        // Temperature element
        const tempElement = document.createElement('h3');
        tempElement.className = 'text-center h3';
        tempElement.innerHTML = `<strong>${dailyData.daily.temperature_2m_max[i]}°C / ${dailyData.daily.temperature_2m_min[i]}°C</strong>`;
        weatherBox.appendChild(tempElement);

        // Apparent temperature element
        const apparentTempElement = document.createElement('p');
        apparentTempElement.className = 'text-center small c1Info';
        apparentTempElement.innerHTML = `Feels like ${dailyData.daily.apparent_temperature_max[i]}°C / ${dailyData.daily.apparent_temperature_min[i]}°C`;
        weatherBox.appendChild(apparentTempElement);

        // Sunshine duration
        const sunshineElement = document.createElement('p');
        sunshineElement.className = 'text-center small c1Info';
        const sunshineDurationInHours = (dailyData.daily.sunshine_duration[i] / 3600).toFixed(2);
        sunshineElement.innerHTML = `<strong>Sunshine Duration:</strong> ${sunshineDurationInHours} hours`;
        weatherBox.appendChild(sunshineElement);

        // Rain chance and precipitation
        const rainElement = document.createElement('p');
        rainElement.className = 'text-center small c1Info';
        rainElement.innerHTML = `<strong>Rain Chance:</strong> ${dailyData.daily.precipitation_probability_max[i]} %|${dailyData.daily.precipitation_sum[i]} mm`;
        weatherBox.appendChild(rainElement);

        // Wind speed and direction
        const windElement = document.createElement('p');
        windElement.className = 'text-center small c1Info';
        windElement.innerHTML = `<strong>Wind:</strong> ${dailyData.daily.wind_speed_10m_max[i]} km/h, ${getCardinalDirection(dailyData.daily.wind_direction_10m_dominant[i])}`
        weatherBox.appendChild(windElement);

        // Add weather suggestions
        const suggestionElement = document.createElement('p');
        suggestionElement.className = 'text-center text-white small';
        let suggestionText = '';
        if (description === 'Clear') {
            suggestionText = 'Great day for outdoor activities!';
        } else if (description === 'Cloudy' || description === 'Partly Cloudy') {
            suggestionText = 'Might want to bring a jacket!';
        } else if (description === 'Rainy' || description === 'Heavy Rain') {
            suggestionText = 'Carry an umbrella!';
        } else if (description === 'Windy') {
            suggestionText = 'Be careful in strong winds!';
        } else if (description === 'Freezing' || description === 'Hot') {
            suggestionText = 'Extreme weather, stay safe!';
        }
        // suggestionElement.innerText = suggestionText;
        // weatherBox.appendChild(suggestionElement);

        // Date element
        const dateElement = document.createElement('h6');
        dateElement.className = 'text-center h6';

        // Format date
        const date = new Date(dailyData.daily.time[i]);
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        dateElement.innerHTML = `<strong>${formattedDate}</strong>`;
        dateElement.style.color = textColor;
        weatherBox.appendChild(dateElement);

        // Append the weather box to the parent container
        parentContainer.appendChild(weatherBox);
    }
}

function getWeatherDescription_daily(dailyData, index, weatherCodeDescriptions) {
    const weatherCode = dailyData?.daily?.weather_code?.[index];
    console.log("Weather code at index:", index, "is:", weatherCode);

    let description, image, bgColor, textColor;

    if (weatherCode === undefined || weatherCode === null) {
        console.error("No weather code found for index:", index);
        return { description: 'Unknown', image: 'bi-question-circle', bgColor: '#E0E0E0', textColor: '#000' };
    }

    if (!weatherCodeDescriptions || typeof weatherCodeDescriptions !== 'object') {
        console.error("Invalid weatherCodeDescriptions provided:", weatherCodeDescriptions);
        return { description: 'Unknown', image: 'bi-question-circle', bgColor: '#E0E0E0', textColor: '#000' };
    }

    const weatherDetails = weatherCodeDescriptions[weatherCode];
    if (weatherDetails) {
        description = weatherDetails.day.description;
        console.log("Weather description found:", description);

        // Dynamic assignments based on description
        const weatherConfig = {
            "Sunny": { image: "bi-brightness-high", bgColor: "#FFD700", textColor: "#000" },
            "Mainly Sunny": { image: "bi-brightness-high", bgColor: "#FFD700", textColor: "#000" },
            "Partly Cloudy": { image: "bi-cloud-sun", bgColor: "#B0C4DE", textColor: "#000" },
            "Cloudy": { image: "bi-cloud", bgColor: "#B0C4DE", textColor: "#000" },
            "Foggy": { image: "bi-cloud-fog2", bgColor: "#D3D3D3", textColor: "#000" },
            "Rime Fog": { image: "bi-cloud-fog2", bgColor: "#D3D3D3", textColor: "#000" },
            "Light Drizzle": { image: "bi-cloud-drizzle", bgColor: "#ADD8E6", textColor: "#000" },
            "Drizzle": { image: "bi-cloud-drizzle", bgColor: "#ADD8E6", textColor: "#000" },
            "Light Freezing Drizzle": { image: "bi-cloud-drizzle", bgColor: "#ADD8E6", textColor: "#000" },
            "Heavy Drizzle": { image: "bi-cloud-rain-heavy", bgColor: "#ADD8E6", textColor: "#000" },
            "Light Rain": { image: "bi-cloud-rain", bgColor: "#4682B4", textColor: "#FFF" },
            "Light Showers": { image: "bi-cloud-rain", bgColor: "#4682B4", textColor: "#FFF" },
            "Rain": { image: "bi-cloud-rain-heavy", bgColor: "#4682B4", textColor: "#FFF" },
            "Heavy Rain": { image: "bi-cloud-rain-heavy", bgColor: "#4682B4", textColor: "#FFF" },
            "Light Snow": { image: "bi-cloud-snow", bgColor: "#FFFFFF", textColor: "#000" },
            "Snow": { image: "bi-cloud-snow", bgColor: "#FFFFFF", textColor: "#000" },
            "Heavy Snow": { image: "bi-cloud-snow-heavy", bgColor: "#FFFFFF", textColor: "#000" },
            "Snow Grains": { image: "bi-cloud-snow", bgColor: "#FFFFFF", textColor: "#000" },
            "Thunderstorm": { image: "bi-cloud-lightning", bgColor: "#800080", textColor: "#FFF" },
            "Light Thunderstorms With Hail": { image: "bi-cloud-lightning-rain", bgColor: "#800080", textColor: "#FFF" },
            "Thunderstorm With Hail": { image: "bi-cloud-lightning-rain", bgColor: "#800080", textColor: "#FFF" },
        };

        if (weatherConfig[description]) {
            const config = weatherConfig[description];
            image = config.image;
            bgColor = config.bgColor;
            textColor = config.textColor;
        } else {
            console.warn("No specific configuration for description:", description);
            image = "bi-question-circle";
            bgColor = "#E0E0E0";
            textColor = "#000";
        }
    } else {
        console.warn("No match for weather code in descriptions:", weatherCode);
        description = "Unknown";
        image = "bi-question-circle"; // Default icon
        bgColor = "#E0E0E0"; // Default background
        textColor = "#000"; // Default text color
    }

    console.log("Returning:", { description, image, bgColor, textColor });
    return { description, image, bgColor, textColor };
}


function getWeatherDescription_daily12(dailyData, index, weatherCodeDescriptions) {
    // console.log("Final Debugging", dailyData, index, weatherCodeDescriptions);

    // Retrieve the weather code for the given index
    const weatherCode = dailyData?.daily?.weather_code?.[index];
    console.log("Weather code at index:", index, "is:", weatherCode);

    let description, image, bgColor, textColor;

    // Validate inputs
    if (weatherCode === undefined || weatherCode === null) {
        console.error("No weather code found for index:", index);
        return { description: 'Unknown', image: 'bi-question-circle', bgColor: '#E0E0E0', textColor: '#000' };
    }

    if (!weatherCodeDescriptions || typeof weatherCodeDescriptions !== 'object') {
        console.error("Invalid weatherCodeDescriptions provided:", weatherCodeDescriptions);
        return { description: 'Unknown', image: 'bi-question-circle', bgColor: '#E0E0E0', textColor: '#000' };
    }

    // Find matching weather description
    const weatherDetails = weatherCodeDescriptions[weatherCode];
    if (weatherDetails) {
        description = weatherDetails.day.description;
        console.log("Weather description found:", description);

        // Retrieve corresponding icon
        image = getWeatherIcon(description);

        // Assign colors based on weather description
        switch (description) {
            case "Sunny":
            case "Mainly Sunny":
                bgColor = '#FFD700'; // Gold
                textColor = '#000'; // Black
                break;
            case "Clear":
            case "Mainly Clear":
                bgColor = '#87CEEB'; // Sky blue
                textColor = '#000'; // Black
                break;
            case "Partly Cloudy":
            case "Cloudy":
                bgColor = '#B0C4DE'; // Light steel blue
                textColor = '#000'; // Black
                break;
            case "Foggy":
            case "Rime Fog":
                bgColor = '#D3D3D3'; // Light gray
                textColor = '#000'; // Black
                break;
            case "Light Drizzle":
            case "Drizzle":
            case "Heavy Drizzle":
                bgColor = '#ADD8E6'; // Light blue
                textColor = '#000'; // Black
                break;
            case "Light Rain":
            case "Rain":
            case "Heavy Rain":
                bgColor = '#4682B4'; // Steel blue
                textColor = '#FFF'; // White
                break;
            case "Light Snow":
            case "Snow":
            case "Heavy Snow":
            case "Snow Grains":
                bgColor = '#FFFFFF'; // White
                textColor = '#000'; // Black
                break;
            case "Thunderstorm":
            case "Light Thunderstorms With Hail":
            case "Thunderstorm With Hail":
                bgColor = '#800080'; // Purple
                textColor = '#FFF'; // White
                break;
            default:
                console.warn("No specific case for description:", description);
                bgColor = '#E0E0E0'; // Default gray
                textColor = '#000'; // Black
        }
    } else {
        console.warn("No match for weather code in descriptions:", weatherCode);
        description = 'Unknown';
        image = 'bi-question-circle'; // Default icon
        bgColor = '#E0E0E0'; // Default background
        textColor = '#000'; // Default text color
    }

    // console.log("Returning:", { description, image, bgColor, textColor });
    return { description, image, bgColor, textColor };
}


// Example getWeatherIcon function
function getWeatherIcon(description) {
    const iconMapping = {
        "Sunny": "bi-brightness-high",
        "Mainly Sunny": "bi-brightness-high",
        "Partly Cloudy": "bi-cloud-sun",
        "Cloudy": "bi-cloud",
        "Foggy": "bi-cloud-fog2",
        "Rime Fog": "bi-cloud-fog2",
        "Light Drizzle": "bi-cloud-drizzle",
        "Drizzle": "bi-cloud-drizzle",
        "Heavy Drizzle": "bi-cloud-rain-heavy",
        "Light Rain": "bi-cloud-rain",
        "Rain": "bi-cloud-rain-heavy",
        "Heavy Rain": "bi-cloud-rain-heavy",
        "Light Freezing Drizzle": "bi-cloud-drizzle",
        "Freezing Drizzle": "bi-cloud-drizzle",
        "Light Freezing Rain": "bi-cloud-rain",
        "Freezing Rain": "bi-cloud-rain",
        "Light Snow": "bi-cloud-snow",
        "Snow": "bi-cloud-snow",
        "Heavy Snow": "bi-cloud-snow-heavy",
        "Snow Grains": "bi-cloud-snow",
        "Light Showers": "bi-cloud-drizzle",
        "Showers": "bi-cloud-drizzle",
        "Heavy Showers": "bi-cloud-rain-heavy",
        "Light Snow Showers": "bi-cloud-snow",
        "Snow Showers": "bi-cloud-snow",
        "Thunderstorm": "bi-cloud-lightning",
        "Light Thunderstorms With Hail": "bi-cloud-lightning-rain",
        "Thunderstorm With Hail": "bi-cloud-lightning-rain"
    };

    return {
        icon: iconMapping[description] || "bi-question-circle" // Default icon if description not found
    };
}


//seasonal Weather forecast

async function fetchSeasonalWeather(latitude,longitude) {
    const weatherUrl = `https://seasonal-api.open-meteo.com/v1/seasonal?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=Asia/Kolkata&start_date=${getStartDate()}&end_date=${getEndDate()}&time_step=7`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const weatherData = await weatherResponse.json();
        console.log("seasonal Weather DATA : ", weatherData);
        prepareAndSendWeatherData_seasonal(weatherData);
    } catch (error) {
        console.error('Fetching seasonal weather data failed:', error);
    }
}

function getStartDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getEndDate() {
    const today = new Date();
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);
    return sixMonthsLater.toISOString().split('T')[0];
}
async function sendGraphData_seasonal(dataSets) {
    console.log("Received DATAsets:", dataSets);
    try {
        // Send the data to the backend to generate the graph
        const response = await fetch('http://127.0.0.1:3000/weather/generateSeasonal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataSets),
        });

        if (!response.ok) throw new Error('Error generating graphs');

        // Parse the JSON response containing the graph HTML
        const data = await response.json();
        const graphContainer = document.createElement('div');
        graphContainer.className = 'graphContainer';
        graphContainer.innerHTML = data.graph_html;
        document.querySelector('.graphSeason').appendChild(graphContainer);

        // const graphContainer1 = document.createElement('div');
        // graphContainer1.className = 'graphContainer1';
        // graphContainer1.innerHTML = data.graph_html;
        // document.querySelector('.graphaqi').appendChild(graphContainer1);

        // Function to evaluate scripts within a container
        function evaluateScripts(container) {
            const scripts = container.getElementsByTagName('script');
            for (const script of scripts) {
                const newScript = document.createElement('script');
                newScript.type = script.type || 'text/javascript';
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.innerText;
                }
                document.head.appendChild(newScript);
                document.head.removeChild(newScript); // Clean up after execution
            }
        }

        // Evaluate scripts in both containers
        evaluateScripts(graphContainer);
        // evaluateScripts(graphContainer1);

        // Style the containers for better presentation
        const styleContainer = (container) => {
            container.style.overflowX = 'auto'; // Enable horizontal scrolling
            container.style.marginTop = '10px'; // Add margin-top for additional spacing
            // container.style.border = '2px solid #4a90e2'; // Add a bold border with a contrasting color
            container.style.padding = '6px';  // Slightly larger padding for a spacious feel
            container.style.borderRadius = '12px'; // Larger rounded corners for a modern look
            container.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.15)'; // Enhance shadow for depth
            container.style.backgroundImage = 'linear-gradient(to right, #e3f2fd, #bbdefb)'; // Attractive gradient background
            container.style.display = 'flex'; // Ensure the container fits content width
            container.style.maxWidth = '100%'; // Keep it responsive within the parent container

            // Add hover effect for interactivity
            container.addEventListener('mouseover', () => {
                container.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.2)'; // Deepen shadow on hover
            });
            container.addEventListener('mouseout', () => {
                container.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.15)'; // Restore original shadow
            });
        };

        styleContainer(graphContainer);

    }
    catch (error) {
        console.error('Fetching seasonal weather data failed:', error);
    }
}

async function prepareAndSendWeatherData_seasonal(weatherData) {
    let time = new Date(getStartDate());
    let endDate = new Date(getEndDate());
    let index = 0;
    let date = [];
    let tempMax = [];
    let tempMin = [];
    let windSpeed = [];
    let rain = [];
    console.log("Received Weather Data at prepareAndSendWeatherData fxn : ", weatherData);
    while (time <= endDate && index < 182) {
        const formattedDate = time.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        date.push(formattedDate);
        tempMax.push(weatherData.daily.temperature_2m_max_member01[index]);
        tempMin.push(weatherData.daily.temperature_2m_min_member01[index]);
        windSpeed.push(parseFloat(weatherData.daily.wind_speed_10m_max_member01[index] * 0.27).toFixed(2));
        rain.push(weatherData.daily.precipitation_sum_member01[index]);
        time.setDate(time.getDate() + 7); // Adding 7 days
        index += 7;
    }


    const parsedData = {
        date: date,
        tempMax: tempMax,
        tempMin: tempMin,
        windSpeed: windSpeed,
        rain: rain,
    };
    // Send the data to the server
    sendGraphData_seasonal(parsedData);
}

//AQI
// AQI function to fetch air quality data
// AQI function to fetch air quality data
// async function getQI(latitude, longitude) {
//     try {
//         const response = await fetch(`https://api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&forecast_days=1`);

//         // Check if the response is successful (status code 200)
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         // Parse the response JSON
//         const data = await response.json();

//         // Check if 'hourly' data exists in the response
//         if (data && data.hourly) {
//             return data.hourly; // Return hourly data (AQI, PM10, PM2.5, NO2, O3)
//         } else {
//             throw new Error("Invalid data structure in response");
//         }
//     } catch (error) {
//         console.error("Error fetching AQI data:", error);
//         return null; // Return null if there's an error
//     }
// }

// // Example Usage
// const latitude = 37.7749;  // San Francisco latitude
// const longitude = -122.4194;  // San Francisco longitude

// getAQI(latitude, longitude).then(data => {
//     if (data) {
//         console.log("Air Quality Data:", data);
//     } else {
//         console.log("Failed to fetch air quality data.");
//     }
// });
