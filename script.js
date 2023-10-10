const axios = require('axios');
const fs = require('fs');

const spreadsheetId = '1NPfi6o9JGCk6V_gmR4FE3mv7vMyrkUBdt1g_HtSUd8Y';
const sheetName = 'Reels';

const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq&sheet=${encodeURIComponent(sheetName)}`;

axios.get(url)
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

        fs.writeFile('output.json', JSON.stringify(jsonRows, null, 2), (err) => {
          if (err) throw err;
          console.log('Data has been saved as output.json');
        });
      } else {
        console.error('Error fetching data:', jsonData);
      }
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
