// 1. CAMBIA ESTO: Tu número de WhatsApp con 52 + lada + número
const NUMERO_TAQUERIA = "8131151055"; 

// 2. CAMBIA ESTO: El menú de tu cliente
const menu = [
    { id: 1, nombre: "Orden de Tacos de Bistec", precio: 80, categoria: "Tacos", img: "./img/Tacos-bistec.jpg" },
    { id: 2, nombre: "Orden de Tacos de Pastor", precio: 80, categoria: "Tacos", img: "./img/Tacos-pastor.jpg" },
    { id: 3, nombre: "Gringa de Pastor", precio: 65, categoria: "Especiales", img: "./img/Gringa-pastor.jpg" },
    { id: 4, nombre: "Torta de Pastor", precio: 65, categoria: "Tortas", img: "./img/Torta-pastor.jpg" },
    { id: 5, nombre: "Torta de Bistec", precio: 65, categoria: "Tortas", img: "./img/Torta-bistec.jpg" },
    { id: 6, nombre: "Coca Cola 600ml", precio: 25, categoria: "Bebidas", img: "./img/Coca-cola.jpg" },
    { id: 7, nombre: "Boing Mango 600ml", precio: 25, categoria: "Bebidas", img: "./img/Boing.jpg" },
    { id: 8, nombre: "Agua de Horchata 1L", precio: 30, categoria: "Bebidas", img: "./img/Agua-horchata.jpg" },
    { id: 9, nombre: "Agua de Jamaica 1L", precio: 30, categoria: "Bebidas", img: "./img/Agua-jamaica.jpg" },
];

let carrito = [];
let tipoServicio = "";
let menuFiltrado = [...menu];
let ultimoCodigoPedido = localStorage.getItem('ultimoCodigo') || null;
let esAdicional = false;

document.addEventListener('DOMContentLoaded', function() {
    // NO RIPPLE EN MODAL - Solo en botones después
    document.getElementById('btnAqui').onclick = () => seleccionarTipo('aqui');
    document.getElementById('btnLlevar').onclick = () => seleccionarTipo('llevar');
    document.getElementById('btnEnviar').onclick = enviarWhatsApp;
    document.getElementById('buscador').oninput = filtrarMenu;
    document.getElementById('btnLimpiar').onclick = limpiarBuscador;
    
    // SKELETON LOADING
    mostrarSkeleton();
    setTimeout(() => {
        renderizarMenu();
    }, 800);
});

function seleccionarTipo(tipo) {
    tipoServicio = tipo;
    document.getElementById('modalTipo').classList.add('hidden');
    
    const tipoTexto = document.getElementById('tipoPedido');
    const avisoMesa = document.getElementById('avisoMesa');
    const campoMesa = document.getElementById('campoMesa');
    const campoNombre = document.getElementById('campoNombre');
    
    if (tipo === 'aqui') {
        tipoTexto.innerHTML = '<i class="fas fa-utensils"></i> Para comer aquí';
        avisoMesa.classList.remove('hidden');
        campoMesa.classList.remove('hidden');
        campoNombre.classList.add('hidden');
    } else {
        tipoTexto.innerHTML = '<i class="fas fa-shopping-bag"></i> Para llevar';
        avisoMesa.classList.add('hidden');
        campoMesa.classList.add('hidden');
        campoNombre.classList.remove('hidden');
    }
    
    if (esAdicional && ultimoCodigoPedido) {
        tipoTexto.innerHTML += ` <span class="bg-blue-600 px-2 py-1 rounded text-xs ml-1 text-white">Adicional #${ultimoCodigoPedido}</span>`;
    }
}

// SKELETON LOADING
function mostrarSkeleton() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        container.innerHTML += `
        <div class="platillo-card loading p-3 rounded-lg shadow mb-3 flex gap-3">
            <div class="skeleton w-20 h-20 rounded-lg"></div>
            <div class="flex-1">
                <div class="skeleton h-5 w-3/4 mb-2 rounded"></div>
                <div class="skeleton h-4 w-1/4 rounded"></div>
            </div>
            <div class="skeleton w-20 h-10 rounded-lg"></div>
        </div>`;
    }
}

