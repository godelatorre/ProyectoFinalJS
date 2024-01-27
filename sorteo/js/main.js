//Utilice como servidor local json-server, para lograr que la aplicacion funcione se deberá levantarlo.
// a traves de consola ingrese: 1) npm install -D json-server y como 2) npx json-server sorteo/src/datos.json --watch



class Participante {
    constructor(nombre, apellido, email, numeroElegido) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.numeroElegido = numeroElegido;
    }
}

// Obtuve los participantes y números elegidos del almacenamiento local.
let participantes = JSON.parse(localStorage.getItem("participantes")) || [];
let numerosElegidos = JSON.parse(localStorage.getItem("numerosElegidos")) || {};

const formularioParticipante = document.getElementById("formularioParticipante");

// Función para agregar un participante, y se va actualizando el almacenamiento local
const agregarParticipante = () => {
    //Datos del formulario
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const email = document.getElementById("email").value;
    const numeroElegido = parseInt(document.getElementById("numeroElegido").value);

    // Creacion de objeto Participante
    const participante = new Participante(nombre, apellido, email, numeroElegido);

    // Agregue participante al array y actualice los números elegidos
    participantes.push(participante);
    if (numerosElegidos[numeroElegido]) {
        numerosElegidos[numeroElegido].push(participante);
    } else {
        numerosElegidos[numeroElegido] = [participante];
    }

    // Actualización del localStorage
    localStorage.setItem("participantes", JSON.stringify(participantes));
    localStorage.setItem("numerosElegidos", JSON.stringify(numerosElegidos));

    // Llamo a la funcion para que se  limpie el formulario
    formularioParticipante.reset();

    // Realizar el sorteo si hay al menos 3 participantes y se habilita el botón de reinicio
    if (participantes.length >= 3) {
        realizarSorteo();
        document.getElementById("btnReiniciar").disabled = false;
    }
};

// creacion de la función para reiniciar la página 
const reiniciarPagina = () => {
    localStorage.removeItem("participantes");
    localStorage.removeItem("numerosElegidos");

    participantes = [];
    numerosElegidos = {};


    const resultadoElement = document.querySelector("#resultado");
    resultadoElement.innerHTML = "";
    formularioParticipante.reset();

    // Deshabilita el botón de reinicio
    document.getElementById("btnReiniciar").disabled = true;
};

// Agregue evento al formulario para prevenir el envío predeterminado y llame a la funcion agregarParticipante si hay menos de 3 participantes
document.getElementById("formularioParticipante").addEventListener("submit", (event) => {
    event.preventDefault();
    if (participantes.length < 3) {
        agregarParticipante();
    }
});

// Agregue otro evento al botón de reinicio 
document.getElementById("btnReiniciar").addEventListener("click", reiniciarPagina);

// Función para realizar el sorteo, mostrar los ganadores y enviarlos al servidor después de 9 segundos
const realizarSorteo = () => {
    const numeroGanador = Math.floor(Math.random() * 3) + 1;
    let ganadores = numerosElegidos[numeroGanador] || [];

    if (ganadores.length > 0) {
        localStorage.setItem("ganadores", JSON.stringify(ganadores));
    } else {
        localStorage.removeItem("ganadores");
    }

    let mensajeFinal = `El número ganador es el ${numeroGanador}. Los ganadores son: `;
    mensajeFinal = ganadores.reduce((mensaje, ganador) => `${mensaje}${ganador.nombre} ${ganador.apellido} (${ganador.email}), `, mensajeFinal);

    const resultadoElement = document.querySelector("#resultado");
    resultadoElement.innerHTML = `<p>${mensajeFinal}</p>`;

    // Llamada al fetch para enviar los ganadores al servidor con un retraso de 9 segundos
    setTimeout(() => {
        enviarGanadoresAServidor();
    }, 9000);
};

// creacion de la función para enviar los ganadores al servidor a través de una solicitud fetch
const enviarGanadoresAServidor = () => {
    const ganadores = JSON.parse(localStorage.getItem("ganadores"));

    if (ganadores && ganadores.length > 0) {
        fetch('http://localhost:3000/ganadores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ganadores })
        })
            .then(response => {
                if (response.ok) {
                    // indicado a traves de un console.log que verifica el éxito al enviar los ganadores al servidor
                } else {
                    // indicando un error al enviar los ganadores al servidor
                }
            })
            .catch(error => {
                // indicando un error al enviar los ganadores al servidor
            });
    } else {
        // indicando que no hay ganadores para enviar al servidor
    }
};

// Evento que se ejecuta cuando el contenido DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // creacion de una funcion que muestra un mensaje de confirmación de edad antes de reiniciar la página

    const showAgeConfirmation = () => {
        Swal.fire({
            title: '¿Eres mayor de 18 años?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            preConfirm: (result) => {
                if (result) {
                    reiniciarPagina();
                } else {
                    location.reload();
                }
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                showAgeConfirmation();
            }
        });
    };

    // Llamado a la función para mostrar el mensaje de confirmación de edad
    showAgeConfirmation();
});


