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





let besteAbweichung = Math.abs(beste - frage.loesung);


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






ladeDienststellenAnalyse();

ladeStatistik();