// document.addEventListener("DOMContentLoaded", function () {
//     const cropButtons = document.querySelectorAll(".crop-selector");
//     const selectedCropInput = document.getElementById("selected-crop");
//     const uploadBtn = document.getElementById("upload-btn");
//     const fileInput = document.getElementById("file-input");
//     const dropArea = document.getElementById("drop-area");
//     const searchHistoryList = document.getElementById("search-history");
//     const bgImg = document.createElement("img");

//     bgImg.style.width = "40%";
//     bgImg.style.height = "40%";
//     bgImg.style.objectFit = "cover";
//     bgImg.style.borderRadius = "10px";
//     bgImg.style.display = "none"; // Initially hidden
//     bgImg.style.margin = "auto";
//     dropArea.appendChild(bgImg);

//     let selectedCrop = "";
//     let selectedFile = null;

//     // ✅ Handle Crop Selection
//     cropButtons.forEach(button => {
//         button.addEventListener("click", function () {
//             cropButtons.forEach(btn => btn.style.border = "2px solid transparent");
//             selectedCrop = this.getAttribute("data-crop");
//             selectedCropInput.value = selectedCrop;
//             this.style.border = "2px solid green";
//         });
//     });

//     // ✅ Drag & Drop Effects
//     dropArea.addEventListener("dragover", (e) => {
//         e.preventDefault();
//         dropArea.style.background = "rgba(40, 167, 69, 0.3)";
//     });

//     dropArea.addEventListener("dragleave", () => {
//         dropArea.style.background = "rgba(40, 167, 69, 0.1)";
//     });

//     // ✅ Handle File Drop
//     dropArea.addEventListener("drop", (e) => {
//         e.preventDefault();
//         dropArea.style.background = "rgba(40, 167, 69, 0.1)";
//         const files = e.dataTransfer.files;
//         if (files.length > 0) {
//             handleFile(files[0]);
//         }
//     });

//     // ✅ Handle File Selection
//     fileInput.addEventListener("change", (e) => {
//         if (e.target.files.length > 0) {
//             handleFile(e.target.files[0]);
//         }
//     });

//     // ✅ Process File Upload & Preview
//     function handleFile(file) {
//         if (file.type.startsWith("image/")) {
//             selectedFile = file;
//             const reader = new FileReader();
//             reader.onload = function (event) {
//                 bgImg.src = event.target.result;
//                 bgImg.style.display = "block"; // Make image visible
//                 dropArea.style.background = "none";
//             };
//             reader.readAsDataURL(file);
//         } else {
//             alert("❌ Please upload a valid image file!");
//         }
//     }

//     // ✅ Upload Data to Backend
//     uploadBtn.addEventListener("click", function () {
//         if (!selectedCrop || !selectedFile) {
//             alert("⚠️ Please select a crop and upload an image before searching!");
//             return;
//         }

//         const formData = new FormData();
//         formData.append("file", selectedFile);
//         formData.append("crop", selectedCrop);
//         console.log("Send Crop Name to Server : ", selectedCrop);

//         // Clear previous results
//         document.getElementById("results-container").innerHTML = "";

//         fetch("http://localhost:5000/api/upload", {
//             method: "POST",
//             body: formData,
//         })
//             .then(response => response.json())
//             .then(data => {
//                 console.log("✅ Server Response:", data);
//                 displayResult(selectedCrop, data.prediction, data.confidence, bgImg.src, data.suggestions);
//             })
//             .catch(error => {
//                 console.error("❌ Error:", error.message);
//             });
//     });

//     // ✅ Display Multiple Results in a Grid Layout
//     function displayResult(crop, disease, confidence, imageUrl, suggestions) {
//         suggestions = Array.isArray(suggestions) ? suggestions : [];

//         const resultCard = document.createElement("div");
//         resultCard.classList.add("result-card", "p-3", "shadow-sm", "bg-white", "rounded", "m-2");
//         resultCard.style.flex = "1 1 calc(33.33% - 20px)";
//         resultCard.style.maxWidth = "calc(33.33% - 20px)";

//         let badgeColor = disease.toLowerCase().includes("healthy") ? "bg-success" : "bg-danger";
//         let badgeText = disease.toLowerCase().includes("healthy") ? "✔ Healthy" : "⚠ Diseased";

