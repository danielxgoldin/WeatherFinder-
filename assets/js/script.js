let searchform = $("#search-form");
let prevSearch = $("#prev-search");
let weather = $("#current-date");
let forecast = $("#5-day-forecast");
let forecastTitle= $("#forecast-title")

let cityList = []
let isClearing = false;
let clearMessageCode;

function getData(event) {
    event.preventDefault();
    let city = "";
    if(event.target.textContent === "Search") {
        city = searchform.children("input").val();
        searchform.children("input").val("");
    } else {
        city = event.target.textContent;
    }
    city = city.toUpperCase();
    if(!city) {
        invalidInput();
        return;
    }

    let requestUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data.length) {
                let lat = data[0].lat;
                let lon = data[0].lon;
                requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
                fetch(requestUrl)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        displayWeather(data, city);    
                        displayForecast(data);
                        saveCity(city);   
                    });
            } else {
                invalidInput();
            }
        });
}

// Set the day
let today = dayjs();

function init() {
    searchform.children("button").on("click", getData);
    initiateStorage();
    initiatePrev();
}

// Controls API not responding correctly 
function invalidInput() {
    if(!isClearing) {
        let messageSpace = $("<p>");
        messageSpace.text("This is not a valid city ");
        messageSpace.css("color", "blue");
        searchform.append(messageSpace); 
        clearAnswer();  
    } else {
        clearAnswer();
    }
}

function clearAnswer() {
    if(isClearing) {
        isClearing = false;
        clearTimeout(clearMessageCode);
        clearAnswer();
    } else {
        isClearing = true;
        clearMessageCode = setTimeout(function() {
            searchform.children().eq(3).remove();
            isClearing = false;
        }, 1500);
    }
}

// Displays weather for location searched 
function displayWeather(data, city) {
    let title = weather.children().eq(0).children("h2")
    let conditions = weather.children().eq(0).children("img");
    let temp = weather.children().eq(1);
    let wind = weather.children().eq(2);
    let humidity = weather.children().eq(3);
    let uvIndex = weather.children().eq(4);
    
    weather.addClass("card bg-light mb-3");

    title.text(`${city} ${today.format("MM/DD/YYYY")}`);
    conditions.attr("src",`https://openweathermap.org/img/w/${data.current.weather[0].icon}.png`);
    temp.text(`Temp: ${data.current.temp}°C`);
    wind.text(`Wind: ${Math.round((data.current.wind_speed * 3.6))} kph`);
    humidity.text(`Humidty: ${data.current.humidity}%`);
    uvIndex.text(`UV Index: ${data.current.uvi}`);

    let uv = data.current.uvi;
    if(uv < 4) {
        uvIndex.css("background-color", "green");
    }else if(uv < 7) {
        uvIndex.css("background-color", "yellow");
    }else {
        uvIndex.css("background-color", "red");
    }
    
}

// If local storage has items this function arranges them in an array 
function initiateStorage() {
    if(localStorage.getItem("cityList") !== null) {
        cityList = JSON.parse(localStorage.getItem("cityList"));
    }
    localStorage.setItem("cityList", JSON.stringify(cityList));
}

// Shows the forecast for the next 5 days. 
function displayForecast(data) {
    forecastTitle.css("visibility", "visible");
    for(let i = 0; i < 5; i++) {
        let date = forecast.children().eq(i).children().eq(0);
        let conditions = forecast.children().eq(i).children("img");
        let temp = forecast.children().eq(i).children().eq(2);
        let wind = forecast.children().eq(i).children().eq(3);
        let humidity = forecast.children().eq(i).children().eq(4);

        forecast.children().eq(i).addClass("card text-white bg-dark mb-3 mx-1")

        let index = i + 1;
        date.text(today.add((i + 1), "d").format("MM/DD/YYYY"));
        conditions.attr("src",`https://openweathermap.org/img/w/${data.daily[index].weather[0].icon}.png`);
        temp.text(`Temp: ${data.daily[index].temp.day}°C`);
        wind.text(`Wind: ${Math.round(data.daily[index].wind_speed * 3.6)} kph`);
        humidity.text(`Humidity: ${data.daily[index].humidity}%`);
    }
}

// If user had searched previously this will show the search as a button. 
function initiatePrev() {
    let i = 0;
    while(i < cityList.length && i < 10) {
        let prev = $("<button>");
        prev.text(`${cityList[i]}`);
        prev.attr("class", "col-8 my-1 btn btn-dark");
        prevSearch.append(prev);
        i++;
    }
    prevSearch.children("button").on("click", getData)
}

//If any cities have been previously searched this will show them in order. 
function saveCity(city) {
    if(localStorage.getItem("cityList") !== null) {
        cityList = JSON.parse(localStorage.getItem("cityList"));
    }
    while(cityList.length > 9) {
        cityList.pop();
    }
    for(let i = 0; i < cityList.length; i++) {
        if(city === cityList[i]) {
            return
        }
    }
    cityList.reverse();
    cityList.push(city);
    cityList.reverse();
    
    localStorage.setItem("cityList", JSON.stringify(cityList));
    updatePrev();
}

//This controls the amount of buttons allowed. If more then 10 buttons are created it replaces them. 
function updatePrev() {
    if(cityList.length < 10) {
        let prev = $("<button>");
        prev.text(`${cityList[0]}`);
        prev.attr("class", "col-8 my-1 btn btn-dark");
        prevSearch.append(prev);
    } else {
        for(let i = 0; i < 10; i++) {
            prevSearch.children().eq(i).text(cityList[i]);
        }
    }    
}

init();
