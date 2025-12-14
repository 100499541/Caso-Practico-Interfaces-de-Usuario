// Este codigo se encarga de la traduccion del sitio web
// Utilizamos un archivo JSON para almacenar las traducciones
// Y obtenemos los elementos a traducir mediante data-attributes en el html correspondiente

// Primero, seleccionamos el selector de idioma y los textos a cambiar
const languageSelect = document.querySelector("[data-language-selector]");
const textsToChange = document.querySelectorAll("[data-section]");

// Esperamos a que el usuario cambie el idioma mediante el selector
languageSelect.addEventListener("change", () => {
    // Obtenemos la opcion seleccionada
    const selectedOption =
        languageSelect.options[languageSelect.selectedIndex];

    // Guardamos la opcion en el localStorage para mantener la preferencia del usuario
    localStorage.setItem("language", selectedOption.dataset.language);

    // Cargamos el archivo JSON correspondiente al idioma seleccionado
    fetch(`../idiomas/${selectedOption.dataset.language}.json`)
        .then(res => res.json())
        .then(data => {
            textsToChange.forEach((el) => {
                // Obtenemos la seccion y el valor a traducir desde los data-attributes
                const section = el.dataset.section;
                const value = el.dataset.value;
                
                // Finalmente, cambiamos el texto del elemento por la traduccion correspondiente
                el.innerHTML = data[section][value];
            })
        })
})

// Esta parte del codigo se encarga de mantener el idioma seleccionado al recargar la pagina

// Al cargar la pagina, verificamos si hay un idioma guardado en el localStorage
document.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("language");

    // Si hay un idioma guardado, seleccionamos la opcion correspondiente en el selector
    if (savedLanguage) {
        const option = languageSelect.querySelector(
            `option[data-language="${savedLanguage}"]`
        );

        if (option) {
            languageSelect.value = option.value;
            languageSelect.dispatchEvent(new Event("change"));
        }
    }
});

