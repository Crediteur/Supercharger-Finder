const apikey = "5f5b69d0-113f-4c47-96ac-6eaab1434864"; //random unimportant string
let geocoder;
let map;
let lati = 42.2;
let long = -82.3;
let maxResults = 60;
let distance = 80;
let connectionTypeId = '&connectiontypeid=27,';
let statusTypeId = '';

function apiURL(lati, long) {
    return `https://api.openchargemap.io/v3/poi/?&output=json&maxresults=${maxResults}${connectionTypeId}&verbose=true&distance=${distance}&latitude=${lati}&longitude=${long}&key=${apikey}${statusTypeId}`;
}

//fetch openchargemap data once latitde and longitude parameters are set
async function getMapLocation(lati, long) {
    const response = await fetch(apiURL(lati, long));
    const responseData = await response.json();

    initMap(responseData, lati, long);
}

//input here, lati, long
getMapLocation(42.2, -82.5);

//read text input and geocode coordinates using Google API to fetch data from openchargemap API
function geocode(request) {
    geocoder
        .geocode(request)
        .then((result) => {
            const {
                results
            } = result;
            //convert whatever the heck the geocode data is to string and then to JSON, maybe stringify isnt needed
            const JSONresult = JSON.parse(JSON.stringify(result));
            map.setCenter(results[0].geometry.location);
            map.setZoom(8);
            //lat and long data needs to be numbers
            let latit = parseFloat(JSONresult.results[0].geometry.location.lat);
            let longi = parseFloat(JSONresult.results[0].geometry.location.lng);

            if (latit !== null && longi != null) {
                getMapLocation(latit, longi);
            }
        })
        .catch((e) => {
            alert(e + "\n\nTry being more specific!");
        });
}

//listener on click to change dom events
const submit_button = document.getElementById('submit-button');
const title = document.getElementById('title');
const filter = document.getElementById('checkbox-filter');
const upcoming = document.getElementById('checkbox-upcoming');

//events and filters happening on clicking submit
submit_button.addEventListener("click", (e) => {
    e.preventDefault();
    //hide title h1
    title.style.display = "none";

    //read values of sidepanel input boxes
    maxResults = document.getElementById('max-results-var').value;
    if (maxResults < 1) {
        maxResults = 1;
    }
    distance = document.getElementById('max-distance-var').value;
    if (distance < 1) {
        distance = 1;
    }
    //check boxes for filter and future chargers
    if (filter.checked) {
        connectionTypeId = '&connectiontypeid=27,';
    }
    else {
        connectionTypeId = '';
    }
    if (upcoming.checked) {
        statusTypeId = '&statustypeid=150';
    }
    else {
        statusTypeId = '';
    }
    //read text from input box and call geocode API
    const search_input = document.getElementById('search-input').value;
    geocode({
        address: search_input
    })
});
//main maps function
function initMap(responseData, lati, long) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: lati = lati !== 'undefined' ? lati : 42.2, lng: long = long !== 'undefined' ? long : -82.3 },
        zoom: 10,
        mapId: 'a77d7dd0bf1ed194' //custom map style key from Google Cloud
    });

    const infoWindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();

    //loop through all objects in responseData, use i to multiply drop animation delay
    for (let i = 0; i < responseData.length; i++) {
        setTimeout(() => {
            const marker = new google.maps.Marker({
                //lat and lng need to be numbers not strings, maybe not needed here
                position: { lat: parseFloat(responseData[i].AddressInfo.Latitude), lng: parseFloat(responseData[i].AddressInfo.Longitude) },
                map,
                title: responseData[i].AddressInfo.Title,
                animation: google.maps.Animation.DROP,
                icon: {
                    url: markerPicture(), //"assets/supercharger-icon.webp",
                    scaledSize: new google.maps.Size(40, 40)
                }
            });
            //click markers to show infoWindow
            marker.addListener("click", () => {
                infoWindow.close();
                infoWindow.setOptions({ maxWidth: 300 });
                infoWindow.setContent(infoWindowContent()); //marker.getTitle()
                infoWindow.open(marker.getMap(), marker);
            });
            //infoWindow format using mixed string with HTML
            function infoWindowContent() {
                let link = "https://maps.google.com/?ll=" + responseData[i].AddressInfo.Latitude + "," + responseData[i].AddressInfo.Longitude;
                return '<div id="info-window-title">' + responseData[i].AddressInfo.Title + '</div>' + '<div></div>' + responseData[i].AddressInfo.AddressLine1 + '<div></div>'
                    + responseData[i].AddressInfo.Town + ", " + (responseData[i].AddressInfo.StateOrProvince || "") + " " + (responseData[i].AddressInfo.Postcode || "")
                    + '<div id="pad"></div>' + "<a id='info-window-link'href=" + link + "><span>View on Google Maps</span></a>"; //+ responseData[i].AddressInfo.Latitude + ',' + responseData[i].AddressInfo.Longitude + '><span>View on Google Maps</span></a>';
            }
            function markerPicture() {
                if (responseData[i].StatusTypeID == 150) {
                    return 'assets/under-construction.png'
                }
                else if (responseData[i].Connections[0].ConnectionTypeID == 27) {
                    return 'assets/supercharger-icon.webp';
                }
                else {
                    return 'assets/regular-icon.png'
                }
            }
            //sleep delay for marker animation, closer to 0 increases speed
        }, i * 100);
    }
}
document.querySelector(".side-panel-toggle").addEventListener("click", () => {
    document.querySelector(".wrapper").classList.toggle("side-panel-open");
});
// TODO:
// missing supercharger poster
// better default google maps UI/hide them
// google directions API map path to markers on click
// google geolocation API, with mobile/browser gps

//https://api.openchargemap.io/v3/poi openchargemap API
//created in 2 days for WinHacks2022
