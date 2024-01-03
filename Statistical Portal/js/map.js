
/* import { getElectionJSONQuery, getParliamentJSONQuery} from './jsonQueries.js'; */

var map;

const electionYears = ["2021", "2017", "2012", "2008", "2004", "2000", 
        "1996", "1992", "1988", "1984", "1980", "1976"];

const parliamentYears = ["2019", "2014", "2009", "2004", "1999", "1996"];

var osmMap = L.tileLayer.provider('OpenStreetMap.Mapnik', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var stamenWatercolor = L.tileLayer.provider('Stadia.StamenWatercolor', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var worldImageryMap = L.tileLayer.provider('Esri.WorldImagery', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let activeLayer;

let geoLocation;
let marker;
let circle;

let electionBtnClick;
let parliamentBtnClick;


document.addEventListener('DOMContentLoaded', function() {
    electionBtnClick = true;
    fetchJSONData("2021");

    const btnContainer = document.querySelector('.btn-container'); // Use getElementsByClassName

    electionYears.forEach(year => {
        const btn = document.createElement('button');
        btn.classList.add('year-btn');
        btn.textContent = year;

        btn.addEventListener('click', () => {
            //Turn geo location off
            if (geoLocation) {
                navigator.geolocation.clearWatch(geoLocation);
            }
            fetchJSONData(year);
        });

        btnContainer.appendChild(btn);
    });
})

function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    // Remove previous location if location changes
    if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
    }

    marker = L.marker([latitude, longitude]).addTo(map);
    circle = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);

}

function error(error) {
    if (error.code === 1) {
        alert("Please allow geolocation access");
    } else {
        alert("Cannot access current geolocation");
    }
}

function sortElectionValueKeysWithAreas(geoData, electionData) {
    let geoDataArray = [];
    let electionArray = [];

    for (let i = 0; i < geoData.features.length; i++) {
        geoDataArray.push(geoData.features[i].properties.kunta)
    }

    let area = electionData.dimension.Alue.category.label;

    let i = 0;
    Object.values(area).forEach(item => {
        for (let j = 0; j < geoDataArray.length; j++) {
            if (item.split(" ")[0] == geoDataArray[j]) {
                let areaCode = "KU" + item.split(" ")[0];
                let keyValue = Object.keys(area)[i];
                let name = item.split(" ")[1];
                let year = Object.values(electionData.dimension.Vuosi.category.label);
                let areaIndex = Object.values(electionData.dimension.Alue.category.index)[i];

                let newData = {
                    key: keyValue,
                    areaCode: areaCode,
                    year: year,
                    name: name,
                    party: [],
                    data: []
                }

                for (let k = 0; k < 8; k++) {
                    newData.data.push(electionData.value[(areaIndex*8)+k])
                    newData.party.push(Object.values(electionData.dimension.Puolue.category.label)[k])
                }
                electionArray.push(newData)
            }
        }
        i++;
    })  
    return electionArray;
}

