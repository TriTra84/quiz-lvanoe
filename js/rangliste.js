const tabelle = document.querySelector("#rangliste tbody");


async function ladeRangliste() {


    const { data, error } = await supabaseClient

        .from("Teilnehmer")

        .select("name, dienststelle, gesamtpunkte, startzeit, endezeit")

        .not("gesamtpunkte", "is", null)
        .not("endezeit", "is", null)



    if (error) {

        alert(
            "Fehler:\n\n" +
            JSON.stringify(error, null, 2)
        );

        return;

    }


    // Sortierung:
    // 1. höchste Punkte zuerst
    // 2. bei gleichen Punkten schnellste Zeit zuerst

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



    data.forEach(function(teilnehmer, index) {


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


        zeile.innerHTML = `

            <td>${index + 1}</td>

            <td>${teilnehmer.name}</td>

            <td>${teilnehmer.dienststelle}</td>

            <td>${teilnehmer.gesamtpunkte}</td>

            <td>${dauer}</td>

        `;


        tabelle.appendChild(zeile);


    });


}


ladeRangliste();