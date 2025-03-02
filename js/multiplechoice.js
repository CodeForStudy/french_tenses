var multiplechoice = {
    check: function(e) {
        const choices = e.currentTarget.parentElement.getElementsByClassName("choice");
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

    generate: async function(e, amount, tense) {
        const json_data = await load_json("multiplechoice.json");
        const content = choose_array(JSON.parse(json_data)[tense], amount);

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

        const check_button = generateCheckButton(function(event) { multiplechoice.check(event) });

        e.appendChild(check_button);
    }
};