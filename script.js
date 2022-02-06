
// variable declaration
var myAPI = "788d5638d7c8e354a162d6c9747d1bdf";
var currcity = "";
var prevcity = "";


//error handling in ajax call
var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

//function to get status of the city
var currentStatus = (event) => {

    // Obtain city name from the search box
    let city = $('#search-city').val();
    currcity= $('#search-city').val();


    // api to get weather details
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=" + myAPI;
    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        
       //////////////////local storage saving city////////////////////////////////////
        let isCity = false;
        // Check if City exists in local storage
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage["cities" + i] === city) {
                iscity = true;
                break;
            }
        }
        // Save to localStorage if city is new
        if (isCity === false) {
            localStorage.setItem('cities' + localStorage.length, city);
        }

       //if any error occurs
        $('#search-error').text("");



        // Create icon for the current weather using Open Weather Maps
        let currIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        // Offset UTC timezone - using moment.js
        let currTime = response.dt;
        let currTimezone = response.timezone;
        let currTimezonehrs = currTimezone / 60 / 60;
        let currentMoment = moment.unix(currTime).utc().utcOffset(currTimezonehrs);

        // getcities list
        getCities();


        // 5 day forecast
        get5DayForecast(event);
        
        // HTML for the results of search
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        // Append the results to the DOM
        $('#current-weather').html(currentWeatherHTML);

        

        // Get the latitude and longitude for the UV search from Open Weather Maps API
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${myAPI}`;

        fetch(uvQueryURL)
        .then(handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}

//forecast 5 days
var get5DayForecast = (event) => {
    let city = $('#search-city').val();
    // Set up URL for API search using forecast search
    let qURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    
    //fetch to get response (React)
    fetch(qURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
      
        for (let i = 0; i < response.list.length; i++) {
            let dataofday = response.list[i];
            let dayTime = dataofday.dt;
            let timeZone = response.city.timezone;
            let timeZoneHours = timeZone / 60 / 60;
            let thisMoment = moment.unix(dayTime).utc().utcOffset(timeZoneHours);
            let iconURL = "https://openweathermap.org/img/w/" + dataofday.weather[0].icon + ".png";
            // Only displaying mid-day forecasts
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dataofday.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dataofday.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }

        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}


// get the list of searched cities
var getCities = () => {
    $('#city-results').empty();
  
    //local storage empty
    if (localStorage.length===0){
        if (prevcity){
            $('#search-city').attr("value", prevcity);
        } else {
            $('#search-city').attr("value", "San Diego");
        }

    } else {
        
        //get previous city info
        let prevcityKey="cities"+(localStorage.length-1);
        prevcity=localStorage.getItem(prevcityKey);
        $('#search-city').attr("value", prevcity);


        // Append cities to localstorage
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityblock;


            // set prevcity as currencity
            if (currcity===""){
                currcity=prevcity;
            }
           
            cityblock = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
           
            //add to html
            $('#city-results').prepend(cityblock);
        }


        // Add a "clear" button to page if there is a cities list
        //if (localStorage.length>0){
         //   $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        //} else {
        //    $('#clear-storage').html('');
       // }
    }
    
}

// New city search button event listener
$('#search-button').on("click", (event) => {
event.preventDefault();
currcity = $('#search-city').val();
currentStatus(event);
});

// Old searched cities buttons event listener
$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currcity=$('#search-city').val();
    currentStatus(event);
});

// Clear old searched cities from localStorage event listener
//$("#clear-storage").on("click", (event) => {
//    localStorage.clear();
//    getCities();
//});


getCities();

