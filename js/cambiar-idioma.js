const languageSelect = document.querySelector("[data-language-selector]");
const textsToChange = document.querySelectorAll("[data-section]");

languageSelect.addEventListener("change", () => {
    const selectedOption =
        languageSelect.options[languageSelect.selectedIndex];

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
