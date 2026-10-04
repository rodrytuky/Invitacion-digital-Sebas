
/* =========================
   FECHA DEL EVENTO
========================= */

const fechaEvento =
    new Date("2026-10-24T15:00:00");


/* =========================
   ANIMACIÓN DE APERTURA
========================= */

const abrirBtn =
    document.getElementById("abrirBtn");

const inicio =
    document.getElementById("inicio");

const invitacion =
    document.getElementById("invitacion");

const sobre =
    document.querySelector(".sobre");


abrirBtn.addEventListener("click", function () {

    // Abrir el sobre

    sobre.classList.add("abierto");


    // Esperar la animación

    setTimeout(function () {

    inicio.classList.add("oculto");

    invitacion.classList.add("visible");

    crearSerpentinas();   // <-- nueva línea

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}, 900);

});


/* =========================
   CUENTA REGRESIVA
========================= */

function actualizarCuentaRegresiva() {

    const ahora =
        new Date();

    const diferencia =
        fechaEvento - ahora;


    if (diferencia <= 0) {

        document.getElementById("dias")
            .textContent = "00";

        document.getElementById("horas")
            .textContent = "00";

        document.getElementById("minutos")
            .textContent = "00";

        document.getElementById("segundos")
            .textContent = "00";

        return;
    }


    const dias =
        Math.floor(
            diferencia /
            (1000 * 60 * 60 * 24)
        );


    const horas =
        Math.floor(
            (diferencia /
            (1000 * 60 * 60)) % 24
        );


    const minutos =
        Math.floor(
            (diferencia /
            (1000 * 60)) % 60
        );


    const segundos =
        Math.floor(
            (diferencia / 1000) % 60
        );


    document.getElementById("dias")
        .textContent =
        String(dias).padStart(2, "0");


    document.getElementById("horas")
        .textContent =
        String(horas).padStart(2, "0");


    document.getElementById("minutos")
        .textContent =
        String(minutos).padStart(2, "0");


    document.getElementById("segundos")
        .textContent =
        String(segundos).padStart(2, "0");

}


actualizarCuentaRegresiva();


setInterval(
    actualizarCuentaRegresiva,
    1000
);


/* =========================
   FORMULARIO DE ASISTENCIA
========================= */

const formulario =
    document.getElementById(
        "formConfirmacion"
    );


const mensajeConfirmacion =
    document.getElementById(
        "mensajeConfirmacion"
    );


const URL_SCRIPT =
    "https://script.google.com/macros/s/AKfycbyiyGD8_CdwD6pCNDbwfwwPJvL2OWalIH2dyUJ5cDLEeEFleyZGnRwuE3t4Cz_tRJv3/exec"
    
formulario.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const nombre =
            document.getElementById("nombre").value.trim();

        const confirmacion =
            document.querySelector(
                'input[name="confirmacion"]:checked'
            ).value;


        const boton =
            formulario.querySelector(
                'button[type="submit"]'
            );


        boton.disabled = true;
        boton.textContent = "Enviando...";


        try {

            await fetch(URL_SCRIPT, {
                method: "POST",

                mode: "no-cors",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    nombre: nombre,
                    confirmacion: confirmacion
                })
            });


            formulario.style.display = "none";

            mensajeConfirmacion
                .classList.add("mostrar");

            mensajeConfirmacion
                .querySelector("p")
                .textContent =
                `Gracias, ${nombre}. Tu confirmación ha sido registrada.`;


        } catch (error) {

            console.error(error);

            boton.disabled = false;
            boton.textContent = "Confirmar";

            alert(
                "No se pudo registrar la confirmación. Inténtalo nuevamente."
            );
        }
    }
);

/* =========================
   SERPENTINAS
========================= */

function crearSerpentinas() {

    const contenedor =
        document.getElementById("serpentinas");

    const colores = [
        "#0090ff",
        "#ffd200",
        "#ff6b6b",
        "#6fd3ff",
        "#ffb703"
    ];

    // Menos piezas en celulares para que vaya fluido
    const cantidad =
        window.innerWidth < 600 ? 40 : 70;

    for (let i = 0; i < cantidad; i++) {

        const pieza =
            document.createElement("span");

        pieza.className = "serpentina";

        // Algunas largas (serpentinas) y otras cortas (confeti)
        const esLarga = Math.random() > 0.5;

        const ancho =
            esLarga
                ? 5 + Math.random() * 3
                : 8 + Math.random() * 6;

        const alto =
            esLarga
                ? 28 + Math.random() * 30
                : 8 + Math.random() * 6;

        pieza.style.width = ancho + "px";
        pieza.style.height = alto + "px";

        pieza.style.left =
            Math.random() * 100 + "%";

        pieza.style.background =
            colores[Math.floor(Math.random() * colores.length)];

        // Duración y retraso aleatorios; el retraso negativo
        // hace que ya estén repartidas desde el inicio
        pieza.style.animationDuration =
            (5 + Math.random() * 6) + "s";

        pieza.style.animationDelay =
            (-Math.random() * 10) + "s";

        pieza.style.setProperty(
            "--desvio",
            (Math.random() * 120 - 60) + "px"
        );

        pieza.style.setProperty(
            "--giro",
            (Math.random() * 720 - 360) + "deg"
        );

        contenedor.appendChild(pieza);
    }
}

/* =========================
   ZOOM DE ECOGRAFÍAS
========================= */

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = '<img alt="">';
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector("img");

function abrirZoom(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("activo");
}

function cerrarZoom() {
    lightbox.classList.remove("activo");
}

document.querySelectorAll("[data-zoom]").forEach(function (img) {

    img.addEventListener("click", function () {
        abrirZoom(img);
    });

    // También funciona con teclado (Enter o espacio)
    img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirZoom(img);
        }
    });
});

lightbox.addEventListener("click", cerrarZoom);

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarZoom();
});

/* =========================
   MÚSICA DE FONDO
========================= */

const musica = document.getElementById("musica");

musica.volume = 0.5;   // de 0 a 1

function iniciarMusica() {
    musica.play()
        .then(function () {
            ["pointerdown", "touchstart", "keydown"].forEach(function (evento) {
                document.removeEventListener(evento, iniciarMusica);
            });
        })
        .catch(function () {
            // El navegador la bloqueó: se vuelve a intentar con el primer toque
        });
}

// Intento al cargar la página
iniciarMusica();

// Si fue bloqueada, arranca con el primer toque en cualquier parte
["pointerdown", "touchstart", "keydown"].forEach(function (evento) {
    document.addEventListener(evento, iniciarMusica);
});