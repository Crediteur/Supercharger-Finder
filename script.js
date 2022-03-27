const apikey = "5f5b69d0-113f-4c47-96ac-6eaab1434864"; //random unimportant string
let geocoder;
let map;
let lati = 42.2;
let long = -82.3;
let maxresults = 60;
let distance = 80;

function apiURL(lati, long) {
    return `https://api.openchargemap.io/v3/poi/?&output=json&maxresults=${maxresults}&connectiontypeid=27,&verbose=true&distance=${distance}&latitude=${lati}&longitude=${long}&key=${apikey}`;
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

            console.log(JSONresult.results[0].geometry.location);
            console.log(latit, longi);
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
submit_button.addEventListener("click", (e) => {
    e.preventDefault();

    const search_input = document.getElementById('search-input').value;
    //hide title
    title.style.display = "none";

    maxresults = document.getElementById('max-results-var').value;
    distance = document.getElementById('max-distance-var').value;
    //connection type if true, var = "connectiontypeid=27,", else var = "", remember to change icon


    console.log(maxresults);
    //read text from input box and call geocode API
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
                    url: "assets/supercharger-icon.webp",
                    scaledSize: new google.maps.Size(35, 35)
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
            //sleep delay for marker animation, closer to 0 increases speed
        }, i * 100);
    }
}
document.querySelector(".side-panel-toggle").addEventListener("click", () => {
    document.querySelector(".wrapper").classList.toggle("side-panel-open");
});
//42.23928402279128, -82.54988032339418 UoWindsor
//AIzaSyAE1HBf2OJrgDs0_Lfxe2QzP2tPKqvZiT4 map API
//AIzaSyA054iiAhFsbUTfRgcA57Z95YG5ZfvORzQ geocode API


// TODO:
// missing supercharger poster
// sidepanel with customizable parameters, non tesla charging stations, upcoming stations
// better default google maps UI/hide them
// google directions API map path to markers on click
// google geolocation API, with mobile/browser gps

//5f5b69d0-113f-4c47-96ac-6eaab1434864 randomly generated api key
//https://api.openchargemap.io/v3/poi openchargemap API
//a77d7dd0bf1ed194 map id
//WinHacks2022, API learnign experience