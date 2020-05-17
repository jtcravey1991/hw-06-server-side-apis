//global variables
var savedCities = [];
var lastLoad = "";
var apiKey = "dc0ae9cc86877232d23ff55ed12fdf38"

initialize();

// initializes the page
function initialize() {
    loadCities();
    loadLastLoad();
    renderCityList();
    if (lastLoad !== "") {
        currentWeatherRender(lastLoad);
        renderForecast(lastLoad);
    }
}

//event listener for adding a city
$("#cityAddButton").on("click", function () {
    if ($("#citySearch").val() !== "") {
        var city = $("#citySearch").val();
        savedCities.push($("#citySearch").val());
        $("#citySearch").val("");
        currentWeatherRender(city);
        renderForecast(city);
        saveCities();
        renderCityList();
        lastLoad = city;
        saveLastLoad();
    }
});

//adds event listener to city list
$("#citiesList").on("click", function (event) {
    if (event.target.parentElement.id === "citiesList") {
        var city = event.target.textContent;
        lastLoad = city;
        saveLastLoad();
        currentWeatherRender(city);
        renderForecast(city);
    }
});

//adds event listener to clear cities
$("#clearCities").on("click", function () {
    var cont = confirm("Are you sure you want to clear your city history?");
    if (cont === false) {
        return;
    }
    else {
        savedCities = [];
        saveCities();
        renderCityList();
    }
});

// renders list of cities
function renderCityList() {
    $("#citiesList").empty();
    for (var i = 0; i < savedCities.length; i++) {
        var li = $("<li>");
        li.text(savedCities[i]);
        $("#citiesList").prepend(li);
    }
}

// renders the current weather for input city
function currentWeatherRender(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        $("#cityDate").empty();
        $("#cityDate").text(response.name + " " + "(" + moment().format("M/D/YYYY") + ")");
        var weatherIcon = $("<img>");
        weatherIcon.attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png")
        weatherIcon.attr("alt", response.weather[0].description);
        $("#cityDate").append(weatherIcon);

        $("#tempSpan").text(((parseInt(response.main.temp) * (9 / 5)) - 459.67).toFixed(2) + "° F");

        $("#humiditySpan").text(response.main.humidity + "%");

        $("#windSpan").text(response.wind.speed + " mph");

        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&cnt=1",
            method: "GET"
        }).then(function (uvresponse) {
            $("#uvSpan").text(uvresponse.value);
            if (uvresponse.value < 3) {
                $("#uvSpan").css("background", "green");
                $("#uvSpan").css("color", "white");
            }
            else if (uvresponse.value < 6) {
                $("#uvSpan").css("background", "yellow");
                $("#uvSpan").css("color", "black");
            }
            else if (uvresponse.value < 8) {
                $("#uvSpan").css("background", "orange");
                $("#uvSpan").css("color", "black");
            }
            else if (uvresponse.value < 11) {
                $("#uvSpan").css("background", "red");
                $("#uvSpan").css("color", "white");
            }
            else {
                $("#uvSpan").css("background", "violet");
                $("#uvSpan").css("color", "white");
            }
        });

    });
}

// renders forecast cards
function renderForecast(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&exclude=current,minutely,hourly&appid=" + apiKey,
            method: "GET"
        }).then(function (result) {
            $("#forecastList").empty();
            for (var i = 1; i < 6; i++) {
                var forecastDiv = $("<div>");
                forecastDiv.addClass("col-8 col-lg-2 forecastCard");

                var date = $("<p>");
                date.text(moment().add(i, "days").format("M/D/YYYY"));
                forecastDiv.append(date);

                var icon = $("<img>");
                icon.attr("src", "http://openweathermap.org/img/wn/" + result.daily[i].weather[0].icon + "@2x.png");
                icon.attr("alt", result.daily[i].weather[0].main);
                forecastDiv.append(icon);

                var temp = $("<p>");
                temp.html("Temp: <br>" + ((parseInt(result.daily[i].temp.day) * (9 / 5)) - 459.67).toFixed(2) + "° F");
                forecastDiv.append(temp);
                
                var humidity = $("<p>");
                humidity.html("Humidity: <br>" + result.daily[i].humidity + "%");
                forecastDiv.append(humidity);

                $("#forecastList").append(forecastDiv);
            }
        });
    });
}

// saves cities to local storage
function saveCities() {
    localStorage.setItem("savedCities", JSON.stringify(savedCities));
}

// load saved cities from local storage
function loadCities() {
    var tempCities = JSON.parse(localStorage.getItem("savedCities"));
    if (tempCities !== null) {
        savedCities = tempCities;
    }
}

// save lastLoad to local storage
function saveLastLoad() {
    localStorage.setItem("lastLoad", lastLoad);
}

// loads lastLoad from local storage
function loadLastLoad() {
    var tempLoad = localStorage.getItem("lastLoad");
    if (tempLoad !== null) {
        lastLoad = tempLoad;
    }
}
