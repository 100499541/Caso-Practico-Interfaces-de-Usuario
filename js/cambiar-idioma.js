const languageSelect = document.querySelector("[data-language-selector]");
const textsToChange = document.querySelectorAll("[data-section]");

languageSelect.addEventListener("change", () => {
    const selectedOption =
        languageSelect.options[languageSelect.selectedIndex];

    localStorage.setItem("language", selectedOption.dataset.language);

    fetch(`../idiomas/${selectedOption.dataset.language}.json`)
        .then(res => res.json())
        .then(data => {
            textsToChange.forEach((el) => {
                const section = el.dataset.section;
                const value = el.dataset.value;

                el.innerHTML = data[section][value];
            })
        })
})

document.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("language");

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

