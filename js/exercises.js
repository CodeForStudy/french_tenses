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
        // Pfad zu den JSON-Dateien repariert
        const response = await fetch(`../../json/${path}`);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der JSON-Datei: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Fehler:", error);
        throw error;
    }
}

function load_exercise(classname, amount) {
    const elements = document.getElementsByClassName(classname);
    const tense = document.getElementById("toolbar").getElementsByTagName("select")[0].value;
    for( let i=0; i<elements.length; i++) {
        elements[i].innerHTML = "";
        window[classname].generate(elements[i], amount, tense);
    }
}

function generateCheckButton(func) {
    const check_button = document.createElement("button");
    check_button.onclick = function(event){ func(event); };
    check_button.classList.add("check");
    check_button.innerHTML = "Überprüfen";
    return check_button;
}