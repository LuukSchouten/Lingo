
var main = document.getElementById("main");

if (!main) {
    throw new Error('Element #main niet gevonden.');
}

var maxPogingen = 5;
var pogingen = 0;
var gameOver = false;
var Randomwoord = "";
var rijen = [];
var nederlandsWoordenboek = new Set();
var spelBezig = false;

// OpenTaal woordenlijst rechtstreeks laden
var woordenboekURL =
    "https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt";

// Interface opbouwen
main.innerHTML = "";

var titel = document.createElement("h1");
titel.innerText = "LINGO";
main.appendChild(titel);

var uitleg = document.createElement("p");
uitleg.innerText = "Raad het Nederlandse woord van 5 letters!";
main.appendChild(uitleg);

var input = document.createElement("input");
input.id = "input";
input.type = "text";
input.maxLength = 5;
input.placeholder = "Typ je woord...";
input.autocomplete = "off";
input.disabled = true;
main.appendChild(input);

var button = document.createElement("button");
button.innerText = "Woordenboek laden...";
button.disabled = true;
main.appendChild(button);

var feedback = document.createElement("p");
feedback.innerText = "Nederlands woordenboek wordt geladen...";
main.appendChild(feedback);

var layers = document.createElement("div");
layers.id = "layers";
main.appendChild(layers);

// Maak een lege rij met vijf vakjes
function maakRij() {
    var rij = document.createElement("div");
    rij.className = "rij";

    var vakjes = [];

    for (var i = 0; i < 5; i++) {
        var square = document.createElement("div");
        square.className = "squares";

        var letter = document.createElement("p");
        letter.className = "letters";
        letter.innerText = "";

        square.appendChild(letter);
        rij.appendChild(square);

        vakjes.push({
            square: square,
            letter: letter
        });
    }

    layers.appendChild(rij);
    return vakjes;
}

// Controleer letters, inclusief dubbele letters
function controleerWoord(gok) {
    var doel = Randomwoord.split("");
    var invoer = gok.split("");
    var kleuren = Array(5).fill("red");

    // Eerst exacte overeenkomsten
    for (var i = 0; i < 5; i++) {
        if (invoer[i] === doel[i]) {
            kleuren[i] = "green";
            doel[i] = null;
            invoer[i] = null;
        }
    }

    // Daarna letters op een verkeerde positie
    for (var i = 0; i < 5; i++) {
        if (invoer[i] === null) continue;

        var index = doel.indexOf(invoer[i]);

        if (index !== -1) {
            kleuren[i] = "orange";
            doel[index] = null;
        }
    }

    return kleuren;
}

// Laat de letters één voor één verschijnen
function toonLetters(rij, gok, kleuren) {
    for (let i = 0; i < 5; i++) {
        setTimeout(function () {
            rij[i].letter.innerText = gok[i].toUpperCase();
            rij[i].square.style.backgroundColor = kleuren[i];
        }, i * 250);
    }
}

// Start een nieuw spel
function startSpel() {
    pogingen = 0;
    gameOver = false;
    spelBezig = false;
    rijen = [];

    // Kies een willekeurig vijfletterwoord uit OpenTaal
    var woorden = Array.from(nederlandsWoordenboek);

    Randomwoord = woorden[
        Math.floor(Math.random() * woorden.length)
    ];

    layers.innerHTML = "";

    for (var i = 0; i < maxPogingen; i++) {
        rijen.push(maakRij());
    }

    input.value = "";
    input.disabled = false;
    button.disabled = false;
    button.innerText = "Check woord";

    feedback.innerText =
        "Poging 1 van " + maxPogingen;

    button.onclick = checkWoord;
    input.focus();

    console.log("Geheim woord:", Randomwoord);
}

// Controleer het ingevulde woord
function checkWoord() {
    if (gameOver || spelBezig) return;

    var gok = input.value.trim().toLowerCase();

    if (!/^[a-z]{5}$/.test(gok)) {
        feedback.innerText =
            "Vul een woord van precies 5 letters in!";
        return;
    }

    // Controleer het externe Nederlandse woordenboek
    if (!nederlandsWoordenboek.has(gok)) {
        feedback.innerText =
            "Dat woord staat niet in het Nederlandse woordenboek!";
        return;
    }

    var rij = rijen[pogingen];
    var kleuren = controleerWoord(gok);

    spelBezig = true;
    input.disabled = true;
    button.disabled = true;

    toonLetters(rij, gok, kleuren);

    // Wacht tot de animatie afgelopen is
    setTimeout(function () {
        pogingen++;
        spelBezig = false;

        if (gok === Randomwoord) {
            feedback.innerText =
                "LINGO! Goed gedaan! Geraden in " +
                pogingen + " poging(en)! 🎉";

            eindigSpel();
            return;
        }

        if (pogingen >= maxPogingen) {
            feedback.innerText =
                "Game over! Het woord was " +
                Randomwoord.toUpperCase();

            eindigSpel();
            return;
        }

        feedback.innerText =
            "Probeer opnieuw! Poging " +
            (pogingen + 1) + " van " + maxPogingen;

        input.disabled = false;
        button.disabled = false;
        input.focus();

    }, 5 * 250);
}

// Einde van het spel
function eindigSpel() {
    gameOver = true;
    spelBezig = false;

    input.disabled = true;
    button.disabled = false;
    button.innerText = "Opnieuw spelen";

    button.onclick = startSpel;
}

// Enter om het woord in te dienen
input.addEventListener("keydown", function(event) {
    if (
        event.key === "Enter" &&
        !gameOver &&
        !spelBezig
    ) {
        checkWoord();
    }
});

// Laad OpenTaal en filter uitsluitend vijfletterwoorden
fetch(woordenboekURL)
    .then(function(response) {
        if (!response.ok) {
            throw new Error(
                "Woordenboek laden mislukt: " + response.status
            );
        }

        return response.text();
    })
    .then(function(tekst) {
        tekst.split(/\r?\n/).forEach(function(woord) {
            woord = woord.trim().toLowerCase();

            // Alleen woorden met precies vijf letters a-z
            if (/^[a-z]{5}$/.test(woord)) {
                nederlandsWoordenboek.add(woord);
            }
        });

        if (nederlandsWoordenboek.size === 0) {
            throw new Error("Geen vijfletterwoorden gevonden.");
        }

        feedback.innerText =
            nederlandsWoordenboek.size +
            " vijfletterwoorden geladen! Veel succes!";

        startSpel();
    })
    .catch(function(error) {
        console.error("Fout bij laden woordenboek:", error);

        feedback.innerText =
            "Woordenboek laden mislukt. Controleer je internetverbinding.";

        button.disabled = true;
        input.disabled = true;
    });