function filtrarMenu() {
    const texto = document.getElementById('buscador').value.toLowerCase().trim();
    const sinResultados = document.getElementById('sinResultados');
    const container = document.getElementById('menu-container');
    const btnLimpiar = document.getElementById('btnLimpiar');
    
    if (texto.length > 0) {
        btnLimpiar.classList.remove('hidden');
    } else {
        btnLimpiar.classList.add('hidden');
    }
    
    if (texto === "") {
        menuFiltrado = [...menu];
    } else {
        menuFiltrado = menu.filter(item => 
            item.nombre.toLowerCase().includes(texto) || 
            item.categoria.toLowerCase().includes(texto)
        );
    }
    
    if (menuFiltrado.length === 0) {
        container.innerHTML = '';
        sinResultados.classList.remove('hidden');
    } else {
        sinResultados.classList.add('hidden');
        renderizarMenu();
    }
}

function limpiarBuscador() {
    document.getElementById('buscador').value = '';
    document.getElementById('btnLimpiar').classList.add('hidden');
    filtrarMenu();
}

function renderizarMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    
    const categorias = [...new Set(menuFiltrado.map(item => item.categoria))];
    
    categorias.forEach(cat => {
        container.innerHTML += `<h2 class="text-xl font-bold mt-6 mb-3">${cat}</h2>`;
        menuFiltrado.filter(item => item.categoria === cat).forEach((platillo) => {
            container.innerHTML += `
            <div class="platillo-card p-3 rounded-lg shadow mb-3 flex gap-3" data-id="${platillo.id}">
                <img src="${platillo.img}" alt="${platillo.nombre}" class="w-20 h-20 object-cover rounded-lg border-2 border-yellow-400">
                <div class="flex-1">
                    <h3 class="font-bold text-white">${platillo.nombre}</h3>
                    <p class="text-yellow-400 font-bold text-lg">$${platillo.precio}</p>
                </div>
                <button onclick="agregarCarrito(${platillo.id}, event)" class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-4 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 shadow-lg">
                    + Agregar
                </button>
            </div>`;
        });
    });
}

// FLY TO CART + BADGE +1
function agregarCarrito(id, event) {
    const platillo = menu.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({...platillo, cantidad: 1});
    }
    
    const card = event.target.closest('.platillo-card');
    const img = card.querySelector('img');
    const carritoEl = document.getElementById('carrito');
    
    // FLY TO CART
    const flyItem = img.cloneNode();
    const imgRect = img.getBoundingClientRect();
    const carritoRect = carritoEl.getBoundingClientRect();
    
    flyItem.classList.add('fly-item');
    flyItem.style.left = imgRect.left + 'px';
    flyItem.style.top = imgRect.top + 'px';
    flyItem.style.setProperty('--fly-x', (carritoRect.left - imgRect.left) + 'px');
    flyItem.style.setProperty('--fly-y', (carritoRect.top - imgRect.top) + 'px');
    document.body.appendChild(flyItem);
    setTimeout(() => flyItem.remove(), 800);
    
    // BADGE +1
    const badge = document.createElement('div');
    badge.className = 'badge-plus';
    badge.textContent = '+1';
    badge.style.left = event.clientX + 'px';
    badge.style.top = event.clientY + 'px';
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 1000);
    
    // Animación bounce
    card.classList.add('agregado');
    setTimeout(() => card.classList.remove('agregado'), 400);
    
    // Check flotante
    const check = document.createElement('div');
    check.className = 'check-flotante';
    check.innerHTML = '<i class="fas fa-check-circle"></i>';
    check.style.left = event.clientX + 'px';
    check.style.top = event.clientY + 'px';
    document.body.appendChild(check);
    setTimeout(() => check.remove(), 800);
    
    // Carrito tiembla
    carritoEl.classList.add('pulse');
    setTimeout(() => carritoEl.classList.remove('pulse'), 500);
    
    actualizarCarrito();
}

function actualizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalEl = document.getElementById('total');
    const carritoEl = document.getElementById('carrito');
    
    if (carrito.length === 0) {
        carritoEl.classList.add('hidden');
        return;
    }
    
    carritoEl.classList.remove('hidden');
    let total = 0;
    lista.innerHTML = '';
    
    carrito.forEach((item, index) => {
        total += item.precio * item.cantidad;
        lista.innerHTML += `
        <div class="flex justify-between items-center py-2 border-b">
            <div class="flex-1">
                <span class="font-semibold text-white">${item.nombre}</span>
                <span class="text-yellow-400 block text-sm">$${item.precio * item.cantidad}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="cambiarCantidad(${index}, -1)" class="bg-gray-700 text-yellow-400 w-7 h-7 rounded-full font-bold hover:bg-gray-600 border border-yellow-400">-</button>
                <span class="w-6 text-center text-white">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)" class="bg-gray-700 text-yellow-400 w-7 h-7 rounded-full font-bold hover:bg-gray-600 border border-yellow-400">+</button>
                <button onclick="eliminarItem(${index})" class="text-red-500 ml-2 hover:text-red-400">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </div>`;
    });
    
    totalEl.classList.add('brilla');
    setTimeout(() => totalEl.classList.remove('brilla'), 600);
    totalEl.textContent = `$${total}`;
}

function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    actualizarCarrito();
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function generarCodigoPedido() {
    let contador = parseInt(localStorage.getItem('contadorPedidos') || '99');
    contador++;
    if (contador > 999) contador = 100;
    localStorage.setItem('contadorPedidos', contador);
    return String(contador);
}

