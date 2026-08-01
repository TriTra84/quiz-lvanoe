let aktuelleFrage = 0;
let ausgewaehlteAntwort = null;
let punkte = 0;

let fragen = [];
let maxPunkte = 0;

let teilnehmerID = localStorage.getItem("teilnehmer_id");



const frageElement = document.getElementById("frage");
const antwortBereich = document.getElementById("antwortBereich");
const weiterButton = document.getElementById("weiterButton");

const frageNummer = document.getElementById("frageNummer");
const gesamtFragen = document.getElementById("gesamtFragen");
const fortschritt = document.getElementById("fortschritt");



/* =========================================================
   FRAGEN LADEN
========================================================= */

async function ladeFragen() {

    const { data, error } = await supabaseClient

        .from("Fragen")

        .select("*")

        .order("id");


    if (error) {

        alert(
            "Fehler beim Laden der Fragen:\n\n" +
            error.message
        );

        return;

    }


    fragen = data || [];


    if (fragen.length === 0) {

        alert("Es wurden keine Fragen gefunden.");

        return;

    }


    maxPunkte = fragen.reduce(function(summe, frage) {

        return summe + Number(frage.punkte || 0);

    }, 0);


    gesamtFragen.innerText = fragen.length;


    ladeFrage();

}



/* =========================================================
   AKTUELLE FRAGE ANZEIGEN
========================================================= */

function ladeFrage() {

    ausgewaehlteAntwort = null;

    weiterButton.disabled = true;


    const frage = fragen[aktuelleFrage];


    frageElement.innerText = frage.frage;


    frageNummer.innerText =
        aktuelleFrage + 1;


    let prozent =
        (aktuelleFrage / fragen.length) * 100;


    fortschritt.style.width =
        prozent + "%";


    antwortBereich.innerHTML = "";



    /* -------------------------
       MULTIPLE CHOICE
    ------------------------- */

    if (frage.typ === "mc") {

        [

            frage.antwort_a,
            frage.antwort_b,
            frage.antwort_c,
            frage.antwort_d

        ].forEach(function(antwort, index) {


            /*
             * Leere Antwortmöglichkeiten
             * nicht anzeigen
             */

            if (
                antwort === null ||
                antwort === undefined ||
                antwort === ""
            ) {

                return;

            }


            let element =
                document.createElement("div");


            element.className =
                "answer";


            element.innerText =
                antwort;



            element.onclick = function() {


                document
                    .querySelectorAll(".answer")
                    .forEach(function(a) {

                        a.classList.remove("selected");

                    });


                element.classList.add("selected");


                ausgewaehlteAntwort =
                    index;


                weiterButton.disabled =
                    false;

            };


            antwortBereich.appendChild(element);

        });

    }



    /* -------------------------
       ZAHL / SCHÄTZFRAGE
    ------------------------- */

    if (frage.typ === "zahl") {


        let eingabe =
            document.createElement("input");


        eingabe.type =
            "text";


        eingabe.inputMode =
            "decimal";


        eingabe.className =
            "answer";


        eingabe.placeholder =
            "Bitte Zahl eingeben";



        eingabe.oninput = function() {


            if (
                eingabe.value.trim() !== ""
            ) {


                ausgewaehlteAntwort =
                    eingabe.value.replace(",", ".");


                weiterButton.disabled =
                    false;

            }

            else {

                ausgewaehlteAntwort =
                    null;

                weiterButton.disabled =
                    true;

            }

        };


        antwortBereich.appendChild(eingabe);

    }

}



/* =========================================================
   WEITER BUTTON
========================================================= */

weiterButton.onclick = async function() {


    if (
        ausgewaehlteAntwort === null
    ) {

        return;

    }


    const frage =
        fragen[aktuelleFrage];


    let erhaltenePunkte = 0;



    /* =====================================================
       MULTIPLE CHOICE
    ===================================================== */

    if (frage.typ === "mc") {


        if (
            ausgewaehlteAntwort ==
            frage.richtig
        ) {


            erhaltenePunkte =
                Number(frage.punkte);

        }

    }



    /* =====================================================
       SCHÄTZFRAGE
    ===================================================== */

    if (frage.typ === "zahl") {


        let antwort =
            Number(ausgewaehlteAntwort);


        let loesung =
            Number(frage.loesung);


        let toleranz =
            Number(frage.toleranz || 0);


        let abweichung =
            Math.abs(
                antwort - loesung
            );



        /*
         * Exakte Lösung
         */

        if (abweichung === 0) {


            erhaltenePunkte =
                Number(frage.punkte);

        }


        /*
         * Innerhalb der Toleranz
         */

        else if (
            toleranz > 0 &&
            abweichung <= toleranz
        ) {


            erhaltenePunkte =
                Math.round(

                    Number(frage.punkte) *

                    (
                        1 -
                        (
                            abweichung /
                            toleranz
                        )
                    )

                );


            /*
             * Mindestens 1 Punkt
             */

            if (
                erhaltenePunkte < 1
            ) {

                erhaltenePunkte = 1;

            }

        }


        /*
         * Außerhalb der Toleranz
         * = 0 Punkte
         */

        else {

            erhaltenePunkte = 0;

        }

    }



    /*
     * Punkte zum Gesamtergebnis addieren
     */

    punkte +=
        erhaltenePunkte;



    /* =====================================================
       ANTWORT IN SUPABASE SPEICHERN
    ===================================================== */

    const { error } =
        await supabaseClient

        .from("Antworten")

        .insert([

            {

                teilnehmer_id:
                    teilnehmerID,

                frage_nr:
                    aktuelleFrage + 1,

                antwort:
                    String(ausgewaehlteAntwort),

                punkte:
                    erhaltenePunkte

            }

        ]);



    if (error) {


        console.log(error);


        alert(
            "Antwort konnte nicht gespeichert werden:\n\n" +
            error.message
        );


        return;

    }



    /* =====================================================
       NÄCHSTE FRAGE
    ===================================================== */

    aktuelleFrage++;



    if (
        aktuelleFrage >=
        fragen.length
    ) {


        await quizEnde();


        return;

    }



    ladeFrage();

};



