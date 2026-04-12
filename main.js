const input_city = document.getElementById("text_city");
const btn_search = document.getElementById("button_search");

const city = document.getElementById("ciudad");
const tempe = document.getElementById("temp");
const state = document.getElementById("estado");
const wind = document.getElementById("viento");

const container_main = document.getElementById("container_principal");
const container_data = document.getElementById("cont_data");
const container_buscador = document.getElementById("cont_buscador");

container_data.hidden = true;

btn_search.addEventListener("click", () => {
    const city_searched = input_city.value;

    const loading = document.createElement("h4");
    loading.textContent = "Cargando..."

    container_main.appendChild(loading);

    if (!input_city.value) return;

    obtenerClima(city_searched);

    setTimeout(() => {
        loading.remove();
        container_data.classList.remove("container_datos");
        container_data.hidden = false;
    }, 1500);
});

input_city.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        btn_search.click();
    };
});

async function obtenerClima(city_searched) {
    try {
        const respuesta = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city_searched}`);
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (!datos.results) return;

        const lat = datos.results[0].latitude;
        const lon = datos.results[0].longitude;

        const respuestaClima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const datosClima = await respuestaClima.json();

        const dato_tempe = datosClima.current_weather.temperature;
        const dato_estado = datosClima.current_weather.weathercode;
        const dato_viento = datosClima.current_weather.windspeed;

        city.textContent = input_city.value;
        tempe.textContent = `${dato_tempe} °C`;
        wind.textContent = `${dato_viento} km/h`;

        

        if (dato_estado == 0) {
            state.textContent = "Despejado ☀️";
        } else if (dato_estado <= 3) {
            state.textContent = "Parcialmente Nublado ⛅";
        } else if (dato_estado <= 48) {
            state.textContent = "Niebla 🌫️";
        } else if (dato_estado <= 67) {
            state.textContent = "Lluvia 🌧️";
        } else if (dato_estado <= 77) {
            state.textContent = "Nieve ❄️";
        }

        input_city.value = ""
    } catch (error) {
        if (error.message == "502") {
            container_buscador.remove();
            container_data.classList.add("container_datos");

            const error502 = document.createElement("p")
            error502.textContent = "Error 502: Servidor caído ⚠️"

            container_main.appendChild(error502);
        } else if (error.message == "404") {
            container_buscador.remove();
            container_data.classList.add("container_datos");

            const error404 = document.createElement("p")
            error404.textContent = "Error 404: No encontrado ❌"

            container_main.appendChild(error404);
        } else {
            container_buscador.remove();
            container_data.classList.add("container_datos");

            const errorGeneral = document.createElement("p")
            errorGeneral.textContent = "Error general"

            container_main.appendChild(errorGeneral);
        }
    };
};