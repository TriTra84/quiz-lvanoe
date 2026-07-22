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



        durchschnittZeit = Math.floor(
            (zeitSumme / anzahl) / 1000
        );


    }



    let minuten = Math.floor(durchschnittZeit / 60);

    let sekunden = durchschnittZeit % 60;



    document.getElementById("teilnehmer").innerText = anzahl;


    document.getElementById("durchschnittPunkte").innerText =
        durchschnittPunkte;


    document.getElementById("bestePunkte").innerText =
        bestePunkte;


    document.getElementById("schlechtestePunkte").innerText =
        schlechtestePunkte;


    document.getElementById("durchschnittZeit").innerText =
        minuten + ":" + sekunden.toString().padStart(2, "0")
        + " Minuten";



}



ladeStatistik();