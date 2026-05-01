// 1. CAMBIA ESTO: Tu número de WhatsApp con 52 + lada + número
const NUMERO_TAQUERIA = "8131151055"; 

// 2. CAMBIA ESTO: El menú de tu cliente
const menu = [
    { id: 1, nombre: "Orden de Taco de Bistec", precio: 65, categoria: "Tacos", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300" },
    { id: 2, nombre: "Orden de Taco de Pastor", precio: 65, categoria: "Tacos", img: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=300" },
    { id: 3, nombre: "Gringa de Pasto", precio: 80, categoria: "Especiales", img: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=300" },
    { id: 4, nombre: "Torta de Pierna", precio: 55, categoria: "Tortas", img: "https://images.unsplash.com/photo-1627907228177-3a73b8e3f74d?w=300" },
    { id: 5, nombre: "Quesadilla", precio: 30, categoria: "Especiales", img: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=300" },
    { id: 6, nombre: "Coca Cola 600ml", precio: 20, categoria: "Bebidas", img: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=300" },
    { id: 7, nombre: "Agua de Horchata", precio: 25, categoria: "Bebidas", img: "https://images.unsplash.com/photo-1544145945-f90425340c80?w=300" },
    { id: 8, nombre: "Agua de Jamaica", precio: 25, categoria: "Bebidas", img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300" },
];

let carrito = [];
let tipoServicio = "";
let menuFiltrado = [...menu];
let ultimoCodigoPedido = localStorage.getItem('ultimoCodigo') || null;
let esAdicional = false;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnAqui').addEventListener('click', () => seleccionarTipo('aqui'));
    document.getElementById('btnLlevar').addEventListener('click', () => seleccionarTipo('llevar'));
    document.getElementById('btnEnviar').addEventListener('click', enviarWhatsApp);
    document.getElementById('buscador').addEventListener('input', filtrarMenu);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarBuscador);
    renderizarMenu();
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
        tipoTexto.innerHTML += ` <span class="bg-blue-500 px-2 py-1 rounded text-xs ml-1">Adicional #${ultimoCodigoPedido}</span>`;
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
        container.innerHTML += `<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800">${cat}</h2>`;
        menuFiltrado.filter(item => item.categoria === cat).forEach(platillo => {
            container.innerHTML += `
            <div class="platillo-card bg-white p-3 rounded-lg shadow mb-3 flex gap-3">
                <img src="${platillo.img}" alt="${platillo.nombre}" class="w-20 h-20 object-cover rounded-lg">
                <div class="flex-1">
                    <h3 class="font-bold">${platillo.nombre}</h3>
                    <p class="text-green-600 font-bold text-lg">$${platillo.precio}</p>
                </div>
                <button onclick="agregarCarrito(${platillo.id})" class="bg-red-600 text-white px-4 rounded-lg font-bold hover:bg-red-700">
                    + Agregar
                </button>
            </div>`;
        });
    });
}

function agregarCarrito(id) {
    const platillo = menu.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({...platillo, cantidad: 1});
    }
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
                <span class="font-semibold">${item.nombre}</span>
                <span class="text-green-600 block text-sm">$${item.precio * item.cantidad}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="cambiarCantidad(${index}, -1)" class="bg-gray-200 w-7 h-7 rounded-full font-bold hover:bg-gray-300">-</button>
                <span class="w-6 text-center">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)" class="bg-gray-200 w-7 h-7 rounded-full font-bold hover:bg-gray-300">+</button>
                <button onclick="eliminarItem(${index})" class="text-red-500 ml-2 hover:text-red-700">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </div>`;
    });
    
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
    const modalContent = modal.querySelector('.bg-white');
    
    modalContent.innerHTML = `
        <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-gray-800">¡Pedido enviado!</h2>
        <p class="text-gray-600 mb-2">Tu código de pedido es:</p>
        <div class="bg-gray-100 p-4 rounded-lg mb-4">
            <span class="text-5xl font-bold text-red-600">#${codigo}</span>
        </div>
        <p class="text-sm text-gray-600 mb-4">¿Olvidaste algo?</p>
        <button id="btnAdicional" class="w-full bg-blue-600 text-white p-3 rounded-lg font-bold mb-2 hover:bg-blue-700">
            <i class="fas fa-plus"></i> Agregar más a este pedido
        </button>
        <button id="btnCambiar" class="w-full bg-yellow-500 text-white p-3 rounded-lg font-bold mb-2 hover:bg-yellow-600">
            <i class="fab fa-whatsapp"></i> Necesito cambiar algo
        </button>
        <button id="btnCerrar" class="w-full bg-gray-400 text-white p-3 rounded-lg font-bold hover:bg-gray-500">
            Entendido
        </button>
    `;
    
    document.getElementById('btnAdicional').addEventListener('click', agregarAdicional);
    document.getElementById('btnCambiar').addEventListener('click', () => chatearCambio(codigo));
    document.getElementById('btnCerrar').addEventListener('click', cerrarConfirmacion);
    
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