//         resultCard.innerHTML = `
//             <img src="${imageUrl}" class="img-fluid rounded shadow-sm mb-3"
//                 style="max-height: 150px; object-fit: cover; border-radius: 10px;">
//             <h5 class="fw-bold text-dark">${crop}</h5>
//             <p class="fs-6 text-muted">${disease}</p>
//             <p class="fs-6 text-muted">Confidence: ${confidence}</p>
//             <span class="badge ${badgeColor} text-white p-2">${badgeText}</span>
//             <button id="generate-report-btn" class="btn btn-primary mt-2"
//                 onclick="sendReportAndRedirect('${crop}', '${disease}', '${confidence}', '${imageUrl}')">
//                 Get Detailed Report
//             </button><br>
//             <div id="progress-container" class="progress mt-3 d-none">
//                 <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-success"
//                     role="progressbar" style="width: 0%">Processing...</div>
//             </div>`;

//         document.getElementById("results-container").appendChild(resultCard);

//         // ✅ Fetch username from session before saving
//         fetch("http://localhost:3000/cropMonitoring/api/get-username") // Endpoint to get username from session
//             .then(response => response.json())
//             .then(data => {
//                 if (data.username) {
//                     saveSearchToDatabase(data.username, crop, disease, confidence, imageUrl);
//                     loadSearchHistory(data.username); // Reload search history
//                     loadSearchHistory(data.username); // Reload search history
//                 } else {
//                     saveSearchToDatabase("A", crop, disease, confidence, imageUrl);
//                     console.warn("⚠ No user logged in. Search not saved.");
//                 }
//             })
//             .catch(error => console.error("❌ Error fetching username:", error));
//     }

//     // ✅ Function to Save Search History to MongoDB
//     function saveSearchToDatabase(username, crop, disease, confidence, imageUrl) {
//         fetch("http://localhost:3000/cropMonitoring/api/save-search", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 username,
//                 crop,
//                 disease,
//                 confidence: confidence ? parseFloat(confidence) : 0,
//                 imageUrl
//             })
//         })
//             .then(response => response.json())
//             .then(() => loadSearchHistory(username))
//             .catch(error => console.error("❌ Error saving search:", error));
//     }

//     // ✅ Load Search History from MongoDB
//     function loadSearchHistory(username) {
//         fetch(`http://localhost:3000/cropMonitoring/api/get-searches/${username}`)
//             .then(response => {
//                 console.log("🔍 Fetch Response Status:", response.status);
//                 console.log("🔍 Fetch Response Type:", response.headers.get("content-type"));

//                 // ✅ Check if response is JSON
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }
//                 if (!response.headers.get("content-type")?.includes("application/json")) {
//                     throw new Error("❌ Expected JSON but received non-JSON response.");
//                 }

//                 return response.json();
//             })
//             .then(data => {
//                 console.log("✅ Search History Data:", data);

//                 searchHistoryList.innerHTML = ""; // Clear old list

//                 if (!data.data || !Array.isArray(data.data)) {
//                     console.error("❌ Invalid search history data format");
//                     return;
//                 }

//                 data.data.forEach(entry => {
//                     const historyItem = document.createElement("li");
//                     historyItem.classList.add("p-2", "border", "rounded", "mb-2", "bg-white", "shadow-sm");
//                     historyItem.innerHTML = `
//                         <strong>${entry.crop}</strong> - ${entry.disease} (${entry.confidence}%)
//                         <br><small class="text-muted">${new Date(entry.timestamp).toLocaleString()}</small>
//                         <br><img src="${entry.imageUrl}" class="img-fluid rounded mt-1" style="max-height: 50px;">
//                     `;
//                     searchHistoryList.appendChild(historyItem);
//                 });
//             })
//             .catch(error => console.error("❌ Error fetching search history:", error));
//     }

//     // ✅ Load search history when the page loads
//     fetch("http://localhost:3000/cropMonitoring/api/get-username") // Get username from session
//         .then(response => response.json())
//         .then(data => {
//             if (data.username) {
//                 loadSearchHistory(data.username);
//             }
//         })
//         .catch(error => console.error("❌ Error fetching username:", error));
// });

// function showSection(sectionId) {
//     // Hide all sections
//     document.querySelectorAll('.community-section').forEach(section => {
//         section.classList.add('d-none');
//     });

//     // Show selected section
//     document.getElementById(sectionId).classList.remove('d-none');
// }

// // ✅ Send report and display response in the same page
// function sendReportAndRedirect(crop, disease, confidence, imageUrl) {
//     let progressContainer = document.getElementById("progress-container");
//     let progressBar = document.getElementById("progress-bar");

//     // ✅ Show progress bar
//     progressContainer.classList.remove("d-none");
//     progressBar.style.width = "0%";
//     progressBar.innerText = "Processing... 0%";

