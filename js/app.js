"use strict"

const menuItems = [
    {name: "Home", title: "Página Principal", route: "pages/home.html"},
    {name: "Nosotros", title: "Conócenos", route: "pages/nosotros.html"},
    {name: "Proyectos", title: "Nuestras iniciativas", route: "pages/proyectos.html"},
    {name: "Recursos", title: "Material educativo", route: "pages/recursos.html"},
    {name: "Alianzas", title: "Nuestros aliados", route: "pages/alianzas.html"},
]

const DOM = {
    logoNavbar: document.getElementById("logo-navbar"),
    buttonNavbar: document.getElementsByClassName("btn-unete")[0],
    mainMenu: document.getElementById("main-menu"),
    mainContent: document.getElementById("main-content"),
    buttonFooter: document.getElementsByClassName("footer-btn")[0]
}

DOM.logoNavbar.addEventListener("click", () => {
    loadPage("pages/home.html")
})

DOM.buttonNavbar.addEventListener("click", () => {
    loadPage("pages/unete.html")
})

DOM.buttonFooter.addEventListener("click", () => {
    loadPage("pages/unete.html")
})

// Fragmento de memoria para construir el menú en memoria
const fragmentMain = document.createDocumentFragment()

menuItems.forEach(({name, title, route}) => {
    // Crear el element li
    const itemList = document.createElement("li")
    itemList.classList = "nav-item"

    // Crear el enlace
    const link = document.createElement("a")
    link.className = "nav-link"
    link.textContent = name
    link.title = title  
    link.style.cursor = "pointer"

    // Insertar el enlace dentro del elemento li
    itemList.appendChild(link)

    // Insertar el elemento li en el fragmento
    fragmentMain.appendChild(itemList)

    // Cuando se hace click a una opción del menú se carga la página correspondiente
    link.addEventListener("click", () => {
        loadPage(route)
    })
});

// Insertar todo el menú en el DOM
DOM.mainMenu.appendChild(fragmentMain)   

let currentRoute = null 
let coverflowResizeHandler = null

const loadPage = async (route, scrollTargetId = null) => {
    
    // Solo volver a solicitar el HTML si es una página distinta a la actual
    if (route != currentRoute)
    {
        const response = await fetch(route)     // Solicita el archivo HTML al servidor
        const htmlData = await response.text()  // Convierte la respuesta en texto HTML
        DOM.mainContent.innerHTML = htmlData
        currentRoute = route

        if (route == "pages/proyectos.html")
        {
            initTalleresCoverflow()
        }
        else if (route == "pages/alianzas.html")
        {
            initAliadosAnimation()
        }
    }

    if (scrollTargetId) 
    {
        requestAnimationFrame(() => {
            const target = document.getElementById(scrollTargetId)
            if (target) {
                target.scrollIntoView({behavior: "smooth", block: "center"})
            }
        })
    }
    else
    {
        window.scrollTo({top: 0}) // Comportamiento normal: subir al inicio en navegación regular
    }
}

const initTalleresCoverflow = () => {
    const track = DOM.mainContent.querySelector("#talleresCoverflow")
    if (!track) return

    const slides = Array.from(track.querySelectorAll(".coverflow-slide"))
    const prevBtn = DOM.mainContent.querySelector(".coverflow-arrow-prev")
    const nextBtn = DOM.mainContent.querySelector(".coverflow-arrow-next")
    if (!slides.length || !prevBtn || !nextBtn) return
    
    // Evita ejecutar el cálculo más de una vez por frame durante el scroll
    let ticking = false

    // Calcula, para cada tarjeta, qué tan lejos está del centro del carrusel
    // y ajusta su escala, rotación y opacidad según esa distancia
    const update = () => {
        const trackRect = track.getBoundingClientRect()
        const centerX = trackRect.left + trackRect.width / 2
        const slideWidth = slides[0].getBoundingClientRect().width

        slides.forEach((slide) => {
            const rect = slide.getBoundingClientRect()
            const slideCenter = rect.left + rect.width / 2
            const dist = slideCenter - centerX
            const norm = dist / (slideWidth + 16)
            const absNorm = Math.min(Math.abs(norm), 3)

            const scale = 1 - absNorm * 0.18
            const rotateY = Math.max(-38, Math.min(38, norm * -26))
            const opacity = 1 - absNorm * 0.22

            slide.style.transform = `perspective(1000px) scale(${scale}) rotateY(${rotateY}deg)`
            slide.style.opacity = String(Math.max(0.35, opacity))
            slide.style.zIndex = String(Math.round(100 - absNorm * 10))
        })
        ticking = false
    }

    track.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(update)
            ticking = true
        }
    }, {passive: true})

    // Si ya existía un listener de resize de una visita anterior a esta página, lo quitamos primero
    // para no acumular listeners duplicados cada vez que se vuelve a cargar esta ruta
    if (coverflowResizeHandler) {
        window.removeEventListener("resize", coverflowResizeHandler)
    }

    coverflowResizeHandler = update
    window.addEventListener("resize", coverflowResizeHandler)

    // Al hacer click en una tarjeta que no está centrada, la desplaza al centro
    slides.forEach((slide) => {
        slide.addEventListener("click", () => {
            slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
        })
    })

    // Mueve el carrusel una tarjeta hacia adelante o hacia atrás desde la posición actual
    const scrollByIndex = (delta) => {
        const trackRect = track.getBoundingClientRect()
        const centerX = trackRect.left + trackRect.width / 2

        // Encuentra cuál tarjeta está actualmente más cerca del centro
        let currentIndex = 0
        let minDist = Infinity
        slides.forEach((slide, i) => {
            const rect = slide.getBoundingClientRect()
            const dist = Math.abs(rect.left + rect.width / 2 - centerX)
            if (dist < minDist) {
                minDist = dist
                currentIndex = i
            }
        })

        // Calcula el índice destino sin salirse de los límites del arreglo
        const target = Math.max(0, Math.min(slides.length - 1, currentIndex + delta))
        slides[target].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }

    prevBtn.addEventListener("click", () => scrollByIndex(-1))
    nextBtn.addEventListener("click", () => scrollByIndex(1))

    // Aplica el cálculo inicial apenas se carga la sección, antes de cualquier scroll
    update()
}

const initAliadosAnimation = () => {
    const grid = DOM.mainContent.querySelector(".aliados-grid")
    const items = DOM.mainContent.querySelectorAll(".aliado-item")
    if (!items.length || !grid) return

    grid.classList.add("js-ready")

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = Array.from(items).indexOf(entry.target)
                entry.target.style.transitionDelay = `${index * 90}ms`
                entry.target.classList.add("is-visible")
                observer.unobserve(entry.target)
            }
        })
    }, { threshold: 0.2 })

    items.forEach((item) => observer.observe(item))
}

loadPage("pages/home.html")

// Delegación de eventos
DOM.mainContent.addEventListener("click", (event) => {
    
    // Verificar si se hace click al boton primario
    if(event.target.matches("#primary-btn"))
    {
        event.preventDefault()
        loadPage("pages/nosotros.html")
        return 
    }

    // Verificar si se hace click al boton secundario
    if (event.target.matches("#secondary-btn"))
    {
        event.preventDefault()
        loadPage("pages/proyectos.html")
        return 
    }

    // Verificar si se hace click al boton para unirse
    if (event.target.matches("#join-btn"))
    {
        event.preventDefault()
        loadPage("pages/unete.html")
        return 
    }
})

document.querySelectorAll(".footer-anchor-link").forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault()
        const route = link.getAttribute("data-route")
        const target = link.getAttribute("data-target")
        loadPage(route, target)
    })
})
