document.addEventListener("DOMContentLoaded", () => {
    loadCropData();

    // Form Submission Handling
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await submitCropData();
        });
    }
});

// ✅ Load Crop Data from Backend
async function loadCropData() {
    try {
        const response = await fetch("http://localhost:3000/cropMonitoring/get-data/community");
        const data = await response.json();

        // ✅ Get Section Containers
        const homeSection = document.getElementById("home-data");
        const diseasedCropSection = document.getElementById("diseased-crop-data");
        const solutionsSection = document.getElementById("solution-data");

        // ✅ Clear Previous Data
        homeSection.innerHTML = "";
        diseasedCropSection.innerHTML = "";
        solutionsSection.innerHTML = "";

        // ✅ Create Parent Rows for Grid Layout
        const homeRow = document.createElement("div");
        homeRow.classList.add("row", "g-4", "justify-content-center");

        const diseasedRow = document.createElement("div");
        diseasedRow.classList.add("row", "g-4", "justify-content-center");

        const solutionsRow = document.createElement("div");
        solutionsRow.classList.add("row", "g-4", "justify-content-center");

        data.forEach(item => {
            // ✅ Format Date
            const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            // ✅ Badge for Category
            let badgeColor = item.isDiseased === "Yes" ? "bg-danger" : "bg-success";
            let badgeText = item.isDiseased === "Yes" ? "⚠ Diseased" : "✔ Healthy";
            let categoryBadge = item.category === "Solution" ? `<span class="badge bg-primary w-100 p-2">💡 Solution</span>` : "";

            // ✅ Image Display (Check for images)
            let imagesHTML = item.images.length > 0
                ? item.images.map(img => `
                    <a href="http://localhost:3000/uploads/${img}" target="_blank">
                        <img src="${img}" class="img-fluid me-2 shadow-sm"
                            style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                    </a>
                  `).join("")
                : `<p class="text-muted">No images available</p>`;

            // ✅ Card HTML
            let cardHTML = `
                <div class="col-lg-4 col-md-6">
                    <div class="card p-3 shadow-sm border-0" style="border-radius: 10px;">
                        <span class="badge ${badgeColor} text-white w-100 mb-2">${badgeText}</span>
                        ${categoryBadge}
                        <div class="card-body">
                            <h5 class="fw-bold">${item.crop} - <span class="text-muted">${item.location}</span></h5>
                            <p class="mb-1"><strong>Disease:</strong> ${item.disease || "N/A"}</p>
                            <p class="mb-1"><strong>Reported By:</strong> ${item.person}</p>
                            <p class="mb-1"><strong>Category:</strong> ${item.category}</p>
                            <p class="mb-1"><strong>Suggestion:</strong> ${item.suggestion || "No additional notes."}</p>
                            <p class="text-muted mt-2"><small>📅 ${formattedDate}</small></p>
                            <div class="d-flex flex-wrap mt-2">
                                ${imagesHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // ✅ Append to the correct row
            homeRow.innerHTML += cardHTML;
            if (item.isDiseased === "Yes") {
                diseasedRow.innerHTML += cardHTML;
            } else if (item.category === "Solution") {
                solutionsRow.innerHTML += cardHTML;
            }
        });

        // ✅ Append rows to sections
        homeSection.appendChild(homeRow);
        diseasedCropSection.appendChild(diseasedRow);
        solutionsSection.appendChild(solutionsRow);

    } catch (error) {
        console.error("❌ Error loading crop data:", error);
    }
}

// ✅ Load Data on Page Load
window.onload = loadCropData;


async function submitCropData() {
    const form = document.getElementById("uploadForm");
    const formData = new FormData(form);

    try {
        const response = await fetch("http://localhost:3000/cropMonitoring/upload-data/community", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert("✅ Data uploaded successfully!");
            form.reset();
            loadCropData(); // Reload updated data
        } else {
            alert("❌ Error uploading data: " + result.message);
        }
    } catch (error) {
        console.error("❌ Error uploading crop data:", error);
        alert("❌ Server error while uploading data.");
    }
}

// ✅ Show Different Sections Based on User Click
function showSection(sectionId) {
    document.querySelectorAll(".community-section").forEach(section => {
        section.classList.add("d-none");
    });
    document.getElementById(sectionId).classList.remove("d-none");
}


//Filter logic

let cropData = []; // Global variable to store fetched data

// ✅ Fetch and Display Data
async function loadCropData() {
    try {
        const response = await fetch("http://localhost:3000/cropMonitoring/get-data/community");
        cropData = await response.json(); // ✅ Store Data Globally
        displayData(cropData);
    } catch (error) {
        console.error("❌ Error loading crop data:", error);
    }
}

// ✅ Function to Display Data
function displayData(filteredData) {
    // ✅ Get Section Containers
    const homeSection = document.getElementById("home-data");
    const diseasedCropSection = document.getElementById("diseased-crop-data");
    const solutionsSection = document.getElementById("solution-data");

    // ✅ Clear Previous Data
    homeSection.innerHTML = "";
    diseasedCropSection.innerHTML = "";
    solutionsSection.innerHTML = "";

    // ✅ Create Parent Rows for Grid Layout
    const homeRow = document.createElement("div");
    homeRow.classList.add("row", "g-4", "justify-content-center");

    const diseasedRow = document.createElement("div");
    diseasedRow.classList.add("row", "g-4", "justify-content-center");

    const solutionsRow = document.createElement("div");
    solutionsRow.classList.add("row", "g-4", "justify-content-center");

    // ✅ Loop through Data
    filteredData.forEach(item => {
        // ✅ Format Date
        const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        // ✅ Badge for Category
        let badgeColor = item.isDiseased === "Yes" ? "bg-danger" : "bg-success";
        let badgeText = item.isDiseased === "Yes" ? "⚠ Diseased" : "✔ Healthy";
        let categoryBadge = item.category === "Solution"
            ? `<span class="badge bg-primary w-100 p-2">💡 Solution</span>`
            : "";

        // ✅ Image Display (Check for images)
        let imagesHTML = item.images.length > 0
            ? item.images.map(img => `
                <a href="http://localhost:3000/uploads/${img}" target="_blank">
                    <img src="${img}" class="img-fluid me-2 shadow-sm"
                        style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                </a>
              `).join("")
            : `<p class="text-muted">No images available</p>`;

        // ✅ Create Card Element
        const cardCol = document.createElement("div");
        cardCol.classList.add("col-lg-4", "col-md-6");

        cardCol.innerHTML = `
            <div class="card p-3 shadow-sm border-0 somebox" style="border-radius: 10px;">
                <span class="badge ${badgeColor} text-white w-100 mb-2">${badgeText}</span>
                ${categoryBadge}
                <div class="card-body">
                    <h5 class="fw-bold">${item.crop} - <span class="text-muted">${item.location}</span></h5>
                    <p class="mb-1"><strong>Disease:</strong> ${item.disease || "N/A"}</p>
                    <p class="mb-1"><strong>Reported By:</strong> ${item.person}</p>
                    <p class="mb-1"><strong>Category:</strong> ${item.category}</p>
                    <p class="mb-1"><strong>Suggestion:</strong> ${item.suggestion || "No additional notes."}</p>
                    <p class="text-muted mt-2"><small>📅 ${formattedDate}</small></p>
                    <div class="d-flex flex-wrap mt-2">
                        ${imagesHTML}
                    </div>
                </div>
            </div>
        `;

        // ✅ Append to the correct row
        homeRow.appendChild(cardCol);
        if (item.isDiseased === "Yes" && item.category != "Solution") {
            diseasedRow.appendChild(cardCol.cloneNode(true)); // Clone node for correct placement
        }
        if (item.category === "Solution") {
            solutionsRow.appendChild(cardCol.cloneNode(true));
        }
    });

    // ✅ Append rows to sections
    homeSection.appendChild(homeRow);
    diseasedCropSection.appendChild(diseasedRow);
    solutionsSection.appendChild(solutionsRow);
}


async function showdata(data) {
        // ✅ Get Section Containers
        const homeSection = document.getElementById("home-data");
        const diseasedCropSection = document.getElementById("diseased-crop-data");
        const solutionsSection = document.getElementById("solution-data");

        // ✅ Clear Previous Data
        homeSection.innerHTML = "";
        diseasedCropSection.innerHTML = "";
        solutionsSection.innerHTML = "";

        // ✅ Create Parent Rows for Grid Layout
        const homeRow = document.createElement("div");
        homeRow.classList.add("row", "g-4", "justify-content-center");

        const diseasedRow = document.createElement("div");
        diseasedRow.classList.add("row", "g-4", "justify-content-center");

        const solutionsRow = document.createElement("div");
        solutionsRow.classList.add("row", "g-4", "justify-content-center");

        data.forEach(item => {
            // ✅ Format Date
            const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            // ✅ Badge for Category
            // ✅ Badge for Category
            let badgeColor = item.isDiseased === "Yes" ? "bg-danger text-white" : "bg-success text-white";
            let badgeText = item.isDiseased === "Yes" ? "⚠ Diseased" : "✔ Healthy";
            let categoryBadge = item.category === "Solution" ? `<span class="badge bg-primary text-white p-2">💡 Solution</span>` : "";

            // ✅ Image Display (Check for images)
            let imagesHTML = item.images.length > 0
                ? item.images.map(img => `
        <a href="http://localhost:3000/uploads/${img}" target="_blank">
            <img src="${img}" class="img-fluid me-2 shadow-sm border border-secondary"
                style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
        </a>
      `).join("")
                : `<p class="text-muted">No images available</p>`;

            // ✅ Card HTML
            let cardHTML = `
    <div class="col-lg-4 col-md-6 d-flex justify-content-center">
        <div class="card p-4 shadow-lg border border-success bg-light" style="border-radius: 12px; width: 100%; max-width: 400px;">
            <div class="text-center">
                <span class="badge ${badgeColor} w-50 mb-2" style="font-size: 14px;">${badgeText}</span>
                ${categoryBadge}
            </div>
            <div class="card-body text-center">
                <h5 class="fw-bold text-success">${item.crop} - <span class="text-muted">${item.location}</span></h5>
                <p class="mb-2"><strong class="text-dark">Disease:</strong> ${item.disease || "N/A"}</p>
                <p class="mb-2"><strong class="text-dark">Reported By:</strong> ${item.person}</p>
                <p class="mb-2"><strong class="text-dark">Category:</strong> ${item.category}</p>
                <p class="mb-2"><strong class="text-dark">Suggestion:</strong> ${item.suggestion || "No additional notes."}</p>
                <p class="text-muted mt-3"><small>📅 ${formattedDate}</small></p>
                <div class="d-flex justify-content-center flex-wrap mt-3">
                    ${imagesHTML}
                </div>
            </div>
        </div>
    </div>
`;


            // ✅ Append to the correct row
            homeRow.innerHTML += cardHTML;
            if (item.isDiseased === "Yes") {
                diseasedRow.innerHTML += cardHTML;
            } else if (item.category === "Solution") {
                solutionsRow.innerHTML += cardHTML;
            }
        });

        // ✅ Append rows to sections
        homeSection.appendChild(homeRow);
        diseasedCropSection.appendChild(diseasedRow);
        solutionsSection.appendChild(solutionsRow);

    }


// ✅ Filter Function
function filterData() {
    const cropFilter = document.getElementById("filter-crop").value.toLowerCase();
    const locationFilter = document.getElementById("filter-location").value.toLowerCase();
    const reportedByFilter = document.getElementById("filter-reported").value.toLowerCase();
    const categoryFilter = document.getElementById("filter-category").value;

    const filteredData = cropData.filter(item =>
        (!cropFilter || item.crop.toLowerCase().includes(cropFilter)) &&
        (!locationFilter || item.location.toLowerCase().includes(locationFilter)) &&
        (!reportedByFilter || item.person.toLowerCase().includes(reportedByFilter)) &&
        (!categoryFilter || item.category === categoryFilter)
    );

    displayData(filteredData);
}

// ✅ Reset Filters
function resetFilters() {
    document.getElementById("filter-crop").value = "";
    document.getElementById("filter-location").value = "";
    document.getElementById("filter-reported").value = "";
    document.getElementById("filter-category").value = "";
    displayData(cropData); // Show all data again
}

// ✅ Load Data on Page Load
window.onload = loadCropData;