function initMap(geoData, electionData, parliamentData) {

    let layer = activeLayer ? [activeLayer] : [osmMap];

    // reinitialize map if it already exists
    if (map) {
        map = map.off();
        map = map.remove();
    }

    let electionArray = sortElectionValueKeysWithAreas(geoData, electionData);
    let parliamentArray = sortElectionValueKeysWithAreas(geoData, parliamentData);

    map = L.map('map', {
        minZoom: -3,
        layers: layer
    });

    /* let parliamentJSON; */

    let parliamentJSON = L.geoJSON(geoData, {
        onEachFeature: function (feature, layer) {
            getFeature(feature, layer, parliamentArray)
        },
        style: { fillColor: 'red', fillOpacity: 0.1 },
        weight: 1
    }).addTo(map);

    /* let electionJSON; */

    let electionJSON = L.geoJSON(geoData, {
        onEachFeature: function (feature, layer) {
            getFeature(feature, layer, electionArray)
        },
        style: { fillColor: 'transparent', fillOpacity: 0.1 },
        weight: 1
    }).addTo(map);


    var baseLayers = {
        'Open Street Map': osmMap,
        'Water Color': stamenWatercolor,
        'World Imagery': worldImageryMap
    };


    let electionLayer = electionBtnClick ? electionJSON : L.layerGroup([])
    let parliamentLayer = parliamentBtnClick ? parliamentJSON : L.layerGroup([]);

    // Add geolocation to base overlays
    var baseOverlays = {
        'ElectionData': electionLayer,
        'ParliamentData': parliamentLayer,
        'GeoLocation': L.layerGroup([])
    };


    map.on('baselayerchange', function (eventLayer) {
        activeLayer = eventLayer.layer;
    });

    map.on('overlayadd', function (eventLayer) {

        if (eventLayer.name === 'ElectionData') { 

            // Switch ParliamentData layer off
            setTimeout(function(){map.removeLayer(parliamentJSON)}, 10);
            // Uncheck the ParliamentData checkbox value
            setTimeout(function(){map.removeLayer(parliamentLayer)}, 10);

            // Add ElectiontData layer
            setTimeout(function(){map.addLayer(electionJSON)}, 10);

            const btnContainer = document.querySelector('.btn-container');

            if (btnContainer.children.length < 7) {
                const buttons = document.querySelectorAll('.parliament-year-btn');
                buttons.forEach(button => {
                    button.remove();
                });
                electionYears.forEach(year => {
                    const btn = document.createElement('button');
                    btn.classList.add('year-btn');
                    btn.textContent = year;
    
                    btn.addEventListener('click', () => {
                        //Turn geo location off
                        if (geoLocation) {
                            navigator.geolocation.clearWatch(geoLocation);
                        }
                        electionBtnClick = true;
                        parliamentBtnClick = false;
                        fetchJSONData(year);
                    });
    
                    btnContainer.appendChild(btn);
                });
            } else {
                // Check if btnContainer has any children
                if (btnContainer.children.length > 0) {
                    const buttons = document.querySelectorAll('.year-btn');
                    buttons.forEach(button => {
                        // Disable Election data related year buttons when checkbox is unchecked
                        button.disabled = false;
                        button.classList.remove('disabled');
                    });
                } else {
                    electionYears.forEach(year => {
                        const btn = document.createElement('button');
                        btn.classList.add('year-btn');
                        btn.textContent = year;
        
                        btn.addEventListener('click', () => {
                            //Turn geo location off
                            if (geoLocation) {
                                navigator.geolocation.clearWatch(geoLocation);
                            }
                            electionBtnClick = true;
                            parliamentBtnClick = false;
                            fetchJSONData(year);
                        });
        
                        btnContainer.appendChild(btn);
                    });
                }
                
            }
        }

        if (eventLayer.name === 'ParliamentData') {

            // Remove the ElectionData layer and uncheck the checkbox value
            setTimeout(function(){map.removeLayer(electionJSON)}, 10);
            // Uncheck the ElectionData checkbox value
            setTimeout(function(){map.removeLayer(electionLayer)}, 10);

            // Add ParliamentData layer
            setTimeout(function(){map.addLayer(parliamentJSON)}, 10);

            // remove the existing election data related buttons
            const buttons = document.querySelectorAll('.year-btn');
            buttons.forEach(button => {
                button.remove();
            });

            // Create the parliamentData related year buttons
            const btnContainer = document.querySelector('.btn-container');

            // Check if btnContainer has any children
            if (btnContainer.children.length > 0) {
                const buttons = document.querySelectorAll('.parliament-year-btn');
                buttons.forEach(button => {
                    // Disable Election data related year buttons when checkbox is unchecked
                    button.disabled = false;
                    button.classList.remove('disabled');
                });
            } else {
                parliamentYears.forEach(year => {
                    const btn = document.createElement('button');
                    btn.classList.add('parliament-year-btn');
                    btn.textContent = year;
    
                    btn.addEventListener('click', () => {
                        //Turn geo location off
                        if (geoLocation) {
                            navigator.geolocation.clearWatch(geoLocation);
                        }
                        parliamentBtnClick = true;
                        electionBtnClick = false;
                        fetchJSONData(year);
                    });
    
                    btnContainer.appendChild(btn);
                });
            }
        }
        if (eventLayer.name === 'GeoLocation') {
            //Turn geo location on
            geoLocation = navigator.geolocation.watchPosition(success, error);
        }
    });

    map.on('overlayremove', function (eventLayer) {
        if (eventLayer.name === 'ElectionData') {
            // Disable buttons
            const buttons = document.querySelectorAll('.year-btn');
            buttons.forEach(button => {
                // Disable Election data related year buttons when checkbox is unchecked
                button.disabled = true;
                button.classList.add('disabled');
            });
        }
        if (eventLayer.name === 'ParliamentData') {
            setTimeout(function(){map.removeLayer(parliamentJSON)}, 10);

            const buttons = document.querySelectorAll('.parliament-year-btn');
            buttons.forEach(button => {
                button.disabled = true;
                button.classList.add('disabled');
            });
        }
        if (eventLayer.name === 'GeoLocation') {
            //Turn geo location off
            if (geoLocation) {
                navigator.geolocation.clearWatch(geoLocation);
            }
            // Remove the marker and circle variables
            if (marker) {
                map.removeLayer(marker);
                map.removeLayer(circle);
            }
        }
    });

    let mapLayers = L.control.layers(baseLayers, baseOverlays).addTo(map);

    map.fitBounds(electionJSON.getBounds());
}


