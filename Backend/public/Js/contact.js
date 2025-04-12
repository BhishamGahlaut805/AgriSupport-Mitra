
    document.getElementById("query-form").addEventListener("submit", function (event) {
        event.preventDefault();

    const name = document.getElementById("name").value;
    const residence = document.getElementById("residence").value;
    const queryText = document.getElementById("query").value;

    const queryData = {name, residence, queryText, resolved: false };
    let savedQueries = JSON.parse(localStorage.getItem("queries")) || [];
    savedQueries.push(queryData);
    localStorage.setItem("queries", JSON.stringify(savedQueries));

    displayQueries();
    document.getElementById("query-form").reset();
    });

    function displayQueries() {
        const activeQueries = document.getElementById("active-queries");
    const resolvedQueries = document.getElementById("resolved-queries");
    activeQueries.innerHTML = "";
    resolvedQueries.innerHTML = "";

    let savedQueries = JSON.parse(localStorage.getItem("queries")) || [];

        savedQueries.forEach((query, index) => {
            const queryItem = document.createElement("div");
    queryItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "shadow-sm", "rounded", "p-3", "mb-2");

    queryItem.innerHTML = `
    <div>
        <h6 class="fw-bold text-primary">👤 ${query.name} (${query.residence})</h6>
        <p class="mb-1">${query.queryText}</p>
    </div>
    ${!query.resolved ? `<button class="btn btn-outline-success btn-sm resolve-btn" data-index="${index}">✅ Resolve</button>` : "✅ Resolved"}
    `;

    if (query.resolved) {
        resolvedQueries.appendChild(queryItem);
            } else {
        activeQueries.appendChild(queryItem);
            }
        });

        document.querySelectorAll(".resolve-btn").forEach(button => {
        button.addEventListener("click", function () {
            let savedQueries = JSON.parse(localStorage.getItem("queries")) || [];
            let index = this.getAttribute("data-index");
            savedQueries[index].resolved = true;
            localStorage.setItem("queries", JSON.stringify(savedQueries));
            displayQueries();
        });
        });
    }

    window.addEventListener("load", displayQueries);