// CONFETTI DORADO
function lanzarConfetti() {
    const colores = ['#fbbf24', '#f59e0b', '#d97706'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${Math.random() > 0.5 ? 'square' : 'circle'}`;
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colores[Math.floor(Math.random() * colores.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    let identificador = "";
    const codigoPedido = esAdicional ? ultimoCodigoPedido : generarCodigoPedido();
    const fecha = new Date();
    const horaActual = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const fechaActual = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
    
    if (tipoServicio === 'aqui') {
        const mesa = document.getElementById('mesa').value;
        if (!mesa) {
            alert('Por favor pon tu número de mesa. Si no tienes mesa, pídele una al mesero primero.');
            return;
        }
        identificador = `MESA ${mesa}`;
    } else {
        const nombre = document.getElementById('nombreCliente').value.trim();
        if (!nombre) {
            alert('Por favor pon tu nombre para identificar el pedido');
            return;
        }
        identificador = nombre.toUpperCase();
    }
    
    let lineas = [];
    
    if (esAdicional && ultimoCodigoPedido) {
        lineas.push("═══════════════════");
        lineas.push("*>>> PEDIDO ADICIONAL <<<*");
        lineas.push(`*PARA COMPLETAR EL PEDIDO #${ultimoCodigoPedido}*`);
        lineas.push("═══════════════════");
        lineas.push("");
    } else {
        lineas.push("═══════════════════");
        lineas.push(`*>>> NUEVO PEDIDO #${codigoPedido} <<<*`);
        lineas.push("═══════════════════");
        lineas.push("");
    }
    
    lineas.push(`*SERVICIO:* ${tipoServicio === 'aqui' ? 'COMER AQUÍ' : 'PARA LLEVAR'}`);
    lineas.push(`*CLIENTE:* ${identificador}`);
    lineas.push(`*HORA:* ${horaActual} - ${fechaActual}`);
    lineas.push("");
    lineas.push("---------------------------");
    
    lineas.push("*DETALLE DEL PEDIDO:*");
    lineas.push("");
    
    let total = 0;
    carrito.forEach((item, i) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        lineas.push(`${i + 1}. ${item.cantidad}x ${item.nombre}`);
        lineas.push(`   Precio: $${item.precio} c/u = *$${subtotal}*`);
        lineas.push("");
    });
    
    lineas.push("---------------------------");
    lineas.push(`*TOTAL A PAGAR: $${total} MXN*`);
    lineas.push("---------------------------");
    lineas.push("");
    
    if (esAdicional) {
        lineas.push(`_NOTA: Sumar al pedido #${ultimoCodigoPedido}_`);
    } else {
        lineas.push(`*CODIGO: #${codigoPedido}*`);
    }
    lineas.push("_Pedido desde Menu Digital_");
    
    const mensaje = lineas.join('\n');
    const url = `https://wa.me/${NUMERO_TAQUERIA}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
    
    // CONFETTI al enviar
    lanzarConfetti();
    
    if (!esAdicional) {
        ultimoCodigoPedido = codigoPedido;
        localStorage.setItem('ultimoCodigo', codigoPedido);
    }
    
    mostrarModalConfirmacion(codigoPedido);
    
    esAdicional = false;
    carrito = [];
    actualizarCarrito();
    document.getElementById('mesa').value = '';
    document.getElementById('nombreCliente').value = '';
}

function mostrarModalConfirmacion(codigo) {
    const modal = document.getElementById('modalConfirmacion');
    const modalContent = modal.querySelector('.bg-gradient-to-br');
    
    modalContent.innerHTML = `
        <i class="fas fa-check-circle text-yellow-400 text-6xl mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-yellow-400">¡Pedido enviado!</h2>
        <p class="text-gray-300 mb-2">Tu código de pedido es:</p>
        <div class="bg-gray-800 p-4 rounded-lg mb-4 border-2 border-yellow-400">
            <span class="text-5xl font-bold text-yellow-400">#${codigo}</span>
        </div>
        <p class="text-sm text-gray-300 mb-4">¿Olvidaste algo?</p>
        <button id="btnAdicional" class="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 p-3 rounded-lg font-bold mb-2 hover:from-yellow-600 hover:to-yellow-700">
            <i class="fas fa-plus"></i> Agregar más a este pedido
        </button>
        <button id="btnCambiar" class="w-full bg-gray-700 text-yellow-400 p-3 rounded-lg font-bold mb-2 hover:bg-gray-600 border border-yellow-400">
            <i class="fab fa-whatsapp"></i> Necesito cambiar algo
        </button>
        <button id="btnCerrar" class="w-full bg-gray-600 text-white p-3 rounded-lg font-bold hover:bg-gray-500">
            Entendido
        </button>
    `;
    
    document.getElementById('btnAdicional').onclick = agregarAdicional;
    document.getElementById('btnCambiar').onclick = () => chatearCambio(codigo);
    document.getElementById('btnCerrar').onclick = cerrarConfirmacion;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function agregarAdicional() {
    esAdicional = true;
    cerrarConfirmacion();
    document.getElementById('modalTipo').classList.remove('hidden');
}

function chatearCambio(codigo) {
    const msg = `Hola, sobre mi pedido #${codigo} quisiera hacer un cambio:`;
    window.open(`https://wa.me/${NUMERO_TAQUERIA}?text=${encodeURIComponent(msg)}`, '_blank');
}

function cerrarConfirmacion() {
    document.getElementById('modalConfirmacion').classList.add('hidden');
    document.getElementById('modalConfirmacion').classList.remove('flex');
    
    carrito = [];
    actualizarCarrito();
    limpiarBuscador();
    
    if (!esAdicional) {
        document.getElementById('modalTipo').classList.remove('hidden');
        document.getElementById('tipoPedido').innerHTML = '';
        document.getElementById('avisoMesa').classList.add('hidden');
        document.getElementById('campoMesa').classList.add('hidden');
        document.getElementById('campoNombre').classList.add('hidden');
        tipoServicio = "";
    }
}