/* =========================================================
   QUIZ ENDE
========================================================= */

async function quizEnde() {


    const endzeit =
        new Date();



    const {

        data: teilnehmer,

        error: abrufFehler

    } = await supabaseClient

        .from("Teilnehmer")

        .select("startzeit")

        .eq("id", teilnehmerID)

        .single();



    if (abrufFehler) {


        alert(
            "Startzeit konnte nicht geladen werden."
        );


        return;

    }



    const dauer =
        endzeit -
        new Date(
            teilnehmer.startzeit + "Z"
        );



    const minuten =
        Math.floor(
            dauer / 60000
        );


    const sekunden =
        Math.floor(
            (dauer % 60000) / 1000
        );



    /* =====================================================
       ERGEBNIS SPEICHERN
    ===================================================== */

    const { error } =
        await supabaseClient

        .from("Teilnehmer")

        .update({

            gesamtpunkte:
                punkte,

            endezeit:
                endzeit

        })

        .eq("id", teilnehmerID);



    if (error) {


        alert(
            "Fehler beim Speichern:\n\n" +
            error.message
        );


        return;

    }



    /* =====================================================
       ERGEBNISSEITE
    ===================================================== */

    document.querySelector(
        ".container"
    ).innerHTML = `

        <h1>🎉 Quiz abgeschlossen</h1>


        <div class="subtitle">

            <p>
                Vielen Dank für deine Teilnahme!
            </p>


            <p>
                Dein Ergebnis:
            </p>


            <p>

                <strong>
                    ${punkte}
                </strong>

                von

                <strong>
                    ${maxPunkte}
                </strong>

                Punkten

            </p>


            <p>

                ⏱ Bearbeitungszeit:

                <br>

                <strong>

                    ${minuten} Minuten
                    ${sekunden} Sekunden

                </strong>

            </p>

        </div>



        <div id="umfragenBereich">

            Umfrage wird geladen...

        </div>



        <br>



        <button
            id="ranglistenButton"
            style="display:none;"
            onclick="window.location.href='rangliste.html?id=${teilnehmerID}'"
        >

            🏆 Zur Rangliste

        </button>

    `;



    /*
     * Jetzt Umfragen laden
     */

    await ladeUmfragen();

}



/* =========================================================
   UMFRAGEN LADEN
========================================================= */

async function ladeUmfragen() {


    const bereich =
        document.getElementById(
            "umfragenBereich"
        );


    if (!bereich) {

        return;

    }



    const {

        data,
        error

    } = await supabaseClient

        .from("Umfragen")

        .select("*")

        .eq("aktiv", true)

        .order("reihenfolge");



    if (error) {


        console.log(
            "Umfrage Fehler:",
            error
        );


        bereich.innerHTML = `

            <p>
                Umfrage konnte nicht geladen werden.
            </p>

        `;


        return;

    }



    /*
     * Keine aktiven Umfragen
     */

    if (
        !data ||
        data.length === 0
    ) {


        bereich.innerHTML = "";

        return;

    }



    let html = "";


    html += `

        <hr style="margin:35px 0;">

        <h2>📝 Deine Rückmeldung</h2>

        <p>
            Wie hat dir das Quiz gefallen?
        </p>

    `;



    data.forEach(function(umfrage) {


        html += `

            <div class="statBlock">

                <h3>
                    ${umfrage.frage}
                </h3>

        `;



        /*
         * Sterne-Frage
         */

        if (
            umfrage.typ === "sterne"
        ) {


            html += `

                <div class="umfrageSterne">

                    <button
                        onclick="speichereUmfrage(${umfrage.id}, 1, this)"
                    >
                        ⭐
                    </button>


                    <button
                        onclick="speichereUmfrage(${umfrage.id}, 2, this)"
                    >
                        ⭐⭐
                    </button>


                    <button
                        onclick="speichereUmfrage(${umfrage.id}, 3, this)"
                    >
                        ⭐⭐⭐
                    </button>


                    <button
                        onclick="speichereUmfrage(${umfrage.id}, 4, this)"
                    >
                        ⭐⭐⭐⭐
                    </button>


                    <button
                        onclick="speichereUmfrage(${umfrage.id}, 5, this)"
                    >
                        ⭐⭐⭐⭐⭐
                    </button>

                </div>

            `;

        }



        html += `

            </div>

        `;

    });



    bereich.innerHTML =
        html;

}



/* =========================================================
   UMFRAGE ANTWORT SPEICHERN
========================================================= */

async function speichereUmfrage(
    frageID,
    antwort,
    button
) {


    const { error } =
        await supabaseClient

        .from("Bewertungen")

        .insert([

            {

                teilnehmer_id:
                    teilnehmerID,

                frage:
                    String(frageID),

                antwort:
                    String(antwort)

            }

        ]);



    if (error) {


        console.log(error);


        alert(

            "Antwort konnte nicht gespeichert werden:\n\n" +
            error.message

        );


        return;

    }



    /*
     * Buttons deaktivieren
     */

    button.parentElement
        .querySelectorAll("button")
        .forEach(function(b) {

            b.disabled = true;

        });



    /*
     * Danke anzeigen
     */

    button.parentElement
        .parentElement
        .insertAdjacentHTML(

            "beforeend",

            "<p>Danke für deine Rückmeldung! 👍</p>"

        );

}



/* =========================================================
   START
========================================================= */

ladeFragen();