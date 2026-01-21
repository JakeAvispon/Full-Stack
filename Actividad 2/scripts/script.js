//LISTA DE tAREAS
let etiquetasTarea = JSON.parse(localStorage.getItem("etiquetasTarea") || "[]");
let tareasDia = JSON.parse(localStorage.getItem("tareasDia") || "{}");

document.addEventListener("DOMContentLoaded", () => {
    mostrarEtiquetas();
    mostrarCalendario();
    poblarSelectoresDeMes();
});

function mostrarInputTarea() {
    const input = document.getElementById("inputTarea");
    const etiquetas = document.getElementById("contenedorTareasGuardadas");
    input.classList.toggle("hide");
    etiquetas.classList.toggle("hide");

    // Limpia el input
    document.getElementById("nuevaTarea").value = "";
}

function guardarEtiquetaTarea() {
    const input = document.getElementById("nuevaTarea");
    const texto = input.value.trim();
    if (texto && !etiquetasTarea.includes(texto)) {
    etiquetasTarea.push(texto);
    localStorage.setItem("etiquetasTarea", JSON.stringify(etiquetasTarea));
    input.value = "";
    mostrarEtiquetas();
    }
}

function eliminarEtiqueta(tarea) {
    etiquetasTarea = etiquetasTarea.filter(t => t !== tarea);
    localStorage.setItem("etiquetasTarea", JSON.stringify(etiquetasTarea));
    mostrarEtiquetas();
}

function agregarTareaDesdeInput() {
    const input = document.getElementById("nuevaTarea");
    const texto = input.value.trim();
    if (texto) {
    agregarTarea(texto);
    input.value = "";
    }
}

function agregarTarea(tarea) {
    const lista = document.getElementById("listaTareasPendientes");
    const div = document.createElement("div");
    div.className = "tarea-item";
    div.innerHTML = `
    <label style="display: flex; align-items: center;">
        <input type="checkbox" class="checkbox-ui-task">
        <span class="texto-tarea">${tarea}</span>
    </label>
    <button class="boton-eliminar" onclick="this.parentElement.remove()"></button>
    `;
    lista.appendChild(div);
}

function mostrarEtiquetas() {
    const contenedor = document.getElementById("tareasGuardadas");
    contenedor.innerHTML = etiquetasTarea.map(t => 
    `<button class="button-ui" onclick="agregarTarea('${t}')">${t} <span onclick="event.stopPropagation(); eliminarEtiqueta('${t}')" style="color: #aa3b3b; font-weight: bold">  ×</span></button>`
    ).join("");
}

function mostrarCalendario() {
    const contenedor = document.getElementById("tareasCalendario");
    const encabezado = document.getElementById("encabezadoSemana");
    contenedor.innerHTML = "";

    const hoy = new Date();
    const dias = [];

    for (let i = -3; i <= 3; i++) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() + i);
    dias.push(dia);
    }

    // Encabezado: Mes y año
    const opcionesEncabezado = { month: 'long', year: 'numeric' };
    encabezado.textContent = hoy.toLocaleDateString('es-MX', opcionesEncabezado).toUpperCase();

    dias.forEach(dia => {
    const dd = dia.getDate().toString().padStart(2, '0');
    const mm = (dia.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = dia.getFullYear();
    const clave = `${yyyy}-${mm}-${dd}`;
    const nombreDia = dia.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' });

    const div = document.createElement("div");
    div.className = "dia";
    div.innerHTML = `<strong>${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}</strong><br>
                    ${tareasDia[clave] ? tareasDia[clave].map(t => `» ${t}`).join("<br>") : '<i>Sin tareas</i>'}`;
    contenedor.appendChild(div);
    });
}

function toggleVistaMensual() {
    const contenedor = document.getElementById("contenedorVistaMensual");
    contenedor.classList.toggle("oculto");
}

function mostrarCalendarioMensual() {
    const mes = parseInt(document.getElementById("mesSeleccionado").value);
    const anio = parseInt(document.getElementById("anioSeleccionado").value);
    const contenedor = document.getElementById("vistaMensual");

    contenedor.innerHTML = "";

    const diasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1).getDay();

    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    diasSemana.forEach(dia => {
        const encabezado = document.createElement("div");
        encabezado.innerHTML = `<strong>${dia}</strong>`;
        contenedor.appendChild(encabezado);
    });

    for (let i = 0; i < primerDia; i++) {
        contenedor.appendChild(document.createElement("div"));
    }

    for (let dia = 1; dia <= diasMes; dia++) {
        const fecha = `${anio}-${(mes + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        const div = document.createElement("div");
        div.className = "dia";

        const tareas = tareasDia[fecha] || [];
        div.innerHTML = `<strong>${dia}</strong><br>${tareas.map(t => `» ${t}`).join("<br>")}`;
        contenedor.appendChild(div);
        }
}

function poblarSelectoresDeMes() {
    const mesSel = document.getElementById("mesSeleccionado");
    const anioSel = document.getElementById("anioSeleccionado");

    if (mesSel.options.length === 0) {
        for (let m = 0; m < 12; m++) {
        const option = document.createElement("option");
        option.value = m;
        option.textContent = new Date(0, m).toLocaleString("es-MX", { month: "long" });
        mesSel.appendChild(option);
        }

        const anioActual = new Date().getFullYear();
        for (let a = anioActual - 2; a <= anioActual + 1; a++) {
        const option = document.createElement("option");
        option.value = a;
        option.textContent = a;
        anioSel.appendChild(option);
        }

        mesSel.value = new Date().getMonth();
        anioSel.value = new Date().getFullYear();
    }

    mostrarCalendarioMensual();
}

function guardarTareasDia() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, "0");
    const mes = (hoy.getMonth() + 1).toString().padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaLocal = `${anio}-${mes}-${dia}`;

    const tareasDivs = document.querySelectorAll("#listaTareasPendientes .tarea-item");
    if (!tareasDia[fechaLocal]) tareasDia[fechaLocal] = [];

    let task = 0;
    tareasDivs.forEach(div => {
    const texto = div.querySelector(".texto-tarea")?.innerText;
    if (texto && !tareasDia[fechaLocal].includes(texto)) {
        tareasDia[fechaLocal].push(texto);
        task++;
    }
    });

    localStorage.setItem("tareasDia", JSON.stringify(tareasDia));

    document.getElementById("listaTareasPendientes").innerHTML = ""; // Limpia la lista
    mostrarCalendario();
    mostrarCalendarioMensual();
}

function guardarTareaDirecto() {
    const input = document.getElementById("nuevaTarea");
    const texto = input.value.trim();
    if (texto) {

    // Agrega a la lista
    agregarTarea(texto);
    input.value = "";
    mostrarEtiquetas();
    mostrarCalendario();
    }
}

//LISTA DE TAREAS
mostrarEtiquetas();
mostrarCalendario();
poblarSelectoresDeMes();
mostrarCalendarioMensual();