function getFeature(feature, layer, electionDataArray) {
    if (!feature.id) return;
    
    let name = feature.properties.nimi;

    const dataItem = electionDataArray.find(item => item.name === name);

    let electionVotes = 0;  // Default value if not found
    let mostVotesIndex = 0;
    let party = 'N/A';
    let year = "";
    let areaCode = "";
    let electionType = "";

    if (dataItem) {

        let mostVotes = Math.max(...dataItem.data);
        mostVotesIndex = dataItem.data.indexOf(mostVotes);
        electionVotes = mostVotes;  
        year = dataItem.year;
        areaCode = dataItem.areaCode;
        party = dataItem.party[mostVotesIndex];

        if (year == '2019') {
            electionType = 'Parliament elections'
        } else {
            electionType = 'Municipal elections'
        }

        // Check if party has a space, if so trim the word
        if (party && party.includes(' ')) {
            party = party.split(' ')[0];
        }

        // Check if party has a comma, if so trim the word
        if (party && party.includes(',')) {
            party = party.split(',')[0];
        }

        // Default party name to N/A if no votes are in the dataset
        if (mostVotesIndex == 0) {
            if (mostVotes == 0) {
                party = 'N/A'
            }
        }
    }

    layer.bindPopup(
        `
        <div class='grid-container'>
            <div>${electionType}</div>
            <div>Municipality of ${name} (${year})</div>
        
        
            <ul>
                <li> Winning party: ${party}</li>
                <li>Total votes: ${electionVotes}</li>
            </ul>
            <a class="tag" onclick="window.location.href = 'newchart.html?param='
                + encodeURIComponent('${areaCode}');">Get additional data charts!</a>
        </div>
        `
        
    );

    layer.bindTooltip(name);
}

async function fetchJSONData(year) {
    let geoJSONURL = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    let electionURL = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/kvaa/statfin_kvaa_pxt_12g3.px";
    let parliamentURL = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/euvaa/020_euvaa_2019_tau_102.px";

    const geoStatPromise = await fetch(geoJSONURL);
    const geoJSONData = await geoStatPromise.json();


    const electionJSONQuery = getElectionJSONQuery(year)

    const electionPromise = await fetch(electionURL, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(electionJSONQuery)
    });
    if (!electionPromise.ok) {
        return;
    }
    const electionData = await electionPromise.json();


    const parliamentJSONQuery = getParliamentJSONQuery(year)

    const parliamentPromise = await fetch(parliamentURL, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(parliamentJSONQuery)
    });
    if (!parliamentPromise.ok) {
        return;
    }
    const parliamentData = await parliamentPromise.json();

    initMap(geoJSONData, electionData, parliamentData);
}