//     let progress = 0;
//     let interval = setInterval(() => {
//         // ✅ Increase progress in a controlled manner (avoiding instant 100%)
//         if (progress < 95) { // Prevents reaching 100% too soon
//             progress += Math.floor(Math.random() * 8) + 3; // Increase by 3-10%
//         } else {
//             progress = 95; // Hold at 95% until API response
//         }

//         progressBar.style.width = progress + "%";
//         progressBar.innerText = `Processing... ${progress}%`;
//     }, 500);

//     const reportData = {
//         crop: crop,
//         disease: disease,
//         confidence: confidence.replace("%", ""), // Remove `%`
//         imageUrl: imageUrl
//     };

//     fetch("http://localhost:3000/cropMonitoring/api/report", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(reportData)
//     })
//         .then(async response => {
//             if (!response.ok) {
//                 const err = await response.json();
//                 throw new Error(err.error || "Unknown Error");
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("✅ Report Sent Successfully:", data);
//             clearInterval(interval);

//             // ✅ Complete the progress bar smoothly
//             progressBar.style.width = "100%";
//             progressBar.innerText = "✔ Report Ready!";

//             setTimeout(() => {
//                 progressContainer.classList.add("d-none"); // Hide after short delay
//             }, 1000);

//             // ✅ Log full response for debugging
//             console.log("🔍 Full API Response:", data);
//             localStorage.setItem("cropReport", JSON.stringify(data));
//             window.open("http://localhost:3000/cropMonitoring/Detailed/Report", "_blank");
//         })
//         .catch(error => {
//             console.error("❌ Error sending report:", error.message);
//             alert(`Failed to submit report: ${error.message}`);
//             clearInterval(interval);

//             // ❌ Show error message in the progress bar
//             progressBar.classList.remove("bg-success");
//             progressBar.classList.add("bg-danger");
//             progressBar.innerText = "❌ Error Generating Report!";

//             setTimeout(() => {
//                 progressContainer.classList.add("d-none"); // Hide after error
//             }, 2000);
//         });
// }

// function toggleLanguage() {
//     let currentLang = document.documentElement.lang || "en"; // Get current language
//     let newLang = currentLang === "en" ? "hi" : "en"; // Toggle between English & Hindi

//     // Set language
//     document.cookie = `googtrans=/auto/${newLang}`;
//     document.documentElement.lang = newLang;

//     // Reload to apply translation
//     location.reload();
// }







