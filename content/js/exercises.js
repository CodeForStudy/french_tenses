function unique_id() {
    const id = String(Date.now()) + String(Math.random());
    return id;
}

function choose_array(arr, amount) {
    const shuffled = arr.slice();

    for (let i=0; i < shuffled.length; i++) {
        const j = Math.floor( Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let output = shuffled.slice(0, amount);
    /*
    if (output.length < amount) {
        output = output.concat(choose_json(arr, amount-output.length));
    }
    */
    return output;
}

async function load_json(path) {
    try {
        const response = await fetch(`json/${path}`);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der JSON-Datei: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Fehler:", error);
        throw error;
    }
}

function load_exercise(classname, amount, settings) {
    const elements = document.getElementsByClassName(classname);
    for( let i=0; i<elements.length; i++) {
        window[classname].generate(elements[i], amount, settings);
    }
}

var gaptext = {
    allowDrop: function(e) {
        e.preventDefault();
    },
      
    drag: function(e) {
        e.dataTransfer.setData("dnd", e.target.id);
    },
      
    drop: function(e, tag) {
        e.preventDefault();
        const data = document.getElementById(e.dataTransfer.getData("dnd"));
        if (data.classList.contains(tag) && ((e.target.classList.contains("gap") && e.target.innerHTML == "") || e.target.classList.contains("container"))) {
            e.target.appendChild(data);
        }
    },
    
    check: function(e) {
        const gaps = e.target.parentElement.getElementsByClassName("gap");
        right = [];
        wrong = [];
        for(let i=0; i<gaps.length; i++) {
            if(gaps[i].children.length == 0) {
                wrong.push(gaps[i]);
                continue;
            }
            if ((gaps[i].dataset.solution == gaps[i].children[0].id)) {
                right.push(gaps[i]);
            } else {
                wrong.push(gaps[i]);
            }
        }
        this.setFeedback(right, wrong);
    },
    
    setFeedback: function(right, wrong) {
        const elements = right.concat(wrong);
        for (let i=0; i<elements.length; i++) {
            elements[i].classList.remove("right");
            elements[i].classList.remove("wrong");
        }
        for (let i=0; i<right.length; i++) {
            right[i].classList.add("right");
        }
        for (let i=0; i<wrong.length; i++) {
            wrong[i].classList.add("wrong");
        }
    },

    generate: async function(e, amount) {
        taskname = unique_id();

        const text = document.createElement("p");
        text.classList.add("text");

        const container = document.createElement("div");
        container.classList.add("container");
        container.ondrop = function(event){ gaptext.drop(event, taskname); };
        container.ondragover = function(event){ gaptext.allowDrop(event); };

        const check_button = document.createElement("button");
        check_button.onclick = function(event){ gaptext.check(event); };
        check_button.innerHTML = "Check";

        function createGap(solution) {
            const gap = document.createElement("div");
            gap.classList.add("gap");
            gap.dataset.solution = String(solution);
            gap.ondrop = function(event){ gaptext.drop(event, taskname); };
            gap.ondragover = function(event){ gaptext.allowDrop(event); };
            return gap;
        }

        function createLabel(id, name) {
            const label = document.createElement("p");
            label.classList.add(taskname);
            label.classList.add("label");
            label.setAttribute("draggable", true);
            label.id = id;
            label.ondragstart = function(event){ gaptext.drag(event); };
            label.innerHTML = name;
            return label;
        }

        function shuffle_childs(element) {
            let children = Array.from(element.children);
            children = choose_array(children, children.length);
            for(let i=0; i<children.length; i++){
                element.appendChild(children[i]);
            }
            return element;
        }

        const json_data = await load_json("gaptext.json");
        const content = choose_array(JSON.parse(json_data), amount);

        for( var i=0; i<content.length; i++ ) {
            let data = String(content[i][0]);
            const solution = unique_id();

            const gap = createGap(solution);
            data = data.split("§");
            const label = createLabel(solution, content[i][1]);
            text.appendChild(document.createTextNode(data[0]));
            text.appendChild(gap);
            text.appendChild(document.createTextNode(data[1]));
            text.appendChild(document.createElement("br"));
            container.appendChild(label);
        }

        e.appendChild(text);
        e.appendChild(shuffle_childs(container));
        e.appendChild(check_button);
    }
};
// gaptext.generateSentences(document.getElementById("test"), 2);


var multiplechoice = {
    check: function(e) {
        const choices = e.target.parentElement.getElementsByClassName("choice");
        right = [];
        wrong = [];
        for(let i=0; i<choices.length; i++) {
            if (choices[i].dataset.solution == String(choices[i].children[0].checked)) {
                right.push(choices[i]);
            } else {
                wrong.push(choices[i]);
            }
        }
        this.setFeedback(right, wrong);
    },

    setFeedback: function(right, wrong) {
        const elements = right.concat(wrong);
        for (let i=0; i<elements.length; i++) {
            elements[i].classList.remove("right");
            elements[i].classList.remove("wrong");
        }
        for (let i=0; i<right.length; i++) {
            right[i].classList.add("right");
        }
        for (let i=0; i<wrong.length; i++) {
            wrong[i].classList.add("wrong");
        }
    },

    generate: async function(e, amount) {
        const json_data = await load_json("multiplechoice.json");
        const content = choose_array(JSON.parse(json_data), amount);

        function createChoice(solution, name) {
            const choice = document.createElement("div");
            choice.classList.add("choice");
            choice.dataset.solution = solution;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            choice.appendChild(checkbox);

            const label = document.createElement("p");
            label.innerHTML = name;
            choice.appendChild(label);

            return choice;
        }

        for (var i=0; i<content.length; i++) {
            const container = document.createElement("div");
            container.classList.add("container");

            const question = document.createElement("p");
            question.innerHTML = content[i][0];
            question.classList.add("subsubtitle");
            container.appendChild(question);

            content[i][1] = choose_array(content[i][1], content[i][1].length);

            for (var j=0; j<content[i][1].length; j++) {
                const choice = createChoice(content[i][1][j][1], content[i][1][j][0]);
                container.appendChild(choice);
            }

            e.appendChild(container);
        }

        const checkbutton = document.createElement("button");
        checkbutton.innerHTML = "check";
        checkbutton.onclick = function(event) { multiplechoice.check(event) };
        e.appendChild(checkbutton);
    }
};

var conjugateverbs = {
    check: function(e) {

        function similarityIndex(word1, word2) {
            function normalizeFrench(word) {
                // Konvertiere in Kleinbuchstaben und entferne nicht alphabetische Zeichen
                return word.toLowerCase().replace(/[^a-zàáâäãåèéêëìíîïòóôöõùúûüçœæ]/g, "");
            }
            
            function frenchPhonetic(word) {
                // Behalte Akzente, aber wende phonetische Regeln an
                word = normalizeFrench(word);
            
                if (!word) return "";
            
                const phoneticRules = [
                    [/ph/g, "f"],   // ph -> f
                    [/gn/g, "n"],   // gn -> n
                    [/ch/g, "sh"],  // ch -> sh
                    [/cq|k|qu/g, "k"], // cq, k, qu -> k
                    [/g(?=[eiy])/g, "j"], // g vor e, i, y -> j
                    [/c(?=[eiy])/g, "s"], // c vor e, i, y -> s
                    [/t(?=ion)/g, "s"],   // t vor ion -> s
                ];
            
                phoneticRules.forEach(([pattern, replacement]) => {
                    word = word.replace(pattern, replacement);
                });
            
                word = word.replace(/(.)\1+/g, "$1"); // Entferne doppelte Buchstaben
            
                return word;
            }

            // Behalte Akzente in der phonetischen Kodierung
            const phonetic1 = frenchPhonetic(word1);
            const phonetic2 = frenchPhonetic(word2);
        
            const maxLength = Math.max(word1.length, word2.length);
            let matchCount = 0;
        
            // Zähle übereinstimmende Zeichen an denselben Positionen
            for (let i = 0; i < Math.min(phonetic1.length, phonetic2.length); i++) {
                if (phonetic1[i] === phonetic2[i]) {
                    matchCount++;
                }
            }
        
            // Index: Übereinstimmungen geteilt durch durchschnittliche Länge der Wörter
            const averageLength = (phonetic1.length + phonetic2.length) / 2;
            return (matchCount / averageLength).toFixed(2);
        }

        let right = [];
        let moderate = [];
        let wrong = [];
        const segments = e.target.parentElement.getElementsByClassName("segment");

        for(let i=0; i<segments.length; i++) {
            const equality = similarityIndex(segments[i].dataset.solution, String(segments[i].children[1].value));
            console.log(equality);
            if (equality == 1) {
                right.push(segments[i]);
            } else if (equality >= 0.85) {
                moderate.push(segments[i]);
            } else {
                wrong.push(segments[i]);
            }
        }
        this.setFeedback(right, moderate, wrong);
    },

    setFeedback: function(right, moderate, wrong) {
        const elements = right.concat(wrong);
        for (let i=0; i<elements.length; i++) {
            elements[i].classList.remove("right");
            elements[i].classList.remove("moderate");
            elements[i].classList.remove("wrong");
        }
        for (let i=0; i<right.length; i++) {
            right[i].classList.add("right");
        }
        for (let i=0; i<moderate.length; i++) {
            moderate[i].classList.add("moderate");
        }
        for (let i=0; i<wrong.length; i++) {
            wrong[i].classList.add("wrong");
        }
    },

    generate: async function(e, amount, settings) {
        const tense = settings[0];

        const json_data = await load_json("conjugateverbs.json");
        const content = choose_array(JSON.parse(json_data)[tense], amount);

        function createSegment(solution, text) {
            const choice = document.createElement("div");
            choice.classList.add("segment");
            choice.dataset.solution = solution;

            const label = document.createElement("p");
            label.innerHTML = text;
            choice.appendChild(label);

            const input = document.createElement("input");
            input.type = "text";
            choice.appendChild(input);

            return choice;
        }

        for (var i=0; i<content.length; i++) {
            const choice = createSegment(content[i][1], content[i][0]);
            e.appendChild(choice);
        }

        const checkbutton = document.createElement("button");
        checkbutton.innerHTML = "check";
        checkbutton.onclick = function(event) { conjugateverbs.check(event); };
        e.appendChild(checkbutton);
    }
};

var memory = {
    generate: async function(e, amount, settings) {
        const tense = settings[0];

        const json_data = await load_json("memory.json");
        const content = choose_array(JSON.parse(json_data)[tense], amount);

        const container = document.createElement("div");
        container.classList.add("container");
        
        function createCard(text, id) {
            const card = document.createElement("p");
            card.classList.add("card");
            card.dataset.id = id;
            card.onclick = function (event) { memory.check(event); };

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
        for (let i=0; i<content.length; i++) {
            const id = unique_id();

            for (let j=0; j < content[i].length; j++) {
                const card = createCard(content[i][j], id);
                cards.push(card);
            }
        }
        cards = choose_array(cards, cards.length);
        for (let i=0; i<cards.length; i++) {
            container.appendChild(cards[i]);
        }
        e.appendChild(container);
    },

    check: function(e) {
        const element = e.target.parentElement;

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