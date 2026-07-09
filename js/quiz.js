let aktuelleFrage = 0;
let ausgewaehlteAntwort = null;
let punkte = 0;

let teilnehmerID = localStorage.getItem("teilnehmer_id");


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





weiterButton.onclick = async function() {


    if (ausgewaehlteAntwort === null) {

        return;

    }



    const frage = fragen[aktuelleFrage];


    let erhaltenePunkte = 0;



    if (frage.typ === "mc") {


        if (ausgewaehlteAntwort == frage.richtig) {


            punkte += frage.punkte;

            erhaltenePunkte = frage.punkte;


        }


    }



    if (frage.typ === "zahl") {


        if (Number(ausgewaehlteAntwort) === frage.loesung) {


            punkte += frage.punkte;

            erhaltenePunkte = frage.punkte;


        }


    }



    // Antwort in Supabase speichern

    const { error } = await supabaseClient

    .from("Antworten")

    .insert([

        {

            teilnehmer_id: teilnehmerID,

            frage_nr: aktuelleFrage + 1,

            antwort: String(ausgewaehlteAntwort),

            punkte: erhaltenePunkte

        }

    ]);



    if(error) {

        console.log(error);

        alert("Antwort konnte nicht gespeichert werden.");

        return;

    }



    aktuelleFrage++;



    if (aktuelleFrage >= fragen.length) {


        quizEnde();


        return;

    }



    ladeFrage();


};







async function quizEnde() {


    const { error } = await supabaseClient

    .from("Teilnehmer")

    .update({

        gesamtpunkte: punkte,

        endezeit: new Date()

    })

    .eq("id", teilnehmerID);



if(error) {

    alert(
        "Fehler beim Speichern:\n\n" 
        + error.message
    );

    return;

}



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