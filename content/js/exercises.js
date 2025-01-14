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
        console.error('Fehler:', error);
        throw error;
    }
}

const lueckentext = {
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
        if (e.target.parentElement.classList.contains("lueckentext")) {
            const gaps = e.target.parentElement.getElementsByClassName("gap");
            right = [];
            wrong = [];
            for(let i=0; i<gaps.length; i++) {
                if (gaps[i].children.length != 0) {
                    if (gaps[i].dataset.solution == gaps[i].children[0].id) {
                        right.push(gaps[i]);
                    } else {
                        wrong.push(gaps[i]);
                    }
                } else {
                    wrong.push(gaps[i]);
                }
            }
            this.setFeedback(right, wrong);
        }
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

    generateSentences: async function(e, amount) {
        taskname = unique_id();

        const text = document.createElement("p");
        text.classList.add('text');

        const container = document.createElement("div");
        container.classList.add('container');
        container.ondrop = function(event){ lueckentext.drop(event, taskname); };
        container.ondragover = function(event){ lueckentext.allowDrop(event); };

        const check_button = document.createElement('button');
        check_button.onclick = function(event){ lueckentext.check(event); };
        check_button.innerHTML = 'Check';

        function createGap(solution) {
            const gap = document.createElement("div");
            gap.classList.add('gap');
            gap.dataset.solution = String(solution);
            gap.ondrop = function(event){ lueckentext.drop(event, taskname); };
            gap.ondragover = function(event){ lueckentext.allowDrop(event); };
            return gap;
        }

        function createLabel(id, name) {
            const label = document.createElement("p");
            label.classList.add(taskname);
            label.setAttribute('draggable', true);
            label.id = id;
            label.ondragstart = function(event){ lueckentext.drag(event); };
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

        const json_data = await load_json('lueckentext.json');
        const content = choose_array(JSON.parse(json_data), amount);

        for( var i=0; i<content.length; i++ ) {
            let data = String(content[i][0]);
            const solution = unique_id();

            const gap = createGap(solution);
            data = data.split('§');
            const label = createLabel(solution, content[i][1]);
            text.appendChild(document.createTextNode(data[0]));
            text.appendChild(gap);
            text.appendChild(document.createTextNode(data[1]));
            text.appendChild(document.createElement('br'));
            container.appendChild(label);
        }

        e.appendChild(text);
        e.appendChild(shuffle_childs(container));
        e.appendChild(check_button);
    }
};
// lueckentext.generateSentences(document.getElementById('test'), 2);


const multiplechoice = {

};