document.addEventListener("DOMContentLoaded", function () {
    const cropButtons = document.querySelectorAll(".crop-selector");
    const selectedCropInput = document.getElementById("selected-crop");
    const uploadBtn = document.getElementById("upload-btn");
    const fileInput = document.getElementById("file-input");
    const dropArea = document.getElementById("drop-area");
    const searchHistoryList = document.getElementById("search-history");
    // const searchHistoryList1 = document.getElementById("search-history1");
    // const searchHistoryList2 = document.getElementById("search-history2");
    const bgImg = document.createElement("img");

    bgImg.style.width = "40%";
    bgImg.style.height = "40%";
    bgImg.style.objectFit = "cover";
    bgImg.style.borderRadius = "10px";
    bgImg.style.display = "none"; // Initially hidden
    bgImg.style.margin = "auto";
    dropArea.appendChild(bgImg);

    let selectedCrop = "";
    let selectedFile = null;

    // ✅ Handle Crop Selection
    cropButtons.forEach(button => {
        button.addEventListener("click", function () {
            cropButtons.forEach(btn => btn.style.border = "2px solid transparent");
            selectedCrop = this.getAttribute("data-crop");
            selectedCropInput.value = selectedCrop;
            this.style.border = "2px solid green";
        });
    });

    // ✅ Drag & Drop Effects
    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.background = "rgba(40, 167, 69, 0.3)";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.background = "rgba(40, 167, 69, 0.1)";
    });
    // let fileProcessed = false;
    // ✅ Handle File Drop
    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.style.background = "rgba(3, 45, 13, 0.1)";
        // if (fileProcessed) return;
        const files = e.dataTransfer.files;
        // console.log("files length 1 => ", files.length);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // ✅ Handle File Selection
    fileInput.addEventListener("change", (e) => {
        e.preventDefault();
        // console.log("files length 2 => ", e.target.files.length);
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        // fileProcessed = false;
    });

    // ✅ Process File Upload & Preview
    function handleFile(file) {
        // if (fileProcessed) return; // Prevent duplicate handling
        // fileProcessed = true;

        if (file.type.startsWith("image/")) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = function (event) {
                bgImg.src = event.target.result;
                bgImg.style.display = "block"; // Make image visible
                // dropArea.style.background = "none";
            };
            reader.readAsDataURL(file);
        } else {
            alert("❌ Please upload a valid image file!");
        }
    }

    // ✅ Upload Data to Backend
    uploadBtn.addEventListener("click", function () {
        if (!selectedCrop || !selectedFile) {
            alert("⚠️ Please select a crop and upload an image before searching!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("crop", selectedCrop);
        console.log("Send Crop Name to Server : ", selectedCrop);

        fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log("✅ Server Response:", data);
                if (selectedCrop === "Others" || selectedCrop === "others") {
                    const selectedCrop1 = data.prediction;
                    displayResult(selectedCrop1, data.prediction, data.confidence, bgImg.src, data.suggestions);
                }
                else {
                    displayResult(selectedCrop, data.prediction, data.confidence, bgImg.src, data.suggestions);
                }
            })
            .catch(error => {
                console.error("❌ Error:", error.message);
            });
    });

    // ✅ Display Multiple Results in a Grid Layout
    function displayResult(crop, disease, confidence, imageUrl, suggestions) {
        suggestions = Array.isArray(suggestions) ? suggestions : [];

        const resultCard = document.createElement("div");
        resultCard.classList.add("result-card", "p-3", "shadow-sm", "bg-white", "rounded", "m-2");
        resultCard.style.flex = "1 1 calc(33.33% - 20px)";
        resultCard.style.maxWidth = "calc(33.33% - 20px)";

        let badgeColor = disease.toLowerCase().includes("healthy") ? "bg-success" : "bg-danger";
        let badgeText = disease.toLowerCase().includes("healthy") ? "✔ Healthy" : "⚠ Diseased";

        resultCard.innerHTML = `
            <img src="${imageUrl}" class="img-fluid rounded shadow-sm mb-3"
                style="max-height: 150px; object-fit: cover; border-radius: 10px;">
            <h5 class="fw-bold text-dark">${crop}</h5>
            <p class="fs-6 text-muted">${disease}</p>
            <p class="fs-6 text-muted">Confidence: ${confidence}</p>
           <div> <span class="badge ${badgeColor} text-white p-2 btn">${badgeText}</span></div>
             <button id="generate-report-btn" class="btn text-white mt-2 bg-success"
                onclick="sendPhoto('${crop}', '${disease}')">
                Get Photos
            </button>
            <button id="generate-report-btn" class="btn btn-primary mt-2"
                onclick="sendReportAndRedirect('${crop}', '${disease}', '${confidence}', '${imageUrl}')">
                Get Detailed Report
            </button></br>

            <div id="progress-container" class="progress mt-3 d-none">
                <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    role="progressbar" style="width: 0%">Processing...</div>
                    </div>

            </div>`;

        document.getElementById("results-container").appendChild(resultCard);

        // ✅ Fetch username from session before saving
        fetch("http://localhost:3000/cropMonitoring/api/get-username") // Endpoint to get username from session
            .then(response => response.json())
            .then(data => {
                if (data.username) {
                    saveSearchToDatabase(data.username, crop, disease, confidence, imageUrl);
                } else {
                    saveSearchToDatabase("A", crop, disease, confidence, imageUrl);
                    console.warn("⚠ No user logged in. Search not saved.");
                }
            })
            .catch(error => console.error("❌ Error fetching username:", error));
    }

    // ✅ Function to Save Search History to MongoDB
    function saveSearchToDatabase(username, crop, disease, confidence, imageUrl) {
        fetch("http://localhost:3000/cropMonitoring/api/save-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                crop,
                disease,
                confidence: confidence ? parseFloat(confidence) : 0,
                imageUrl
            })
        })
            .then(response => response.json())
            .then(() => loadSearchHistory(username))
            .catch(error => console.error("❌ Error saving search:", error));
    }

    // ✅ Load Search History from MongoDB
    function loadSearchHistory(username) {
        fetch(`http://localhost:3000/cropMonitoring/api/get-searches/${username}`)
            .then(response => {
                console.log("🔍 Fetch Response Status:", response.status);
                console.log("🔍 Fetch Response Type:", response.headers.get("content-type"));

                // ✅ Check if response is JSON
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                if (!response.headers.get("content-type")?.includes("application/json")) {
                    throw new Error("❌ Expected JSON but received non-JSON response.");
                }

                return response.json();
            })
            .then(data => {
                console.log("✅ Search History Data:", data);

                searchHistoryList.innerHTML = ""; // Clear old list
                // searchHistoryList1.innerHTML = "";
                // searchHistoryList2.innerHTML = "";

                if (!data.data || !Array.isArray(data.data)) {
                    console.error("❌ Invalid search history data format");
                    return;
                }

                data.data.forEach(entry => {
                    const historyItem = document.createElement("li");
                    historyItem.classList.add("p-2", "border", "rounded", "mb-2", "bg-white", "shadow-sm");
                    historyItem.innerHTML = `
                        <strong>${entry.crop}</strong> - ${entry.disease} (${entry.confidence}%)
                        <br><small class="text-muted">${new Date(entry.timestamp).toLocaleString()}</small>
                        <br><img src="${entry.imageUrl}" class="img-fluid rounded mt-1" style="max-height: 50px;">
                    `;
                    searchHistoryList.appendChild(historyItem);
                    // searchHistoryList1.appendChild(historyItem);
                    // searchHistoryList2.appendChild(historyItem);
                });
            })
            .catch(error => console.error("❌ Error fetching search history:", error));
    }

    // ✅ Load search history when the page loads
    fetch("http://localhost:3000/cropMonitoring/api/get-username") // Get username from session
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                loadSearchHistory(data.username);
            }
        })
        .catch(error => console.error("❌ Error fetching username:", error));
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.community-section').forEach(section => {
        section.classList.add('d-none');
    });

    // Show selected section
    document.getElementById(sectionId).classList.remove('d-none');
}

