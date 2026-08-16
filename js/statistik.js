async function ladeStatistik() {


    const { data, error } = await supabaseClient

        .from("Teilnehmer")

        .select("gesamtpunkte, startzeit, endezeit")

        .not("gesamtpunkte", "is", null)

        .not("endezeit", "is", null);



    if (error) {

        alert(
            "Fehler:\n\n" +
            JSON.stringify(error, null, 2)
        );

        return;

    }



    const anzahl = data.length;


    let punkteSumme = 0;
    let bestePunkte = 0;
    let schlechtestePunkte = null;

    let zeitSumme = 0;



    data.forEach(function(teilnehmer) {



        punkteSumme += teilnehmer.gesamtpunkte;



        if (teilnehmer.gesamtpunkte > bestePunkte) {

            bestePunkte = teilnehmer.gesamtpunkte;

        }



        if (
            schlechtestePunkte === null ||
            teilnehmer.gesamtpunkte < schlechtestePunkte
        ) {

            schlechtestePunkte = teilnehmer.gesamtpunkte;

        }



        let start = new Date(teilnehmer.startzeit + "Z");

        let ende = new Date(teilnehmer.endezeit);


        zeitSumme += ende - start;



    });



    let durchschnittPunkte = 0;

    let durchschnittZeit = 0;



    if (anzahl > 0) {

        durchschnittPunkte =
            (punkteSumme / anzahl).toFixed(1);



        durchschnittZeit =
            Math.floor(
                (zeitSumme / anzahl) / 1000
            );

    }



    let minuten = Math.floor(durchschnittZeit / 60);

    let sekunden = durchschnittZeit % 60;



    document.getElementById("teilnehmer").innerText =
        anzahl;


    document.getElementById("durchschnittPunkte").innerText =
        durchschnittPunkte;


    document.getElementById("bestePunkte").innerText =
        bestePunkte;


    document.getElementById("schlechtestePunkte").innerText =
        schlechtestePunkte;


    document.getElementById("durchschnittZeit").innerText =
        minuten +
        ":" +
        sekunden.toString().padStart(2, "0")
        +
        " Minuten";



    ladeFragenAnalyse();
    ladeDienststellenAnalyse();


}




async function ladeDienststellenAnalyse() {


    const { data, error } = await supabaseClient

        .from("Teilnehmer")

        .select("dienststelle, gesamtpunkte")

        .not("gesamtpunkte", "is", null);



    if (error) {

        alert(
            "Fehler Dienststellen:\n\n" +
            error.message
        );

        return;

    }



    let dienststellen = {};



    data.forEach(function(t) {



        if (!dienststellen[t.dienststelle]) {


            dienststellen[t.dienststelle] = {

                anzahl: 0,
                punkte: 0,
                beste: 0

            };


        }



        dienststellen[t.dienststelle].anzahl++;


        dienststellen[t.dienststelle].punkte +=
            t.gesamtpunkte;



        if (
            t.gesamtpunkte >
            dienststellen[t.dienststelle].beste
        ) {

            dienststellen[t.dienststelle].beste =
                t.gesamtpunkte;

        }



    });




    let liste =
        Object.keys(dienststellen);



    liste.sort(function(a, b) {


        let durchschnittA =
            dienststellen[a].punkte /
            dienststellen[a].anzahl;


        let durchschnittB =
            dienststellen[b].punkte /
            dienststellen[b].anzahl;



        return durchschnittB - durchschnittA;


    });




    let text = "";



    liste.forEach(function(name, index) {



        let d =
            dienststellen[name];



        let platz = "";



        if (index === 0) {

            platz = "🥇 ";

        }

        else if (index === 1) {

            platz = "🥈 ";

        }

        else if (index === 2) {

            platz = "🥉 ";

        }



        text +=


        "<div class='statBlock'>" +


        "<h3>" +

        platz +

        "🏢 " +

        name +

        "</h3>" +


        "Teilnehmer: " +

        d.anzahl +


        "<br>Ø Punkte: " +

        (
            d.punkte /
            d.anzahl
        )
        .toFixed(1) +


        "<br>Beste Punkte: " +

        d.beste +


        "</div>";



    });




    document.getElementById(
        "dienststellenAnalyse"
    ).innerHTML = text;



}



