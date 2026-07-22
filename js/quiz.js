let aktuelleFrage = 0;
let ausgewaehlteAntwort = null;
let punkte = 0;

let quizStart = new Date();

let maxPunkte = fragen.reduce(function(summe, frage) {

    return summe + frage.punkte;

}, 0);

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


    const endzeit = new Date();



    const { data: teilnehmer, error: abrufFehler } = await supabaseClient

    .from("Teilnehmer")

    .select("startzeit")

    .eq("id", teilnehmerID)

    .single();



    if (abrufFehler) {

        alert("Startzeit konnte nicht geladen werden.");

        return;

    }



    const dauer = endzeit - new Date(teilnehmer.startzeit + "Z");


    const minuten = Math.floor(dauer / 60000);

    const sekunden = Math.floor((dauer % 60000) / 1000);



    const { error } = await supabaseClient

    .from("Teilnehmer")

    .update({

        gesamtpunkte: punkte,

        endezeit: endzeit

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


    <h1>🎉 Quiz abgeschlossen</h1>


    <p class="subtitle">


    Vielen Dank für deine Teilnahme!


    <br><br>


    Dein Ergebnis:


    <br><br>


    <strong>${punkte}</strong>

    von

    <strong>${maxPunkte}</strong>

    Punkten


    <br><br><br>


    ⏱ Bearbeitungszeit:


    <br>


    <strong>${minuten} Minuten ${sekunden} Sekunden</strong>


    <br><br>


    <button onclick="window.location.href='rangliste.html?id=${teilnehmerID}'">

    🏆 Zur Rangliste

    </button>


    </p>


    `;


}





ladeFrage();