// ✅ Send report and display response in the same page
function sendReportAndRedirect(crop, disease, confidence, imageUrl) {
    let progressContainer = document.getElementById("progress-container");
    let progressBar = document.getElementById("progress-bar");

    // ✅ Show progress bar
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "Processing... 0%";

    let progress = 0;
    let interval = setInterval(() => {
        // ✅ Increase progress in a controlled manner (avoiding instant 100%)
        if (progress < 95) { // Prevents reaching 100% too soon
            progress += Math.floor(Math.random() * 8) + 3; // Increase by 3-10%
        } else {
            progress = 95; // Hold at 95% until API response
        }

        progressBar.style.width = progress + "%";
        progressBar.innerText = `Processing... ${progress}%`;
    }, 500);

    const reportData = {
        crop: crop,
        disease: disease,
        confidence: confidence.replace("%", ""), // Remove `%`
        imageUrl: imageUrl
    };

    fetch("http://localhost:3000/cropMonitoring/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
    })
        .then(async response => {
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Unknown Error");
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Report Sent Successfully:", data);
            clearInterval(interval);

            // ✅ Complete the progress bar smoothly
            progressBar.style.width = "100%";
            progressBar.innerText = "✔ Report Ready!";

            setTimeout(() => {
                progressContainer.classList.add("d-none"); // Hide after short delay
            }, 1000);

            // ✅ Log full response for debugging
            console.log("🔍 Full API Response:", data);
            localStorage.setItem("cropReport", JSON.stringify(data));
            window.open("http://localhost:3000/cropMonitoring/Detailed/Report", "_blank");
        })
        .catch(error => {
            console.error("❌ Error sending report:", error.message);
            alert(`Failed to submit report: ${error.message}`);
            clearInterval(interval);

            // ❌ Show error message in the progress bar
            progressBar.classList.remove("bg-success");
            progressBar.classList.add("bg-danger");
            progressBar.innerText = "❌ Error Generating Report!";

            setTimeout(() => {
                progressContainer.classList.add("d-none"); // Hide after error
            }, 2000);
        });
    }

function toggleLanguage() {
    let currentLang = document.documentElement.lang || "en"; // Get current language
    let newLang = currentLang === "en" ? "hi" : "en"; // Toggle between English & Hindi

    // Set language
    document.cookie = `googtrans=/auto/${newLang}`;
    document.documentElement.lang = newLang;

    // Reload to apply translation
    location.reload();
}

async function sendPhoto(crop, disease) {
    try {
        const response = await fetch('http://localhost:3000/cropMonitoring/webScrap/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ crop, disease })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.images && data.images.length > 0) {
            // Redirect only after successful data fetch
            window.open("http://localhost:3000/cropMonitoring/cropimages", "_blank");
        } else {
            console.error('No images found');
        }
    } catch (error) {
        console.error('Error fetching images:', error.message);
    }
}