async function ladeFragenAnalyse() {



    const { data, error } = await supabaseClient

        .from("Antworten")

        .select("frage_nr, antwort, teilnehmer_id");



    if (error) {

        alert(
            "Fehler Antworten:\n\n" +
            JSON.stringify(error, null, 2)
        );

        return;

    }

if (data.length === 0) {


    return;

}


    const { data: teilnehmerDaten } = await supabaseClient

        .from("Teilnehmer")

        .select("id, name");


const { data: fragenDaten } = await supabaseClient

    .from("Fragen")

    .select("*")

    .order("id");


    const bereich =
        document.getElementById("fragenAnalyse");



    bereich.innerHTML = "";





    fragenDaten.forEach(function(frage, index) {



        let antworten = data.filter(function(a) {


            return Number(a.frage_nr) === Number(index + 1);


        });




        let text = "";





        if (frage.typ === "mc") {



            let zaehlung = {};



            antworten.forEach(function(a) {



                if (!zaehlung[a.antwort]) {

                    zaehlung[a.antwort] = 0;

                }


                zaehlung[a.antwort]++;



            });





            text +=
                "<p><strong>Antwortverteilung:</strong><br>";





            [
    frage.antwort_a,
    frage.antwort_b,
    frage.antwort_c,
    frage.antwort_d
].forEach(function(a, i) {



                let anzahlAntwort =
                    zaehlung[i] || 0;



                text +=
    "<div class='antwortZeile'>" +
    "<span>" + a + "</span>" +
    "<strong>" + anzahlAntwort + "</strong>" +
    "</div>";



            });





            let richtig =
                antworten.filter(function(a) {



                    return Number(a.antwort) === frage.richtig;



                }).length;





            let prozent = 0;



            if (antworten.length > 0) {


                prozent =
                    (
                        (richtig / antworten.length)
                        *
                        100
                    )
                    .toFixed(1);



            }





            text +=
                "<br>Richtig: " +
                richtig +
                " von " +
                antworten.length +
                " (" +
                prozent +
                "%)</p>";





        }







        if (frage.typ === "zahl") {



            let summe = 0;

            let beste = null;

            let besteNamen = [];

            let kleinsteAbweichung = null;





            antworten.forEach(function(a) {



                let wert =
                    Number(a.antwort);



                summe += wert;




                let diff =
                    Math.abs(
                        wert - frage.loesung
                    );





                if (
                    kleinsteAbweichung === null ||
                    diff < kleinsteAbweichung
                ) {



                    kleinsteAbweichung = diff;


                    beste = wert;

besteNamen = [];


                    let person =
                        teilnehmerDaten.find(function(t) {


                            return t.id === a.teilnehmer_id;


                        });




                    if (person) {

                        besteNamen.push(person.name);

                    }



                }

else if (diff === kleinsteAbweichung) {


    let person =
        teilnehmerDaten.find(function(t) {

            return t.id === a.teilnehmer_id;

        });


    if (person) {

        besteNamen.push(person.name);

    }


}

            });






            let durchschnitt = 0;



            if (antworten.length > 0) {



                durchschnitt =
                    (
                        summe /
                        antworten.length
                    )
                    .toFixed(1);



            }





let besteAbweichung = Number(
    Math.abs(beste - frage.loesung).toFixed(1)
);

text +=

    "<p>" +

    "🎯 Richtige Lösung: " +
    frage.loesung +

    "<br><br>" +

    "📊 Durchschnitt: " +
    durchschnitt +

    "<br><br>" +

    "🏅 Beste Schätzung: " +
    besteNamen.join(", ") +

    (
        besteAbweichung === 0
        ?
        " (" + beste + ")"
        :
        " (±" + besteAbweichung + ")"
    )

    +

    "</p>";





        }






let block =
    document.createElement("div");


block.className = "statBlock";


block.innerHTML =

    "<h3>Frage " +
    (index + 1) +
    "</h3>" +

    "<p><strong>" +
    frage.frage +
    "</strong></p>" +

    text;



bereich.appendChild(block);





    });





}



async function ladeUmfragenAnalyse() {

    const { data, error } =
        await supabaseClient

            .from("Bewertungen")

            .select("frage, antwort");


    const { data: umfragen } =
        await supabaseClient

            .from("Umfragen")

            .select("id, frage, typ");


    if (error) {

        console.log(error);

        return;

    }


    let gruppen = {};


    data.forEach(function(a) {

        if (!gruppen[a.frage]) {

            gruppen[a.frage] = [];

        }

        gruppen[a.frage].push(
            Number(a.antwort)
        );

    });


    let text = "";


    Object.keys(gruppen).forEach(function(frage) {

        let antworten =
            gruppen[frage];


        let summe =
            antworten.reduce(
                function(a, b) {
                    return a + b;
                },
                0
            );


        let durchschnitt =
            (
                summe /
                antworten.length
            ).toFixed(1);


        let umfrage =
            umfragen.find(function(u) {

                return Number(u.id) ===
                    Number(frage);

            });


        /*
         * Nur Sternefragen anzeigen
         */

        if (
            !umfrage ||
            umfrage.typ !== "sterne"
        ) {

            return;

        }


        let titel =
            umfrage.frage;


        text +=

            "<div class='statBlock'>" +

            "<h3>" +
            titel +
            "</h3>" +

            "⭐ " +
            durchschnitt +

            " (" +
            antworten.length +
            " Bewertungen)" +

            "</div>";

    });


    document.getElementById(
        "umfragenAnalyse"
    ).innerHTML = text;

}


/* =========================================================
   KOMMENTARE
========================================================= */

