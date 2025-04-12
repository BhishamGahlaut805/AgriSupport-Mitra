//hourlyData ,graphs,weather boxes

// Function to fetch the weather data, now accepting longitude and latitude as arguments
let hData = "";
async function fetchHourlyWeather(latitude, longitude) {
    // const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,cloudcover,rain,snowfall&timezone=Asia/Kolkata&forecast_days=7`;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm&timezone=Asia/Kolkata&forecast_days=7`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("This is hourly data", data);
        // Call function to create the weather boxes for 24 hours
        createWeatherBoxes(data);

        //sending weather data to the server
        prepareAndSendWeatherData(data,latitude,longitude);
        hData = data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}
let dweather = "";
async function fetchFutureWeather_daily1(latitude, longitude) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=Asia/Kolkata&forecast_days=16`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const weatherData = await weatherResponse.json();
        dweather = weatherData;
        return weatherData;
    } catch (error) {
        console.error('Fetching weather data failed:', error);
    }
}

//prepare and send weather data to the server
async function prepareAndSendWeatherData(data,latitude,longitude) {
    const currentHour = new Date().getHours();  // Get the current hour
    const futureData = await fetchFutureWeather_daily1(latitude, longitude);

    // console.log("This is a Futuredaayayyaayua : ", futureData);
    const sunshine_duration = (futureData.daily.sunshine_duration[0] / 3600).toFixed(2);

    // for (let i = 0; i < 16; i++) {
    //     minTemperatures.push(futureData.daily.temperature_2m_min[i]);
    //     maxTemperatures.push(futureData.daily.temperature_2m_max[i]);
    // }
    // Extract the relevant data for the next 24 hours
    const parsedData = data.hourly.time.slice(currentHour, currentHour + 24).map((time, index) => {
        const date = new Date(time);
        const date1 = new Date(futureData.daily.time[index]);

        return {
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }),
            temperature: data.hourly.temperature_2m[index],
            cloudCover: data.hourly.cloud_cover[index],
            rainChance: data.hourly.precipitation[index],
            windSpeed: data.hourly.wind_speed_10m[index],
            soil_moisture_0_to_1cm: data.hourly.soil_moisture_0_to_1cm[index],
            soil_temperature_18cm: data.hourly.soil_temperature_18cm[index],
            humidity: data.hourly.relative_humidity_2m[index],
            sunshine_duration: sunshine_duration,
            tempDailyMax: futureData.daily.temperature_2m_max[index],
            tempDailyMin: futureData.daily.temperature_2m_min[index],
            date: date1.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            }),
            windspeedF: futureData.daily.wind_speed_10m_max[index],
            rainChanceF: futureData.daily.precipitation_probability_max[index],
            sunshineF: (futureData.daily.sunshine_duration[index] / 3600).toFixed(2),

        };
    });

    // Send the data to the server
    sendGraphData(parsedData);
}
let desc = "";
async function createWeatherBoxes(hourlyData) {
    const parentContainer = document.querySelector('.parentCont'); // Parent container
    const parentContainer1 = document.querySelector('.parentCont1'); // Parent container2

    // Clear any existing boxes before appending new ones
    parentContainer.innerHTML = '';
    parentContainer1.innerHTML = '';

    // Get the current time and find the starting index for the current hour
    const currentHour = new Date().getHours();

    // Loop through the next 24 hours of the hourly data, starting from the current hour
    for (let i = currentHour; i < currentHour + 24; i++) {

        const index = i % 24; // This ensures we loop back to the start if we go past 23

        // Create a new box div
        const weatherBox = document.createElement('div');
        weatherBox.className = 'col-auto mx-3 border rounded d-flex flex-column justify-content-center align-items-center shadow-lg square-container invert-text';

        // Set a fixed height and width for the weather box
        weatherBox.style.height = '600px';
        weatherBox.style.width = '200px';

        // Get weather description, icon, and background color based on conditions
        const { description, image, bgColor, textColor } = await getWeatherDescription(hourlyData, index);
        console.log("imgage data", image);
        desc = description;
        // Set the background color of the box dynamically
        weatherBox.style.backgroundColor = bgColor;
        weatherBox.style.color = textColor;

        // Temperature element with a large font
        const tempElement = document.createElement('p');
        tempElement.className = 'text-center h2 font-weight-bold c1Info2';
        tempElement.innerText = `${hourlyData.hourly.apparent_temperature[i]}°C`; // Display temperature
        weatherBox.appendChild(tempElement);

        // Weather icon based on the weather description
        const weatherIcon = document.createElement('i');
        // weatherIcon.className = `bi ${iconClass} display-4 mb-3`; // Bootstrap icon class
        weatherIcon.className = `${image} display-1 mb-3 bi-2x bi-fill`;
        weatherBox.appendChild(weatherIcon);

        //description of weather
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'text-center small c1Info';
        descriptionElement.innerHTML = `<strong>${description}</strong>`;
        weatherBox.appendChild(descriptionElement);

        // Rain chance and precipitation
        const rainElement = document.createElement('p');
        rainElement.className = 'text-center small c1Info';
        rainElement.innerHTML = `<strong>Rain Chance:</strong> ${hourlyData.hourly.precipitation_probability[i]}% | ${hourlyData.hourly.precipitation[i]} mm`;
        weatherBox.appendChild(rainElement);

        // Wind speed and direction
        const windElement = document.createElement('p');
        windElement.className = 'text-center small c1Info';
        windElement.innerHTML = `<strong>Wind:</strong> ${hourlyData.hourly.wind_speed_10m[i]} m/s | ${hourlyData.hourly.wind_direction_10m[index]}° ${getCardinalDirection(hourlyData.hourly.wind_direction_10m[index])}`;
        weatherBox.appendChild(windElement);


        //cloud cover
        const cloudElement = document.createElement('p');
        cloudElement.className = 'text-center small c1Info';
        cloudElement.innerHTML = `<strong>Cloud Cover:</strong> ${hourlyData.hourly.cloud_cover[i]}%`;
        weatherBox.appendChild(cloudElement);

        //soil-soil_moisture_0_to_1cm
        const soilElement = document.createElement('p');
        soilElement.className = 'text-center small c1Info';
        soilElement.innerHTML = `<strong>Soil Moisture:</strong> ${(hourlyData.hourly.soil_moisture_0_to_1cm[i] * 100).toFixed(1)}%`;
        weatherBox.appendChild(soilElement);

        //soil temperatue soil_temperature_18cm
        const soilTempElement = document.createElement('p');
        soilTempElement.className = 'text-center small c1Info';
        soilTempElement.innerHTML = `<strong>Soil Temperature:</strong> ${hourlyData.hourly.soil_temperature_18cm[i]}°C`;
        weatherBox.appendChild(soilTempElement);

        //humidity
        const humidityElement = document.createElement('p');
        humidityElement.className = 'text-center small c1Info';
        humidityElement.innerHTML = `<strong>Humidity:</strong> ${hourlyData.hourly.relative_humidity_2m[i]}%`;
        weatherBox.appendChild(humidityElement);

        //visibility
        const visibilityElement = document.createElement('p');
        visibilityElement.className = 'text-center small c1Info';
        visibilityElement.innerHTML = `<strong>Visibility:</strong> ${hourlyData.hourly.visibility[i]}m`;
        weatherBox.appendChild(visibilityElement);

        // Add suggestion for good weather, cloudy, or rainy
        const suggestionElement = document.createElement('p');
        suggestionElement.className = 'text-center text-white small';
        let suggestionText = '';
        if (description === 'Clear' || description === 'Good Weather') {
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

        // Create hour element
        const hourElement = document.createElement('h6');
        hourElement.className = 'text-center h6';

        // Get the time for the current hour
        const time = hourlyData.hourly.time[i];
        const date = new Date(time);

        // Format the date and time
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        // Set the formatted time and date
        hourElement.innerHTML = `<strong>${formattedTime}, ${formattedDate}</strong>`;
        hourElement.style.color = textColor;
        weatherBox.appendChild(hourElement);

        const previousDate = new Date(date);
        previousDate.setHours(previousDate.getHours() - 24);
        const formattedPreviousDate = previousDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        document.querySelector('.hourlyData').innerHTML = `Hourly Weather Data for ${formattedPreviousDate}`;
        // Append the weather box to the parent container
        parentContainer.appendChild(weatherBox);
    }

    // Loop through 24 hours to 48 hours weather DATA hourly

    for (let i = currentHour + 24; i < currentHour + 48; i++) {

        const index = i % 24; // This ensures we loop back to the start if we go past 23

        // Create a new box div
        const weatherBox = document.createElement('div');
        weatherBox.className = 'col-auto mx-3 border rounded d-flex flex-column justify-content-center align-items-center shadow-lg square-container ';

        // Set a fixed height and width for the weather box
        weatherBox.style.height = '600px';
        weatherBox.style.width = '200px';

        // Get weather description, icon, and background color based on conditions
        const { description, image, bgColor, textColor } = await getWeatherDescription(hourlyData, index);

        // Set the background color of the box dynamically
        weatherBox.style.backgroundColor = bgColor;
        weatherBox.style.color = textColor;

        // Temperature element with a large font
        const tempElement = document.createElement('p');
        tempElement.className = 'text-center h2 font-weight-bold c1Info2';
        tempElement.innerText = `${hourlyData.hourly.apparent_temperature[i]}°C`; // Display temperature
        weatherBox.appendChild(tempElement);

        // Weather icon based on the weather description
        const weatherIcon = document.createElement('i');
        // weatherIcon.className = `bi ${iconClass} display-4 mb-3`; // Bootstrap icon class
        weatherIcon.className = `${image} display-1 mb-3 bi-2x bi-fill`;
        weatherBox.appendChild(weatherIcon);

        //description of weather
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'text-center small c1Info';
        descriptionElement.innerHTML = `<strong>${description}</strong>`;
        weatherBox.appendChild(descriptionElement);

        // Rain chance and precipitation
        const rainElement = document.createElement('p');
        rainElement.className = 'text-center small c1Info';
        rainElement.innerHTML = `<strong>Rain Chance:</strong> ${hourlyData.hourly.precipitation_probability[i]}% | ${hourlyData.hourly.precipitation[i]} mm`;
        weatherBox.appendChild(rainElement);

        // Wind speed and direction
        const windElement = document.createElement('p');
        windElement.className = 'text-center small c1Info';
        windElement.innerHTML = `<strong>Wind:</strong> ${hourlyData.hourly.wind_speed_10m[i]} m/s | ${hourlyData.hourly.wind_direction_10m[index]}° ${getCardinalDirection(hourlyData.hourly.wind_direction_10m[index])}`;
        weatherBox.appendChild(windElement);

        //cloud cover
        const cloudElement = document.createElement('p');
        cloudElement.className = 'text-center small c1Info';
        cloudElement.innerHTML = `<strong>Cloud Cover:</strong> ${hourlyData.hourly.cloud_cover[i]}%`;
        weatherBox.appendChild(cloudElement);

        //soil-soil_moisture_0_to_1cm
        const soilElement = document.createElement('p');
        soilElement.className = 'text-center small c1Info';
        soilElement.innerHTML = `<strong>Soil Moisture:</strong> ${(hourlyData.hourly.soil_moisture_0_to_1cm[i] * 100).toFixed(1)}%`;
        weatherBox.appendChild(soilElement);

        //soil temperatue soil_temperature_18cm
        const soilTempElement = document.createElement('p');
        soilTempElement.className = 'text-center small c1Info';
        soilTempElement.innerHTML = `<strong>Soil Temperature:</strong> ${hourlyData.hourly.soil_temperature_18cm[i]}°C`;
        weatherBox.appendChild(soilTempElement);

        //humidity
        const humidityElement = document.createElement('p');
        humidityElement.className = 'text-center small c1Info';
        humidityElement.innerHTML = `<strong>Humidity:</strong> ${hourlyData.hourly.relative_humidity_2m[i]}%`;
        weatherBox.appendChild(humidityElement);

        //visibility
        const visibilityElement = document.createElement('p');
        visibilityElement.className = 'text-center small c1Info';
        visibilityElement.innerHTML = `<strong>Visibility:</strong> ${hourlyData.hourly.visibility[i]}m`;
        weatherBox.appendChild(visibilityElement);

        // Add suggestion for good weather, cloudy, or rainy
        const suggestionElement = document.createElement('p');
        suggestionElement.className = 'text-center text-white small';
        let suggestionText = '';
        if (description === 'Clear' || description === 'Good Weather') {
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

        // Create hour element
        const hourElement = document.createElement('h6');
        hourElement.className = 'text-center h6';

        // Get the time for the current hour
        const time = hourlyData.hourly.time[i];
        const date = new Date(time);

        // Format the date and time
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });

        // Set the formatted time and date
        hourElement.innerHTML = `<strong>${formattedTime}, ${formattedDate}</strong>`;
        hourElement.style.color = textColor;
        weatherBox.appendChild(hourElement);
        const previousDate = new Date(date);
        previousDate.setHours(previousDate.getHours() - 24);
        const formattedPreviousDate = previousDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        document.querySelector('.hourlyData1').innerHTML = `Hourly Weather Data for ${formattedPreviousDate}`;
        // Append the weather box to the parent container
        parentContainer1.appendChild(weatherBox);
    }

}

//Passing data to the server
async function sendGraphData(dataSets) {
    console.log("Received DATAsets:", dataSets);
    try {
        // Send the data to the backend to generate the graph
        const response = await fetch('http://127.0.0.1:3000/weather/generateGraph', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataSets),
        });

        if (!response.ok) throw new Error('Error generating graphs');

        // Parse the JSON response containing the graph HTML
        const data = await response.json();

        // Create containers to hold the graph HTML
        const graphContainer = document.createElement('div');
        const graphContainer1 = document.createElement('div');
        const piebox = document.createElement('div');
        const graphContainer2 = document.createElement('div');
        const graphContainer3 = document.createElement('div');
        // const piebox1 = document.createElement('div');

        graphContainer.className = 'graphContainer';
        graphContainer1.className = 'graphContainer1';
        graphContainer2.className = 'graphContainer2';
        graphContainer3.className = 'graphContainer3';

        // Insert the pie chart HTML into piebox
        piebox.innerHTML = data.pie_chart_html;
        // piebox1.innerHTML = data.pie_chart_html;
        document.querySelector('.c3graphs').appendChild(piebox);

        // Insert the HTML strings directly into the containers
        graphContainer.innerHTML = data.graph_html;
        graphContainer1.innerHTML=data.graph_html2;
        graphContainer2.innerHTML = data.graph_html3;
        graphContainer3.innerHTML = data.graph_html4;

        // Append the graph containers to the target elements
        document.querySelector('.c2Graphs').appendChild(graphContainer);
        document.querySelector('.c3graphs').appendChild(graphContainer1);
        // document.querySelector('.c3graphs').appendChild(piebox1);
        document.querySelector('.c4graphs').appendChild(graphContainer2);
        document.querySelector('.c4graphs').appendChild(graphContainer3);

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
        evaluateScripts(graphContainer1);
        evaluateScripts(piebox);
        // evaluateScripts(piebox1);
        evaluateScripts(graphContainer2);
        evaluateScripts(graphContainer3);

        piebox.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.15)';
        piebox.style.overflowX = 'auto'; // Enable horizontal scrolling
        piebox.style.marginTop = '10px';
        piebox.style.maxWidth = '100%';

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
        styleContainer(graphContainer1);
        styleContainer(graphContainer2);
        styleContainer(graphContainer3);
        // styleContainer(piebox1)

    } catch (error) {
        console.error(error);
        alert('Failed to generate the graphs.');
    }
}


// Function to get weather description, icon, and colors
async function loadWeatherCodeDescriptions() {
    try {
        const response = await fetch('WMO.json'); // Adjust path to your JSON file
        if (!response.ok) {
            throw new Error('Failed to fetch WMO.json');
        }
        const weatherCodeDescriptions = await response.json();
        return weatherCodeDescriptions;
    } catch (error) {
        console.error('Error loading weather code descriptions:', error);
        return null;
    }
}


//get weather description icon
function getWeatherIcon1(description) {
    const iconMapping = {
        "Sunny": "bi-brightness-high",
        "Clear": "bi-moon",
        "Mainly Sunny": "bi-sun",
        "Mainly Clear": "bi-moon-stars",
        "Partly Cloudy": "bi-cloud-sun",
        "Cloudy": "bi-cloud",
        "Foggy": "bi-cloud-fog2",
        "Rime Fog": "bi-cloud-fog",
        "Light Drizzle": "bi-cloud-drizzle",
        "Drizzle": "bi-cloud-drizzle",
        "Heavy Drizzle": "bi-cloud-rain-heavy",
        "Light Freezing Drizzle": "bi-cloud-drizzle",
        "Freezing Drizzle": "bi-cloud-drizzle",
        "Light Rain": "bi-cloud-rain",
        "Rain": "bi-cloud-rain-heavy",
        "Heavy Rain": "bi-cloud-rain-heavy",
        "Light Freezing Rain": "bi-cloud-sleet",
        "Freezing Rain": "bi-cloud-sleet",
        "Light Snow": "bi-cloud-snow",
        "Snow": "bi-cloud-snow",
        "Heavy Snow": "bi-cloud-snow-heavy",
        "Snow Grains": "bi-cloud-snow",
        "Light Showers": "bi-cloud-rain",
        "Showers": "bi-cloud-showers-heavy",
        "Heavy Showers": "bi-cloud-rain-heavy",
        "Light Snow Showers": "bi-cloud-snow",
        "Snow Showers": "bi-cloud-snow-heavy",
        "Thunderstorm": "bi-cloud-lightning",
        "Light Thunderstorms With Hail": "bi-cloud-lightning-rain",
        "Thunderstorm With Hail": "bi-cloud-lightning-rain"
    };

    return iconMapping[description] || "bi-question-circle"; // Default icon if description not found
}

function getBrightness(hexColor) {
    // Remove the hash if present
    hexColor = hexColor.replace('#', '');

    // Convert the hex values to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

    // Calculate the brightness
    return (r * 299 + g * 587 + b * 114) / 1000;
}

function getTextColorBasedOnBackground(hexColor) {
    const brightness = getBrightness(hexColor);
    // If brightness is less than 128, use white text, otherwise use black text
    return brightness < 128 ? '#FFFFFF' : '#000000';
}
async function getWeatherDescription(hourlyData, index) {
    const weatherCode = hourlyData.hourly.weather_code[index];
    const time = new Date(hourlyData.hourly.time[index]).getHours();
    const isDaytime = time >= 6 && time < 18;

    const windSpeed = hourlyData.hourly.wind_speed_10m[index];
    const precipitation = hourlyData.hourly.precipitation[index];

    let description, image, bgColor, colorDescription;

    const weatherCodeDescriptions = await loadWeatherCodeDescriptions();

    if (weatherCodeDescriptions && weatherCodeDescriptions[weatherCode]) {
        const weatherDetails = isDaytime
            ? weatherCodeDescriptions[weatherCode].day
            : weatherCodeDescriptions[weatherCode].night;

        description = weatherDetails.description;
        image = getWeatherIcon1(description);

        if (precipitation > 10) {
            description = 'Heavy Rain';
            image = 'bi-cloud-rain-heavy';
            bgColor = isDaytime ? '#87CEEB' : '#4682B4'; // Light sky blue for day, Steel blue for night
            colorDescription = "Cool slate gray for heavy rain.";
        } else if (windSpeed > 15) {
            description = 'Heavy Wind';
            image = 'bi-wind';
            bgColor = isDaytime ? '#FFA07A' : '#FA8072'; // Light salmon for day, Salmon for night
            colorDescription = "Dark gray for heavy wind.";
        } else {
            switch (description) {
                case "Sunny":
                    bgColor = isDaytime ? '#FFD700' : '#4B0082'; // Gold for day, Indigo for night
                    colorDescription = isDaytime ? "Bright gold for sunny weather." : "Deep indigo for clear night skies.";
                    break;
                case "Clear":
                    bgColor = isDaytime ? '#FFD700' : '#4B0082'; // Gold for day, Indigo for night
                    colorDescription = isDaytime ? "Bright gold for clear skies." : "Deep indigo for clear night skies.";
                    break;
                case "Mainly Sunny":
                    bgColor = '#FFFACD'; // Lemon chiffon
                    colorDescription = "Soft lemon chiffon for mainly sunny skies.";
                    break;
                case "Mainly Clear":
                    bgColor = isDaytime ? '#FFFACD' : '#4B0082'; // Lemon chiffon for day, Indigo for night
                    colorDescription = isDaytime ? "Soft lemon chiffon for mainly clear skies." : "Deep indigo for mainly clear night skies.";
                    break;
                case "Partly Cloudy":
                    bgColor = isDaytime ? '#B0C4DE' : '#2F4F4F'; // Light steel blue for day, Dark slate gray for night
                    colorDescription = isDaytime ? "Light steel blue for partly cloudy weather." : "Dark slate gray for partly cloudy night.";
                    break;
                case "Cloudy":
                    bgColor = isDaytime ? '#B0C4DE' : '#2F4F4F'; // Light steel blue for day, Dark slate gray for night
                    colorDescription = isDaytime ? "Light steel blue for cloudy weather." : "Dark slate gray for cloudy night.";
                    break;
                case "Foggy":
                    bgColor = isDaytime ? '#FFFFFF' : '#2F4F4F'; // White for day, Dark slate gray for night
                    colorDescription = "Subtle light gray for foggy conditions.";
                    break;
                case "Rime Fog":
                    bgColor = isDaytime ? '#D3D3D3' : '#2F4F4F'; // Light gray for day, Dark slate gray for night
                    colorDescription = "Subtle light gray for rime fog.";
                    break;
                case "Light Drizzle":
                case "Drizzle":
                case "Heavy Drizzle":
                    bgColor = isDaytime ? '#87CEFA' : '#4682B4'; // Light sky blue for day, Steel blue for night
                    colorDescription = "Cool slate gray representing drizzle.";
                    break;
                case "Light Freezing Drizzle":
                case "Freezing Drizzle":
                    bgColor = isDaytime ? '#F5F5F5' : '#DCDCDC'; // White smoke for day, Gainsboro for night
                    colorDescription = "Cool slate gray representing freezing drizzle.";
                    break;
                case "Light Rain":
                case "Rain":
                case "Heavy Rain":
                    bgColor = isDaytime ? '#778899' : '#2F4F4F'; // Slate gray for day, Dark slate gray for night
                    colorDescription = "Cool slate gray representing rain.";
                    break;
                case "Light Freezing Rain":
                case "Freezing Rain":
                    bgColor = isDaytime ? '#778899' : '#2F4F4F'; // Slate gray for day, Dark slate gray for night
                    colorDescription = "Cool slate gray representing freezing rain.";
                    break;
                case "Light Snow":
                case "Snow":
                case "Heavy Snow":
                case "Snow Grains":
                    bgColor = isDaytime ? '#F0FFFF' : '#2F4F4F'; // Azure white for day, Dark slate gray for night
                    colorDescription = "Bright and snowy azure white for snowfall.";
                    break;
                case "Light Showers":
                case "Showers":
                case "Heavy Showers":
                    bgColor = isDaytime ? '#778899' : '#2F4F4F'; // Slate gray for day, Dark slate gray for night
                    colorDescription = "Cool slate gray representing showers.";
                    break;
                case "Light Snow Showers":
                case "Snow Showers":
                    bgColor = isDaytime ? '#F0FFFF' : '#2F4F4F'; // Azure white for day, Dark slate gray for night
                    colorDescription = "Bright and snowy azure white for snow showers.";
                    break;
                case "Thunderstorm":
                case "Light Thunderstorms With Hail":
                case "Thunderstorm With Hail":
                    bgColor = isDaytime ? '#FF4500' : '#8B0000'; // Hot orange-red for day, Dark red for night
                    colorDescription = "Fiery orange-red for thunderstorm warnings.";
                    break;
                default:
                    bgColor = isDaytime ? '#ADD8E6' : '#2F4F4F'; // Light blue for day, Dark slate gray for night
                    colorDescription = "Default light blue for neutral or unknown weather.";
            }
        }
    } else {
        description = 'Unknown';
        image = 'bi-question-circle';
        bgColor = isDaytime ? '#ADD8E6' : '#2F4F4F'; // Light blue for day, Dark slate gray for night
        colorDescription = "Default light blue for neutral or unknown weather.";
    }

    const textColor = getTextColorBasedOnBackground(bgColor);

    return { description, image, bgColor,textColor };
}


function readWeatherReport1() {
    const synth = window.speechSynthesis;
    if (!synth) {
        alert("❌ Text-to-speech is not supported in your browser.");
        return;
    }
    if (hData =="" ) {
        return;
    }

    const i = 4; // ✅ Get data for the 5th hour from now
    const hour = new Date(hData.hourly.time[i]).getHours(); // Extract hour in 24-hour format
    const rainChance = hData.hourly.precipitation_probability[i] || "N/A";
    const prec = hData.hourly.precipitation[i] || "N/A";
    const wspeed = hData.hourly.wind_speed_10m[i] || "N/A";
    const cloud = hData.hourly.cloud_cover[i] || "N/A";
    const soilmoisture = (hData.hourly.soil_moisture_0_to_1cm[i] * 100).toFixed(1) || "N/A";
    const soiltemp = hData.hourly.soil_temperature_18cm[i] || "N/A";
    const humidity1 = hData.hourly.relative_humidity_2m[i] || "N/A";
    const visibility1 = hData.hourly.visibility[i] || "N/A";
    const descr = desc || "N/A";

    let transcript;

    if (lang === "hi") {
        transcript = `🌤 नमस्ते किसान साथी!
        आपके स्थान  का अगले 5वें घंटे (${hour}:00 बजे) का मौसम अपडेट इस प्रकार है:
        ☁️ बादल: ${cloud}%.
        💧 वर्षा की संभावना: ${rainChance}%.
        🌧️ वर्षा की मात्रा: ${prec} मिमी.
        🌬️ हवा की गति: ${wspeed} किलोमीटर प्रति घंटा.
        💦 नमी: ${humidity1}%.
        🏜️ मिट्टी की नमी: ${soilmoisture}%.
        🌡️ मिट्टी का तापमान: ${soiltemp}°C.
        👁️ दृश्यता: ${visibility1} मीटर.
        🌦️ मौसम की स्थिति: ${descr}.
        कृपया अपनी कृषि गतिविधियों की योजना इस जानकारी के अनुसार बनाएं। धन्यवाद! 🌾`;
    } else {
        transcript = `🌤 Hello Farmer Friend!
        Here is the weather update for the 5th hour (${hour}:00) from now in Your City:
        ☁️ Cloud Cover: ${cloud}%.
        💧 Rain Probability: ${rainChance}%.
        🌧️ Expected Rainfall: ${prec} mm.
        🌬️ Wind Speed: ${wspeed} km/h.
        💦 Humidity: ${humidity1}%.
        🏜️ Soil Moisture: ${soilmoisture}%.
        🌡️ Soil Temperature: ${soiltemp}°C.
        👁️ Visibility: ${visibility1} meters.
        🌦️ Weather Condition: ${descr}.
        Please plan your farming activities accordingly. Thank you! 🌾`;
    }

    // Stop any ongoing speech
    if (weatherUtterance) {
        synth.cancel();
    }

    // Create a new utterance with a natural speech rate and tone
    weatherUtterance = new SpeechSynthesisUtterance(transcript);
    weatherUtterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    weatherUtterance.rate = 0.9;  // Slightly slower for better clarity
    weatherUtterance.pitch = 1;
    weatherUtterance.volume = 1;

    synth.speak(weatherUtterance);
}


function pauseWeatherSpeech1() {
    if (window.speechSynthesis.speaking && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        console.log("⏸️ Speech paused");
    }
}

// ✅ Function to Resume Speech
function resumeWeatherSpeech1() {
    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        console.log("▶️ Speech resumed");
    }
}

// ✅ Function to Stop Speech and Reset Variables
function stopWeatherSpeech1() {
    if (weatherUtterance) {
        window.speechSynthesis.cancel();
        weatherUtterance = null;
        isPaused = false;
        resetSpeechSettings1();
    }
}

// ✅ Function to Reset Speech Settings
function resetSpeechSettings1() {
    weatherUtterance = null;
    voiceChangeCount = 1;
    initialVoiceSet = false;
    isPaused = false;
    console.log("🔄 Speech settings reset!");
}

// ✅ Function to Set Initial Voice to Microsoft Swara (Hindi)
function setInitialVoice1() {
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
function toggleLanguage1() {
    lang = lang === "en" ? "hi" : "en";
    console.log(`🌎 Language changed to ${lang === "hi" ? "Hindi" : "English"}`);
    readWeatherReport1();
}

// ✅ Function to Change Voice
function changeVoice1() {
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
        setInitialVoice1();
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
    setInitialVoice1();
};

// ✅ Reset everything when the page refreshes
window.onload = function () {
    window.speechSynthesis.cancel();
    stopWeatherSpeech1();
    resetSpeechSettings1();
};



function readWeatherReport2() {
    const synth = window.speechSynthesis;
    if (!synth) {
        alert("❌ Text-to-speech is not supported in your browser.");
        return;
    }
    if (dweather=="" ) {
        console.warn("⚠️ Weather data unavailable for tomorrow.");
        return;
    }

    const i = 1; // ✅ Get weather data for tomorrow (index 1 in daily forecast)
    const date = new Date(dweather.daily.time[i]).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

    // Extract data for tomorrow
    const maxTemp = dweather.daily.temperature_2m_max[i] || "";
    const minTemp = dweather.daily.temperature_2m_min[i] || "";
    const apparentMax = dweather.daily.apparent_temperature_max[i] || "";
    const apparentMin = dweather.daily.apparent_temperature_min[i] || "";
    const sunrise = new Date(dweather.daily.sunrise[i]).toLocaleTimeString() || "";
    const sunset = new Date(dweather.daily.sunset[i]).toLocaleTimeString() || "";
    const rainSum = dweather.daily.rain_sum[i] || "";
    const windSpeed = dweather.daily.wind_speed_10m_max[i] || "";
    const windGusts = dweather.daily.wind_gusts_10m_max[i] || "";
    const windDirection = dweather.daily.wind_direction_10m_dominant[i] || "";
    const uvIndex = dweather.daily.uv_index_max[i] || "";
    const cloudiness = dweather.daily.shortwave_radiation_sum[i] || "";
    const evapotranspiration = dweather.daily.et0_fao_evapotranspiration[i] || "";
    const descr = dweather.daily.weather_code[i] || "";

    let transcript;

    if (lang === "hi") {
        transcript = ` नमस्ते किसान साथी!
        आपके स्थान पर ${date} का मौसम पूर्वानुमान इस प्रकार है:
         अधिकतम तापमान: ${maxTemp}°C | न्यूनतम तापमान: ${minTemp}°C.
         महसूस होने वाला तापमान: अधिकतम ${apparentMax}°C | न्यूनतम ${apparentMin}°C.
         सूर्योदय: ${sunrise} |  सूर्यास्त: ${sunset}.
         बारिश की कुल मात्रा: ${rainSum} मिमी.
         हवा की अधिकतम गति: ${windSpeed} किमी/घंटा | तेज़ झोंके: ${windGusts} किमी/घंटा.
         प्रमुख वायु दिशा: ${windDirection}°.
         बादल कवर: ${cloudiness}%.
         अधिकतम UV सूचकांक: ${uvIndex}.
         वाष्पीकरण: ${evapotranspiration} मिमी.
        🌦मौसम की स्थिति: ${descr}.
        कृपया अपनी कृषि योजनाओं को इस जानकारी के अनुसार व्यवस्थित करें। धन्यवाद! `;
    } else {
        transcript = ` Hello Farmer Friend!
        Here is the weather forecast for ${date}:
         Max Temp: ${maxTemp}°C | Min Temp: ${minTemp}°C.
         Feels Like: Max ${apparentMax}°C | Min ${apparentMin}°C.
         Sunrise: ${sunrise} |  Sunset: ${sunset}.
         Total Rainfall: ${rainSum} mm.
         Max Wind Speed: ${windSpeed} km/h | Gusts: ${windGusts} km/h.
         Dominant Wind Direction: ${windDirection}°.
         Cloud Cover: ${cloudiness}%.
         Max UV Index: ${uvIndex}.
         Evapotranspiration: ${evapotranspiration} mm.
         Weather Condition: ${descr}.
        Please plan your farming activities accordingly. Thank you! `;
    }

    // Stop any ongoing speech
    if (weatherUtterance) {
        synth.cancel();
    }

    // Create a new utterance with a natural speech rate and tone
    weatherUtterance = new SpeechSynthesisUtterance(transcript);
    weatherUtterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    weatherUtterance.rate = 0.9; // Slightly slower for better clarity
    weatherUtterance.pitch = 1;
    weatherUtterance.volume = 1;

    synth.speak(weatherUtterance);
}



function pauseWeatherSpeech2() {
    if (window.speechSynthesis.speaking && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        console.log("⏸️ Speech paused");
    }
}

// ✅ Function to Resume Speech
function resumeWeatherSpeech2() {
    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        console.log("▶️ Speech resumed");
    }
}

// ✅ Function to Stop Speech and Reset Variables
function stopWeatherSpeech2() {
    if (weatherUtterance) {
        window.speechSynthesis.cancel();
        weatherUtterance = null;
        isPaused = false;
        resetSpeechSettings2();
    }
}

// ✅ Function to Reset Speech Settings
function resetSpeechSettings2() {
    weatherUtterance = null;
    voiceChangeCount = 1;
    initialVoiceSet = false;
    isPaused = false;
    console.log("🔄 Speech settings reset!");
}

// ✅ Function to Set Initial Voice to Microsoft Swara (Hindi)
function setInitialVoice2() {
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
function toggleLanguage2() {
    lang = lang === "en" ? "hi" : "en";
    console.log(`🌎 Language changed to ${lang === "hi" ? "Hindi" : "English"}`);
    readWeatherReport2();
}

// ✅ Function to Change Voice
function changeVoice2() {
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
        setInitialVoice2();
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
    setInitialVoice2();
};

// ✅ Reset everything when the page refreshes
window.onload = function () {
    window.speechSynthesis.cancel();
    stopWeatherSpeech2();
    resetSpeechSettings2();
};




function readWeatherReport3() {
    const synth = window.speechSynthesis;
    if (!synth) {
        alert("❌ Text-to-speech is not supported in your browser.");
        return;
    }
    if (hData == "") {
        return;
    }

    const i = 11; // ✅ Get data for the 5th hour from now
    const hour = new Date(hData.hourly.time[i]).getHours(); // Extract hour in 24-hour format
    const rainChance = hData.hourly.precipitation_probability[i] || "N/A";
    const prec = hData.hourly.precipitation[i] || "N/A";
    const wspeed = hData.hourly.wind_speed_10m[i] || "N/A";
    const cloud = hData.hourly.cloud_cover[i] || "N/A";
    const soilmoisture = (hData.hourly.soil_moisture_0_to_1cm[i] * 100).toFixed(1) || "N/A";
    const soiltemp = hData.hourly.soil_temperature_18cm[i] || "N/A";
    const humidity1 = hData.hourly.relative_humidity_2m[i] || "N/A";
    const visibility1 = hData.hourly.visibility[i] || "N/A";
    const descr = desc || "N/A";

    let transcript;

    if (lang === "hi") {
        transcript = `🌤 नमस्ते किसान साथी!
        आपके स्थान  का अगले 12वें घंटे (${hour}:00 बजे) का मौसम अपडेट इस प्रकार है:
        ☁️ बादल: ${cloud}%.
        💧 वर्षा की संभावना: ${rainChance}%.
        🌧️ वर्षा की मात्रा: ${prec} मिमी.
        🌬️ हवा की गति: ${wspeed} किलोमीटर प्रति घंटा.
        💦 नमी: ${humidity1}%.
        🏜️ मिट्टी की नमी: ${soilmoisture}%.
        🌡️ मिट्टी का तापमान: ${soiltemp}°C.
        👁️ दृश्यता: ${visibility1} मीटर.
        🌦️ मौसम की स्थिति: ${descr}.
        कृपया अपनी कृषि गतिविधियों की योजना इस जानकारी के अनुसार बनाएं। धन्यवाद! 🌾`;
    } else {
        transcript = `🌤 Hello Farmer Friend!
        Here is the weather update for the 12th hour (${hour}:00) from now in Your City:
        ☁️ Cloud Cover: ${cloud}%.
        💧 Rain Probability: ${rainChance}%.
        🌧️ Expected Rainfall: ${prec} mm.
        🌬️ Wind Speed: ${wspeed} km/h.
        💦 Humidity: ${humidity1}%.
        🏜️ Soil Moisture: ${soilmoisture}%.
        🌡️ Soil Temperature: ${soiltemp}°C.
        👁️ Visibility: ${visibility1} meters.
        🌦️ Weather Condition: ${descr}.
        Please plan your farming activities accordingly. Thank you! 🌾`;
    }

    // Stop any ongoing speech
    if (weatherUtterance) {
        synth.cancel();
    }

    // Create a new utterance with a natural speech rate and tone
    weatherUtterance = new SpeechSynthesisUtterance(transcript);
    weatherUtterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    weatherUtterance.rate = 0.9;  // Slightly slower for better clarity
    weatherUtterance.pitch = 1;
    weatherUtterance.volume = 1;

    synth.speak(weatherUtterance);
}


function pauseWeatherSpeech3() {
    if (window.speechSynthesis.speaking && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        console.log("⏸️ Speech paused");
    }
}

// ✅ Function to Resume Speech
function resumeWeatherSpeech3() {
    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        console.log("▶️ Speech resumed");
    }
}

// ✅ Function to Stop Speech and Reset Variables
function stopWeatherSpeech3() {
    if (weatherUtterance) {
        window.speechSynthesis.cancel();
        weatherUtterance = null;
        isPaused = false;
        resetSpeechSettings3();
    }
}

// ✅ Function to Reset Speech Settings
function resetSpeechSettings3() {
    weatherUtterance = null;
    voiceChangeCount = 1;
    initialVoiceSet = false;
    isPaused = false;
    console.log("🔄 Speech settings reset!");
}

// ✅ Function to Set Initial Voice to Microsoft Swara (Hindi)
function setInitialVoice3() {
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
function toggleLanguage3() {
    lang = lang === "en" ? "hi" : "en";
    console.log(`🌎 Language changed to ${lang === "hi" ? "Hindi" : "English"}`);
    readWeatherReport3();
}

// ✅ Function to Change Voice
function changeVoice3() {
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
        setInitialVoice3();
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
    setInitialVoice3();
};

// ✅ Reset everything when the page refreshes
window.onload = function () {
    window.speechSynthesis.cancel();
    stopWeatherSpeech3();
    resetSpeechSettings3();
};
