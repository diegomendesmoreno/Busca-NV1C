let jsonData = [];

// Waiting for the page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');

    // Load the JSON
    loadSpreadSheet();
    
    // Add an event listener to the search button
    document.querySelector('.search-form').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevents the default form submission behavior
        const keyword = document.getElementById('keyword-input').value;
        const filteredData = filterByKeyword(jsonData, keyword);

        if(filteredData.length === 0)
        {
            // No results found
            showError(keyword);
        }
        else
        {
            showfilteredPosts(keyword, filteredData);
        }
    });
});


function reloadItems(lastSearch) {
    // Replace the search-bar placeholder with the last search
    var searchBar = document.getElementById('keyword-input');
    searchBar.value = "";
    searchBar.placeholder = lastSearch;
    
    // Remove the div with id "instagram-post-container" if it exists
    const oldInstagramPostContainer = document.getElementById('instagram-post-container');
    if (oldInstagramPostContainer) {
        oldInstagramPostContainer.remove();
    }

    // Create a new "instagram-post-container"
    const instagramPostContainer = document.createElement('div');
    instagramPostContainer.id = 'instagram-post-container';
    document.body.appendChild(instagramPostContainer);
    var footer = document.querySelector('footer');
    footer.insertAdjacentElement('beforebegin', instagramPostContainer);
}


function showError(lastSearch) {
    reloadItems(lastSearch);

    // Show error message
    var instagramPostContainer = document.getElementById('instagram-post-container');
    instagramPostContainer.innerHTML = '<p>Nenhum resultado encontrado</p>';
}


function showfilteredPosts(lastSearch, filteredData) {
    reloadItems(lastSearch);

    // Create the filtered posts inside the container
    for(let i = 0; i < filteredData.length; i++) {
        createInstagramPost(filteredData[i]['Título/tema'], filteredData[i]['Link']);
        console.log(`Título/tema [${i}]: ${filteredData[i]['Título/tema']}`);
        console.log(`Link        [${i}]: ${filteredData[i]['Link']}`);
        console.log(`Content     [${i}]: ${filteredData[i]['Content']}`);
        console.log('');
    }
}


function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


function filterByKeyword(jsonData, keyword) {
    const normalizedKeyword = removeAccents(keyword.toLowerCase());
    return jsonData.filter(item => {
        const title = removeAccents(item['Título/tema'].toLowerCase());
        return title.includes(normalizedKeyword);
    });
}


function loadSpreadSheet() {
    const spreadsheetId = '1NPfi6o9JGCk6V_gmR4FE3mv7vMyrkUBdt1g_HtSUd8Y';
    const sheets = ['Reels', 'Infográficos'];

    sheets.forEach(sheet => {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq&sheet=${encodeURIComponent(sheet)}`;
        
        getInstagramData(url, sheet)
            .then(jsonRows => {
                const numRows = jsonRows.length;
                console.log(`Loaded ${sheet} (${numRows} items)`);
    
                jsonData.push(...jsonRows);
            });
    });
}


function getInstagramData(url, contentType) {
    return axios.get(url)
        .then((response) => {
            const data = response.data;
            try {
                const startIdx = data.indexOf('{');
                const endIdx = data.lastIndexOf('}');
                const jsonData = JSON.parse(data.substring(startIdx, endIdx + 1));

                if (jsonData && jsonData.table) {
                    const rows = jsonData.table.rows;

                    const jsonRows = rows.slice(1).map(row => {
                        return {
                            'Título/tema': row.c[0].v,
                            'Link': row.c[1].v,
                            'Content': contentType
                        };
                    });

                    return jsonRows;

                } else {
                    console.error('Error fetching data:', jsonData);
                    return null;
                }
            } catch (error) {
                console.error('Error parsing data:', error);
                return null;
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            return null;
        });
}


function createInstagramPost(postTitle, url) {
    var instagramPostContainer = document.getElementById('instagram-post-container');
    
    var instagramContainer = document.createElement('div');
    instagramContainer.classList.add('instagram-post');

    // Create the title
    var postTitleH3 = document.createElement('h3');
    postTitleH3.classList.add('post-title');
    postTitleH3.innerHTML = postTitle;

    // Create the Instagram embed
    var blockquote = document.createElement('blockquote');
    blockquote.classList.add('instagram-media');
    blockquote.setAttribute('data-instgrm-permalink', url);

    // Load the Instagram embed script
    var script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('src', '//www.instagram.com/embed.js');
    script.onload = function() {
        // After the script has loaded, re-run the initialization
        window.instgrm.Embeds.process();
    };
    
    instagramPostContainer.appendChild(instagramContainer);
    instagramContainer.appendChild(postTitleH3);
    instagramContainer.appendChild(blockquote);
    instagramContainer.appendChild(script);

    // var footer = document.querySelector('footer');
    instagramPostContainer.insertAdjacentElement('beforeend', instagramContainer);
}