async function ladeKommentareAnalyse() {

    const bereich =
        document.getElementById(
            "kommentareAnalyse"
        );


    const { data, error } =
        await supabaseClient

            .from("Bewertungen")

            .select("id, frage, antwort")

            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.log(
            "Fehler Kommentare:",
            error
        );


        bereich.innerHTML =
            "<p>Fehler beim Laden der Kommentare.</p>";

        return;

    }


    const { data: umfragen } =
        await supabaseClient

            .from("Umfragen")

            .select(
                "id, frage, typ"
            );


    /*
     * Kommentare nach Frage gruppieren
     */

    let gruppen = {};


    data.forEach(function(a) {

        let umfrage =
            umfragen.find(function(u) {

                return Number(u.id) ===
                    Number(a.frage);

            });


        /*
         * Nur Textfragen berücksichtigen
         */

        if (
            !umfrage ||
            umfrage.typ !== "text"
        ) {

            return;

        }


        if (!gruppen[a.frage]) {

            gruppen[a.frage] = {

                frage:
                    umfrage.frage,

                antworten: []

            };

        }


        gruppen[a.frage].antworten.push(
            a.antwort
        );

    });


    let text = "";


    /*
     * Eine Kachel pro Frage
     */

    Object.keys(gruppen).forEach(
        function(frageID) {

            let gruppe =
                gruppen[frageID];


            text +=

                "<div class='statBlock'>" +

                "<h3>💬 " +
                gruppe.frage +
                "</h3>" +

                "<div>";


            /*
             * Antworten untereinander anzeigen
             */

            gruppe.antworten.forEach(
                function(antwort) {

                    text +=

                        "<p style='margin:12px 0;padding:10px;background:#fff;border-radius:8px;border:1px solid #ddd;'>" +

                        "💬 " +
                        antwort +

                        "</p>";

                }
            );


            text +=

                "</div>" +

                "</div>";

        }
    );


    if (text === "") {

        text =
            "<p>Noch keine Kommentare vorhanden.</p>";

    }


    bereich.innerHTML =
        text;

}


/* =========================================================
   ABSTIMMUNGSAUSWERTUNG
========================================================= */

async function ladeAbstimmungenAnalyse() {

    const bereich =
        document.getElementById(
            "abstimmungenAnalyse"
        );


    const { data, error } =
        await supabaseClient

            .from("Bewertungen")

            .select("frage, antwort");


    if (error) {

        console.log(
            "Fehler Abstimmungen:",
            error
        );


        bereich.innerHTML =
            "<p>Abstimmungen konnten nicht geladen werden.</p>";

        return;

    }


    const { data: umfragen } =
        await supabaseClient

            .from("Umfragen")

            .select(
                "id, frage, typ"
            );


    /*
     * Nur Abstimmungen berücksichtigen
     */

    const abstimmungen =
        umfragen.filter(function(umfrage) {

            return umfrage.typ ===
                "abstimmung";

        });


    let text = "";


    abstimmungen.forEach(
        function(umfrage) {

            /*
             * Antworten dieser Abstimmung
             */

            const antworten =
                data.filter(function(a) {

                    return Number(a.frage) ===
                        Number(umfrage.id);

                });


            /*
             * Keine Antworten
             */

            if (
                antworten.length === 0
            ) {

                text +=

                    "<div class='statBlock'>" +

                    "<h3>🗳️ " +
                    umfrage.frage +
                    "</h3>" +

                    "<p>Noch keine Stimmen vorhanden.</p>" +

                    "</div>";

                return;

            }


            /*
             * Stimmen nach Antwort zählen
             */

            let stimmen = {};


            antworten.forEach(
                function(a) {

                    if (!stimmen[a.antwort]) {

                        stimmen[a.antwort] = 0;

                    }


                    stimmen[a.antwort]++;

                }
            );


            text +=

                "<div class='statBlock'>" +

                "<h3>🗳️ " +
                umfrage.frage +
                "</h3>";


            /*
             * Antworten anzeigen
             */

            Object.keys(stimmen).forEach(
                function(antwort) {

                    const anzahl =
                        stimmen[antwort];


                    const prozent =
                        (
                            anzahl /
                            antworten.length *
                            100
                        ).toFixed(1);


text +=

    "<div style='margin:15px 0;'>" +

        "<div style='display:flex;justify-content:space-between;margin-bottom:5px;'>" +

            "<strong>" +
            antwort +
            "</strong>" +

            "<span>" +
            anzahl +
            " Stimmen (" +
            prozent +
            "%)" +
            "</span>" +

        "</div>" +

        "<div style='width:100%;height:18px;background:#e1e6eb;border-radius:10px;overflow:hidden;'>" +

            "<div style='width:" +
            prozent +
            "%;height:100%;background:#005baa;border-radius:10px;'>" +

            "</div>" +

        "</div>" +

    "</div>";

                }
            );


            text +=

                "<p>" +

                "<strong>" +
                antworten.length +
                " Stimmen insgesamt</strong>" +

                "</p>" +

                "</div>";

        }
    );


    if (text === "") {

        text =
            "<p>Keine Abstimmungen vorhanden.</p>";

    }


    bereich.innerHTML =
        text;

}

/* =========================================================
   START
========================================================= */

ladeDienststellenAnalyse();

ladeStatistik();

ladeUmfragenAnalyse();

ladeKommentareAnalyse();

ladeAbstimmungenAnalyse();