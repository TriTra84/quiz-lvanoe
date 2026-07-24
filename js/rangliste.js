const tabelle = document.querySelector("#rangliste tbody");


const urlParameter = new URLSearchParams(window.location.search);

const eigeneTeilnehmerID = urlParameter.get("id");



async function ladeRangliste() {


    const { data, error } = await supabaseClient

        .from("Teilnehmer")

        .select("id, name, dienststelle, gesamtpunkte, startzeit, endezeit")

        .not("gesamtpunkte", "is", null)

        .not("endezeit", "is", null);



    if (error) {

        alert(
            "Fehler:\n\n" +
            JSON.stringify(error, null, 2)
        );

        return;

    }



    data.sort(function(a, b) {


        if (b.gesamtpunkte !== a.gesamtpunkte) {

            return b.gesamtpunkte - a.gesamtpunkte;

        }


        let zeitA = new Date(a.endezeit) - new Date(a.startzeit);

        let zeitB = new Date(b.endezeit) - new Date(b.startzeit);


        return zeitA - zeitB;


    });



    document.querySelector("#anzahlTeilnehmer").textContent = data.length;

    tabelle.innerHTML = "";



    let letzterPunktestand = null;
    let letzteZeit = null;
    let platz = 0;



    data.forEach(function(teilnehmer, index) {


        let dauerSekunden = 0;


        if (teilnehmer.startzeit && teilnehmer.endezeit) {

            dauerSekunden = Math.floor(
                (new Date(teilnehmer.endezeit) -
                new Date(teilnehmer.startzeit + "Z")) / 1000
            );

        }



        if (
            teilnehmer.gesamtpunkte !== letzterPunktestand ||
            dauerSekunden !== letzteZeit
        ) {

            platz++;

        }



        letzterPunktestand = teilnehmer.gesamtpunkte;
        letzteZeit = dauerSekunden;



        let dauer = "";


        if (teilnehmer.startzeit && teilnehmer.endezeit) {


            let start = new Date(teilnehmer.startzeit + "Z");

            let ende = new Date(teilnehmer.endezeit);


            let sekunden = Math.floor(
                (ende - start) / 1000
            );


            let minuten = Math.floor(sekunden / 60);

            sekunden = sekunden % 60;


            dauer = minuten + ":" + sekunden.toString().padStart(2, "0");


        }



        let zeile = document.createElement("tr");



        if (index === 0) {

            zeile.classList.add("platz1");

        }

        else if (index === 1) {

            zeile.classList.add("platz2");

        }

        else if (index === 2) {

            zeile.classList.add("platz3");

        }



        let nameAnzeige = teilnehmer.name;



        if (String(teilnehmer.id) === String(eigeneTeilnehmerID)) {

            nameAnzeige = "⭐ " + nameAnzeige;

        }



        zeile.innerHTML = `

            <td>${platz}</td>

            <td>${nameAnzeige}</td>

            <td>${teilnehmer.dienststelle}</td>

            <td>${teilnehmer.gesamtpunkte}</td>

            <td>${dauer}</td>

        `;



        tabelle.appendChild(zeile);



    });


}

async function ladeDienststellenRangliste() {


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
                punkte: 0

            };

        }



        dienststellen[t.dienststelle].anzahl++;


        dienststellen[t.dienststelle].punkte +=
            t.gesamtpunkte;



    });





    let liste = Object.keys(dienststellen);



    liste.sort(function(a, b) {


        let aWert =
            dienststellen[a].punkte /
            dienststellen[a].anzahl;


        let bWert =
            dienststellen[b].punkte /
            dienststellen[b].anzahl;



        return bWert - aWert;


    });





    let text = "";



    liste.forEach(function(name, index) {



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



        let d =
            dienststellen[name];



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

        "</div>";



    });





    document.getElementById(
        "dienststellenRangliste"
    ).innerHTML = text;



}

ladeRangliste();

ladeDienststellenRangliste();


// Rangliste alle 30 Sekunden aktualisieren

setInterval(ladeRangliste, 30000);