let aktuelleFrage = 0;
let ausgewaehlteAntwort = null;
let punkte = 0;


const frageElement = document.getElementById("frage");
const antwortBereich = document.getElementById("antwortBereich");
const weiterButton = document.getElementById("weiterButton");

const frageNummer = document.getElementById("frageNummer");
const gesamtFragen = document.getElementById("gesamtFragen");
const fortschritt = document.getElementById("fortschritt");


gesamtFragen.innerText = fragen.length;



function ladeFrage() {


    ausgewaehlteAntwort = null;

    weiterButton.disabled = true;


    const frage = fragen[aktuelleFrage];


    frageElement.innerText = frage.frage;


    frageNummer.innerText = aktuelleFrage + 1;


    let prozent = (aktuelleFrage / fragen.length) * 100;

    fortschritt.style.width = prozent + "%";



    antwortBereich.innerHTML = "";



    // Multiple Choice

    if (frage.typ === "mc") {


        frage.antworten.forEach(function(antwort, index) {


            let element = document.createElement("div");


            element.className = "answer";


            element.innerText = antwort;



            element.onclick = function() {


                document.querySelectorAll(".answer").forEach(function(a) {

                    a.classList.remove("selected");

                });



                element.classList.add("selected");



                ausgewaehlteAntwort = index;



                weiterButton.disabled = false;


            };



            antwortBereich.appendChild(element);


        });


    }




    // Zahleneingabe

    if (frage.typ === "zahl") {


        let eingabe = document.createElement("input");


        eingabe.type = "number";


        eingabe.className = "answer";


        eingabe.placeholder = "Bitte Zahl eingeben";



        eingabe.oninput = function() {


            if (eingabe.value !== "") {


                ausgewaehlteAntwort = eingabe.value;


                weiterButton.disabled = false;


            }


        };



        antwortBereich.appendChild(eingabe);


    }


}






weiterButton.onclick = function() {


    if (ausgewaehlteAntwort === null) {

        return;

    }



    const frage = fragen[aktuelleFrage];



    // Punkteberechnung Multiple Choice

    if (frage.typ === "mc") {


        if (ausgewaehlteAntwort == frage.richtig) {


            punkte += frage.punkte;


        }


    }



    // Punkteberechnung Zahl

    if (frage.typ === "zahl") {


        if (Number(ausgewaehlteAntwort) === frage.loesung) {


            punkte += frage.punkte;


        }


    }



    aktuelleFrage++;



    if (aktuelleFrage >= fragen.length) {


        quizEnde();


        return;

    }



    ladeFrage();


};







function quizEnde() {


    document.querySelector(".container").innerHTML = `


        <h1>Geschafft!</h1>


        <p class="subtitle">


        Du hast


        <strong>${punkte}</strong>


        Punkte erreicht.


        </p>


    `;


}





ladeFrage();