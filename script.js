function loadSpreadSheet() {
    const spreadsheetId = '1NPfi6o9JGCk6V_gmR4FE3mv7vMyrkUBdt1g_HtSUd8Y';
    const sheetName = 'Reels';
    
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq&sheet=${encodeURIComponent(sheetName)}`;

    getInstagramData(url)
        .then(jsonRows => {
            const numRows = jsonRows.length;
            console.log(`Number of rows: ${numRows}`);

            for(let i = 6; i <= 16; i++) {
                createInstagramPost(jsonRows[i]['Link']);
                console.log(`Name [${i}]: ${jsonRows[i]['Título/tema do vídeo']}`);
                console.log(`Link [${i}]: ${jsonRows[i]['Link']}`);
                console.log('');
            }
        });
}

function getInstagramData(url) {
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
                            'Título/tema do vídeo': row.c[0].v,
                            'Link': row.c[1].v
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

function createInstagramPost(url) {
    var instagramContainer = document.createElement('div');
    instagramContainer.classList.add('instagram-post');

    var blockquote = document.createElement('blockquote');
    blockquote.classList.add('instagram-media');
    blockquote.setAttribute('data-instgrm-permalink', url);
    
    var script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('src', '//www.instagram.com/embed.js');
    
    instagramContainer.appendChild(blockquote);
    instagramContainer.appendChild(script);

    var footer = document.querySelector('footer');
    footer.insertAdjacentElement('beforebegin', instagramContainer);
}

loadSpreadSheet();
