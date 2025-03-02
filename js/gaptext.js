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
        if (e.target.parentElement.classList.contains("container")) {
            e.target.parentElement.appendChild(data);
        }
    },

    touch_dataTransfer: undefined,

    touch_select: function(e) {
        const elements = document.getElementsByClassName("selected");
        for (let i=0; i<elements.length; i++) {
            elements[i].classList.remove("selected");
        }

        e.currentTarget.classList.add("selected");
        gaptext.touch_dataTransfer = e.target;
    },

    touch_paste: function(e, tag) {
        const data = this.touch_dataTransfer;
        if (data.classList.contains(tag) && ((e.currentTarget.classList.contains("gap") && e.currentTarget.innerHTML == "") || e.currentTarget.classList.contains("container")) && data.parentElement != e.currentTarget) {
            e.currentTarget.appendChild(data);
            data.classList.remove("selected");
            gaptext.touch_dataTransfer = undefined;
        }
        if (data.classList.contains(tag) && e.currentTarget.parentElement.classList.contains("container") && data.parentElement != e.currentTarget.parentElement) {
            e.currentTarget.parentElement.appendChild(data);
            data.classList.remove("selected");
            gaptext.touch_dataTransfer = undefined;
        }
        
    },

    check: function(e) {
        const gaps = e.currentTarget.parentElement.getElementsByClassName("gap");
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

    generate: async function(e, amount, tense) {
        taskname = unique_id();

        const text = document.createElement("p");
        text.classList.add("text");

        const container = document.createElement("div");
        container.classList.add("container");
        container.ondrop = function(event){ gaptext.drop(event, taskname); };
        container.ontouchend = function(event){ gaptext.touch_paste(event, taskname); };
        container.ondragover = function(event){ gaptext.allowDrop(event); };

        const check_button = generateCheckButton(function(event){ gaptext.check(event); });

        function createGap(solution) {
            const gap = document.createElement("div");
            gap.classList.add("gap");
            gap.dataset.solution = String(solution);
            gap.ondrop = function(event){ gaptext.drop(event, taskname); };
            gap.ontouchend = function(event){ gaptext.touch_paste(event, taskname); };
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
            label.ontouchend = function(event){ gaptext.touch_select(event); };
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
        const content = choose_array(JSON.parse(json_data)[tense], amount);

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
