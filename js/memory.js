














var memory = {
    generate: async function(e, amount, tense) {
        const json_data = await load_json("memory.json");
        const content = choose_array(JSON.parse(json_data)[tense], amount);

        // Neuer Container als Grid: 5 Spalten, 4 Zeilen.
        // Die Höhe soll exakt den verfügbaren Platz (100vh minus Navbar) einnehmen.
        const container = document.createElement("div");
        container.classList.add("container");
        container.classList.add("memory-container");
        container.style.height = "calc(100vh - 10vh)";  // Höhe = vollen Viewport minus Navbar (10vh)
        container.style.width = "100vw";
        container.style.display = "grid";
        container.style.gridTemplateColumns = "repeat(5, 1fr)"; // 5 Spalten
        container.style.gridTemplateRows = "repeat(4, 1fr)";    // 4 Reihen
        container.style.gap = "0px";     // Kein zusätzlicher Abstand
        container.style.margin = "0";    // Kein Rand
        container.style.padding = "0";   // Kein Padding
        container.style.overflow = "hidden"; // Überschüssige Inhalte ausblenden

        function createCard(text, id) {
            const card = document.createElement("p");
            card.classList.add("card");
            card.dataset.id = id;
            card.onclick = function (event) { memory.check(event); };
            // Passe die Kartengröße an die Zelle an
            card.style.width = "100%";
            card.style.height = "100%";

            const front = document.createElement("p");
            front.classList.add("front");
            front.innerHTML = text;
            const back = document.createElement("p");
            back.classList.add("back");

            card.appendChild(back);
            card.appendChild(front);
            return card;
        }
        
        let cards = [];
        for (let i = 0; i < content.length; i++) {
            const id = unique_id();
            for (let j = 0; j < content[i].length; j++) {
                const card = createCard(content[i][j], id);
                cards.push(card);
            }
        }
        cards = choose_array(cards, cards.length);
        for (let i = 0; i < cards.length; i++) {
            container.appendChild(cards[i]);
        }
        e.appendChild(container);
    },
    check: function(e) {
        const element = e.currentTarget;

        if (element.classList.contains("hidden")) {
            return;
        }
        
        const actives = element.parentElement.getElementsByClassName("active");

        if (actives.length >= 2) {
            const length = actives.length;
            for (let i=0; i<length; i++) {
                actives[0].classList.remove("active");
            }
        }
        element.classList.add("active");

        if (actives.length == 2) {
            let equal = true;
            for (let i=0; i<actives.length-1; i++) {
                if (actives[i].dataset.id != actives[i+1].dataset.id) {
                    equal = false;
                    break;
                }
            }
            if (equal) {
                for (let i=0; i<actives.length; i++) {
                    actives[i].classList.add("hidden");
                }
            }
        }
    }
};