const tabelle = document.querySelector("#rangliste tbody");


async function ladeRangliste() {


    const { data, error } = await supabaseClient

        .from("Teilnehmer")

        .select("name, dienststelle, gesamtpunkte")

        .not("gesamtpunkte", "is", null)

        .order("gesamtpunkte", { ascending: false });



    if (error) {

        alert(
            "Fehler:\n\n" +
            JSON.stringify(error, null, 2)
        );

        return;

    }



    tabelle.innerHTML = "";



    data.forEach(function(teilnehmer, index) {


        let zeile = document.createElement("tr");


        zeile.innerHTML = `

            <td>${index + 1}</td>

            <td>${teilnehmer.name}</td>

            <td>${teilnehmer.dienststelle}</td>

            <td>${teilnehmer.gesamtpunkte}</td>

        `;


        tabelle.appendChild(zeile);


    });


}


ladeRangliste();