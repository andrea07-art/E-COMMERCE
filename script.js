let prodottiLista = [];
let carrello = [];

function caricaProdotti() {
    const marca = document.getElementById("marcaSelect").value;
    if (!marca) {
        alert("Scegli una marca!");
        return;
    }

    Promise.all([
        fetch("prodotti.xml").then(r => r.text()),
        fetch("prodotti.json").then(r => r.json()),
        fetch("prodotti.csv").then(r => r.text())
    ])
    .then(([xmlText, jsonData, csvText]) => {
        let prodotti = [];

        const xml = new DOMParser().parseFromString(xmlText, "text/xml");
        const xmlProd = xml.getElementsByTagName("prodotto");

        for (let p of xmlProd) {
            if (p.getElementsByTagName("marca")[0].textContent === marca) {
                prodotti.push({
                    nome: p.getElementsByTagName("nome")[0].textContent,
                    prezzo: p.getElementsByTagName("prezzo")[0].textContent,
                    descrizione: "Prodotto XML"
                });
            }
        }

        jsonData.forEach(p => {
            if (p.marca === marca) {
                prodotti.push({
                    nome: p.nome,
                    prezzo: p.prezzo,
                    descrizione: "Prodotto JSON"
                });
            }
        });

        let righe = csvText.split("\n");
        for (let i = 1; i < righe.length; i++) {
            let [m, nome, prezzo] = righe[i].split(",");
            if (m === marca) {
                prodotti.push({
                    nome,
                    prezzo,
                    descrizione: "Prodotto CSV"
                });
            }
        }

        prodottiLista = prodotti;
        mostraVetrina(prodotti);
    });
}

function mostraVetrina(lista) {
    const vet = document.getElementById("vetrina");
    vet.innerHTML = "";

    lista.forEach((p, i) => {
        vet.innerHTML += `
            <div class="prodotto" onclick="apriModale(${i})">
                <h4>${p.nome}</h4>
                <p>€ ${p.prezzo}</p>
            </div>
        `;
    });
}

function apriModale(index) {
    const p = prodottiLista[index];
    document.getElementById("modaleNome").textContent = p.nome;
    document.getElementById("modalePrezzo").textContent = p.prezzo;
    document.getElementById("modaleDescrizione").textContent = p.descrizione;
    document.getElementById("btnCarrello").onclick = () => aggiungiCarrello(p);
    document.getElementById("modale").classList.remove("hidden");
}

function chiudiModale() {
    document.getElementById("modale").classList.add("hidden");
}

function aggiungiCarrello(prodotto) {
    carrello.push(prodotto);
    aggiornaCarrello();
    chiudiModale();
}

function aggiornaCarrello() {
    const lista = document.getElementById("carrelloLista");
    lista.innerHTML = "";

    let totale = 0;

    carrello.forEach(p => {
        lista.innerHTML += `<li>${p.nome} — €${p.prezzo}</li>`;
        totale += parseFloat(p.prezzo);
    });

    document.getElementById("totaleCarrello").textContent =
        "Totale: €" + totale.toFixed(2);
}

function generaPDF() {
    if (carrello.length === 0) {
        alert("Il carrello è vuoto!");
        return;
    }
    localStorage.setItem("carrello", JSON.stringify(carrello));
    window.open("scontrino.html", "_blank");
}
