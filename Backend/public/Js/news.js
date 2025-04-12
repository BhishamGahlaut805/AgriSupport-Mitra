// async function fetchNews() {
//     try {
//         const response = await fetch('http://127.0.0.1:5000/news', {
//             method: 'POST',  // Using POST to fetch the data
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({})  // Sending an empty object (or any other data you need)
//         });

//         // Log the response object for inspection
//         console.log('Response:', response);

//         const data = await response.json();

//         if (response.ok) {
//             console.log('News Data:', data);

//             // Get the main container to append news items
//             const mainContainer = document.getElementById('main-container');
//             mainContainer.innerHTML = ''; // Clear any previous content

//             // Loop through each news item and create a square container
//             data.forEach(news => {
//                 // Create the square container for each news item
//                 const newsContainer = document.createElement('div');
//                 newsContainer.classList.add('col-12', 'col-md-6', 'col-lg-3', 'mb-4', 'd-flex', 'align-items-stretch');

//                 newsContainer.innerHTML = `
//                     <div class="card shadow-sm">
//                         <img src="${news.thumbnail}" class="card-img-top" alt="Thumbnail" style="object-fit: cover; height: 200px;">
//                         <div class="card-body">
//                             <h5 class="card-title">${news.title}</h5>
//                             <p class="card-text">${news.heading}</p>
//                             <p class="card-text text-muted"><strong>Date:</strong> ${news.datetime}</p>
//                             <a href="${news.link}" class="btn btn-primary" target="_blank">Read More</a>
//                         </div>
//                     </div>
//                 `;

//                 // Append the new container to the main container
//                 mainContainer.appendChild(newsContainer);
//             });
//         } else {
//             console.error('Error fetching data:', data);
//             alert("Failed to load news. Please try again later.");
//         }
//     } catch (err) {
//         console.error('Failed to fetch data:', err);
//         alert("Failed to load news. Please try again later.");
//     }
// }

// // Call the function to fetch the news
// fetchNews();

async function fetchNews() {
    try {
        const response = await fetch('http://127.0.0.1:5000/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (response.ok) {
            const mainContainer = document.getElementById('main-container');
            mainContainer.innerHTML = '';

            data.forEach(news => {
                const newsContainer = document.createElement('div');
                newsContainer.classList.add('col-12', 'col-md-6', 'col-lg-3', 'mb-4', 'd-flex', 'align-items-stretch');

                newsContainer.innerHTML = `
                    <div class="card shadow-sm">
                        <img src="${news.thumbnail}" class="card-img-top" alt="Thumbnail" style="object-fit: cover; height: 200px;">
                        <div class="card-body">
                            <h5 class="card-title">${news.title}</h5>
                            <p class="card-text">${news.heading}</p>
                            <p class="card-text text-muted"><strong>Date:</strong> ${news.datetime}</p>
                            <button class="btn btn-primary read-more" data-link="${news.link}">Read More</button>
                        </div>
                    </div>
                `;

                mainContainer.appendChild(newsContainer);
            });

            document.querySelectorAll('.read-more').forEach(button => {
                button.addEventListener('click', function () {
                    const link = this.getAttribute('data-link');
                    window.location.href = `/weather/newsdetail?link=${encodeURIComponent(link)}`;
                });
            });

        } else {
            console.error('Error fetching data:', data);
            // alert("Failed to load news. Please try again later.");
        }
    } catch (err) {
        console.error('Failed to fetch data:', err);
        // alert("Failed to load news. Please try again later.");
    }
}

// Call the function to fetch the news
fetchNews();


// async function fetchNewsDetail(link) {
//     try {
//         const response = await fetch('http://127.0.0.1:5000/newsdetail', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ link })
//         });

//         if (response.ok) {
//             const data = await response.json(); // Assuming the server returns JSON
//             const mainContainer = document.getElementById('news-content');
//             mainContainer.innerHTML = ''; // Clear the existing content

//             // Display headline
//             const headlineContainer = document.createElement('h2');
//             headlineContainer.textContent = data.headline; // Display headline
//             mainContainer.appendChild(headlineContainer);

//             // Handling paragraphs
//             const paragraphsContainer = document.createElement('div');
//             data.paragraphs.forEach(paragraph => {
//                 const p = document.createElement('p');
//                 p.innerHTML = paragraph; // Using innerHTML to preserve formatting like <strong>
//                 paragraphsContainer.appendChild(p);
//             });

//             // Handling the image
//             if (data.figure) {
//                 const figure = document.createElement('figure');
//                 const img = document.createElement('img');
//                 img.src = data.figure.src;
//                 img.alt = data.figure.alt;
//                 img.style.maxWidth = '100%';
//                 img.style.height = 'auto';
//                 figure.appendChild(img);
//                 paragraphsContainer.appendChild(figure);
//             }

//             mainContainer.appendChild(paragraphsContainer);

//         } else {
//             console.error('Error fetching data:', response.statusText);
//             alert("Failed to load news details. Please try again later.");
//         }
//     } catch (err) {
//         console.error('Failed to fetch data:', err);
//         alert("Failed to load news details. Please try again later.");
//     }
// }

// document.querySelectorAll(".data-link").forEach(item => {
//     item.addEventListener('click', function (event) {
//         event.preventDefault(); // Prevent default link behavior
//         const link = this.getAttribute('data-link');
//         fetchNewsDetail1(link); // Fetch and display the news detail
//     });
// });
