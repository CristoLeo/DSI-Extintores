document.addEventListener('DOMContentLoaded', () => {

    // ===================================
    // 1. GESTIÓN DEL CARRITO DE COMPRAS
    // ===================================

    const contadorCarrito = document.getElementById('contador-carrito');

    /**
     * Carga el carrito desde localStorage, lo limpia si es necesario y devuelve el array.
     * @returns {Array} Array de productos en el carrito.
     */
    function getCarrito() {
        let currentCarrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Limpieza: Asegura que solo hay ítems válidos
        currentCarrito = currentCarrito.filter(item => item && item.nameId);

        // Si el carrito está vacío, aseguramos que localStorage esté limpio
        if (currentCarrito.length === 0) {
            localStorage.removeItem('carrito');
        }
        return currentCarrito;
    }
    
    /**
     * Actualiza el número de ítems visibles en el contador.
     */
    function updateCartCounter() {
        const carritoActualizado = getCarrito();
        if (contadorCarrito) {
            contadorCarrito.textContent = carritoActualizado.length;
        }
    }

    // Inicialización del contador
    updateCartCounter(); 

    // Función global para ir al carrito (Usada en el HTML)
    window.verCarrito = function() {
        const carrito = getCarrito();
        if (carrito.length > 0) {
            // Asegúrate de tener un archivo 'carrito.html'
            window.location.href = 'carrito.html';
        } else {
            // No usamos alert(), sino un console.error para debugging.
            console.error('El carrito está vacío. Agrega productos primero.');
        }
    };

    // Función global para agregar al carrito (Usada en el HTML de productos)
    // Permite agregar productos incluso si el EventListener no se ejecuta (como en index.html)
    window.agregarAlCarrito = function(nameId, nombre, imagenSrc) {
        const producto = {
            id: Date.now() + Math.random(), 
            nameId: nameId,
            nombre: nombre,
            imagenSrc: imagenSrc || 'assets/placeholder.jpg' 
        };
        
        let carrito = getCarrito();
        carrito.push(producto);
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        updateCartCounter();

        // Podrías añadir un feedback visual aquí si lo necesitas
        console.log(`Producto agregado: ${nombre}`);
    };

    // Event listener para agregar productos (Usado en las páginas de productos)
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        // Verifica si el botón ya tiene un 'onclick' definido en el HTML (para evitar duplicados si usaste window.agregarAlCarrito)
        if (!boton.hasAttribute('onclick')) {
             boton.addEventListener('click', (e) => {
                const productoElement = e.currentTarget.parentElement;
                
                // Usamos la función global para mantener la lógica centralizada
                window.agregarAlCarrito(
                    productoElement.getAttribute('data-id'),
                    productoElement.getAttribute('data-nombre'),
                    productoElement.querySelector('img') ? productoElement.querySelector('img').src : 'assets/placeholder.jpg'
                );

                // Feedback visual
                e.currentTarget.textContent = 'Agregado ✓';
                setTimeout(() => { 
                    e.currentTarget.textContent = 'Agregar al Carrito'; 
                }, 1000);
            });
        }
    });


    // ===================================
    // 2. ESTADO DE SESIÓN Y AUTENTICACIÓN
    // ===================================

    const authContainer = document.getElementById('auth-container');

    function loadAuthStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!authContainer) return; // Salir si el contenedor no existe

        if (currentUser && currentUser.name) {
            const firstName = currentUser.name.split(' ')[0];
            
            // Renderiza el menú de usuario
            authContainer.innerHTML = `
                <div class="user-menu">
                    <div class="user-name-btn">
                        Hola, ${firstName} <span style="font-size: 0.8em;">▼</span>
                    </div>
                    <div class="dropdown-content">
                        <a href="#" id="logout-link">Cerrar Sesión</a>
                    </div>
                </div>
            `;
            // Añadir listener de cierre de sesión al nuevo elemento
            document.getElementById('logout-link')?.addEventListener('click', logout);

            // Funcionalidad básica para mostrar/ocultar el menú de usuario
            authContainer.querySelector('.user-name-btn')?.addEventListener('click', (e) => {
                 authContainer.querySelector('.dropdown-content').classList.toggle('show-dropdown');
            });

        } else {
            authContainer.innerHTML = `<a href="login.html" class="auth-link">Iniciar Sesión</a>`;
        }
    }

    /**
     * Cierra la sesión del usuario.
     */
    function logout(e) {
        if (e) e.preventDefault();
        localStorage.removeItem('currentUser');
        // No usamos alert(), sino console.log
        console.log('Sesión cerrada correctamente.');
        window.location.reload(); 
    }
    
    // Inicialización del estado de sesión
    loadAuthStatus();


    // ===================================
    // 3. MENÚ DE NAVEGACIÓN MÓVIL
    // ===================================
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.getElementById('main-nav');

    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('show');
        });
        
        // Cierra el menú cuando se hace clic en un enlace (en móvil)
        navUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Asumiendo que 'show' es la clase que hace visible el menú en móvil
                if (navUl.classList.contains('show')) {
                    navUl.classList.remove('show');
                }
            });
        });
    }


    // ===================================
    // 4. ANIMACIÓN Y SCROLL
    // ===================================

    // Animación Fade-in
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver(function(entries, observer){
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    faders.forEach(fader => { appearOnScroll.observe(fader); });


    // Ocultar flotante al final de la página
    const flotante = document.getElementById('flotante');
    if (flotante) {
        window.addEventListener('scroll', function() {
            // El flotante desaparece 100px antes del final de la página
            const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
            flotante.style.opacity = nearBottom ? '0' : '1';
        });
    }


    // ===================================
    // 5. FORMULARIO DE RESEÑAS
    // ===================================

    const resenaForm = document.getElementById('resena-form');
    if (resenaForm) {
        resenaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('resena-nombre').value.trim();
            const ratingElement = document.querySelector('input[name="rating"]:checked');
            const rating = ratingElement ? ratingElement.value : 'Sin calificar';
            
            // Reemplazo de alert() por console.log()
            console.log(`¡Gracias ${nombre}! Tu reseña de ${rating} estrellas ha sido enviada con éxito.`);
            e.target.reset();
        });
    }


    // ===========================================
    // 6. FORMULARIO DE RECARGAS Y SERVICIOS (NUEVO)
    // ===========================================
    const servicioForm = document.getElementById('servicio-form');
    const mensajeExito = document.getElementById('mensaje-exito');
    const formContainer = document.getElementById('form-recargas-container');

    if (servicioForm) {
        servicioForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('telefono').value;
            const detalle = document.getElementById('detalle').value;
            const destinatario = 'cristoleo8@outlook.com';
            
            // Construcción del cuerpo del correo
            const subject = 'Solicitud de Recarga o Servicio - DSI';
            const body = `Hola DSI Extintores,
            
He enviado una solicitud de servicio/recarga con los siguientes detalles:
            
---
Nombre: ${nombre}
Correo: ${email}
Teléfono: ${telefono}
---
Detalle de la Solicitud:
${detalle}
---

Por favor, contactar al cliente para cotización.`;

            // Codificación de URL para asegurar que el cuerpo y asunto sean correctos
            const mailtoLink = `mailto:${destinatario}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // 1. Abrir el cliente de correo del usuario
            window.location.href = mailtoLink;

            // 2. Ocultar el formulario y mostrar el mensaje de éxito
            if (formContainer) {
                formContainer.style.display = 'none';
            }
            if (mensajeExito) {
                mensajeExito.style.display = 'block';
            }

            // Ya no hay redirección forzada. El usuario usa el botón "Volver al Menú Principal"
        });
    }

}); // Fin de DOMContentLoaded