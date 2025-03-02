












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
            let index = (matchCount / averageLength).toFixed(2);

            if (index == 1 && word1 != word2) {
                index -= 0.1;
            }

            return index;
        }

        let right = [];
        let moderate = [];
        let wrong = [];
        const segments = e.currentTarget.parentElement.getElementsByClassName("segment");

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

    generate: async function(e, amount, tense) {
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

        const check_button = generateCheckButton(function(event) { conjugateverbs.check(event); });
        e.appendChild(check_button);
    }
};