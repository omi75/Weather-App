const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector("[weather-container]");
const error_div=document.querySelector(".error-section");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let currentTab=userTab;
let API_key="ec73b99dc0335505778b9b1c1580f63a";
currentTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(clickTab)
{
    if(clickTab!=currentTab)
    {
        currentTab.classList.remove("current-tab");
        currentTab=clickTab;
        currentTab.classList.add('current-tab');

        //  if i clicked search tab
        if(!searchForm.classList.contains('active'))
        {
            userInfoContainer.classList.remove('active');
            grantAccessContainer.classList.remove('active');
            searchForm.classList.add('active');

        }
        else    // means i click your weather tab
        {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            error_div.classList.remove('active');
            getfromSessionStorage();
        }
    }
}

function getfromSessionStorage()
{
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates)
    {
        grantAccessContainer.classList.add('active');
    }
    else
    {
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates); 
    }
}

async function fetchUserWeatherInfo(coordinates)
{
    const{lat,lon}=coordinates;
    grantAccessContainer.classList.remove('active');
    loadingScreen.classList.add('active');
    // API CALL
    try
    {
        let res=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`);
        const data=await res.json();
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch(err)
    {
        loadingScreen.classList.remove('active');
        console.log("Error: "+err);
    }
}

function renderWeatherInfo(data)
{
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloud]");

    cityName.textContent=data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;    // ?. is optional chaining
    desc.innerText=data?.weather?.[0]?.description;
    weatherIcon.src=`http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.textContent=`${data?.main?.temp} °C`;
    windspeed.innerText=`${data?.wind?.speed} m/s`;
    humidity.innerText=`${data?.main?.humidity} %`;
    cloudiness.innerText=`${data?.clouds?.all} %`;

}
userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});

function getLocation()
{
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition)
    }
    else
    {
        alert("Browser doesn't support location");
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Grant Button code
const grantBtn=document.querySelector("[data-grantAccess]");
grantBtn.addEventListener("click",getLocation);

// search city code
const searchInput = document.querySelector("[data-searchInput]");

async function fetchSearchWeatherInfo(city)
{
    
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessContainer.classList.remove('active');
    try
    {
        let res=await fetch( `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        let data=await res.json();
        if(data?.message=="city not found")       // if city not found
        {
            error_div.classList.add('active');
            loadingScreen.classList.remove('active');
            userInfoContainer.classList.remove('active');
        }
        else
        {
            loadingScreen.classList.remove('active');
            userInfoContainer.classList.add('active');
            error_div.classList.remove('active');
            renderWeatherInfo(data); 
        }
    }
    catch(err)
    {

    }
}
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(searchInput.value==="") return;

    fetchSearchWeatherInfo(searchInput.value);
})

