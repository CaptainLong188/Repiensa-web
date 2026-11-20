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
const RECURSOS_DATA_URL = "assets/data/recursos.json"
const NEWSLETTER_ICON_URL = "assets/icons/newsletter.svg"
const ARTICLE_ICON_URL = "assets/icons/article.svg"
const CONTACTO_ENDPOINT = "https://formspree.io/f/xvkgrynb"

const loadPage = async (route, scrollTargetId = null, filter = null) => {
    
    // Cerrar el menú móvil si está abierto, sin importar desde dónde se navegó
    closeNavbar()
    
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
            initImpactoCount()
        }
        else if (route == "pages/alianzas.html")
        {
            initAliadosAnimation()
        }
        else if (route == "pages/recursos.html")
        {
            initRecursos(filter)
        }
        else if (route == "pages/unete.html")
        {
            initContactoForm()
        }
    }
    else if (route == "pages/recursos.html" && filter)
    {
        applyRecursosFilter(filter)
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

const closeNavbar = () => {
    const navbarCollapse = DOM.mainMenu.closest(".navbar-collapse")
    if (!navbarCollapse || !navbarCollapse.classList.contains("show")) return
    bootstrap.Collapse.getOrCreateInstance(navbarCollapse, {toggle: false}).hide()
}

// const initImpactoCount = () => {
//   const strip = DOM.mainContent.querySelector(".impacto-strip")
//   const values = DOM.mainContent.querySelectorAll(".impacto-value")
//   if (!strip || !values.length) return
//   if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

//   const duration = 1000

//   const animate = (el) => {
//     const target = Number(el.dataset.count)
//     const start = performance.now()
//     const step = (now) => {
//       const progress = Math.min((now - start) / duration, 1)
//       const eased = 1 - Math.pow(1 - progress, 3)
//       el.textContent = Math.round(target * eased)
//       if (progress < 1) requestAnimationFrame(step)
//     }
//     requestAnimationFrame(step)
//   }

//   values.forEach((el) => {
//     el.textContent = "0"
//   })

//   const observer = new IntersectionObserver((entries, obs) => {
//     entries.forEach((entry) => {
//       if (!entry.isIntersecting) return
//       values.forEach(animate)
//       obs.unobserve(entry.target)
//     })
//   }, { threshold: 0.4 })

//   observer.observe(strip)
// }

const initImpactoCount = () => {
    const strip = DOM.mainContent.querySelector(".impacto-strip")
    const values = DOM.mainContent.querySelectorAll(".impacto-value")
    if (!strip || !values.length) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const duration = 1000
    const frameIds = new Map() // Guarda el frame pendiente de cada cifra para poder cancelarlo
    let counting = false // true desde que arranca el conteo hasta que la franja sale por completo

    const animate = (el) => {
        const target = Number(el.dataset.count)
        const start = performance.now()
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = Math.round(target * eased)
            if (progress < 1) frameIds.set(el, requestAnimationFrame(step))
        }
        frameIds.set(el, requestAnimationFrame(step))
    }

    const reset = () => {
        frameIds.forEach((id) => cancelAnimationFrame(id))
        frameIds.clear()
        values.forEach((el) => {
            el.textContent = "0"
        })
        counting = false
    }

    reset()

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                reset()
                return
            }
            if (counting || entry.intersectionRatio < 0.4) return
            counting = true
            values.forEach(animate)
        })
    }, { threshold: [0, 0.4] })

    observer.observe(strip)
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

const createRecursoElement = (tag, className, text) => {
    const element = document.createElement(tag)
    element.className = className
    if (text !== undefined) element.textContent = text
    return element
}

// "2026-10-06" => "06/10/26"
const formatRecursoDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year.slice(-2)}` 
}

// Una fecha inválida ("xxxx-xx-xx") cuenta como la más antigua
const getRecursoTime = (item) => {
    const time = Date.parse(item.fecha)
    return Number.isNaN(time) ? 0 : time
}

// Más reciente primero; si empatan en fecha, mayor número primero.
// sort es estable: los artículos con la misma fecha conservan el orden del JSON
const sortRecursos = (items) => {
    return [...items].sort((a, b) => {
        const byDate = getRecursoTime(b) - getRecursoTime(a)
        if (byDate !== 0) return byDate
        return (b.numero || 0) - (a.numero || 0)
    })
}

const createRecursoBody = (item, isNewsletter) => {
    
    if (!isNewsletter) return createRecursoElement("p", "newsletter-description", item.descripcion)

    const topics = createRecursoElement("ul", "newsletter-topics")
    ;(item.temas || []).forEach((topicText) => {
        topics.append(createRecursoElement("li", "newsletter-topic", topicText))
    })

    return topics
}

const createRecursoCard = (item) => {
    const category = item.categoria || "newsletter"
    const isNewsletter = category === "newsletter"
    const label = isNewsletter ? `Newsletter N°${item.numero}` : "Artículo"
    const buttonText = isNewsletter ? "Leer más" : "Leer artículo"

    const card = createRecursoElement("article", "newsletter-card")
    card.dataset.category = category

    const icon = createRecursoElement("img", "newsletter-icon")
    icon.src = isNewsletter ? NEWSLETTER_ICON_URL : ARTICLE_ICON_URL
    icon.alt = ""

    const meta = createRecursoElement("div", "newsletter-meta")
    meta.append(createRecursoElement("p", "newsletter-number", label))

    // Solo los newsletters muestran fecha; en los artículos solo sirve para ordenar
    if (isNewsletter)
    {
        const date = createRecursoElement("time", "newsletter-date", formatRecursoDate(item.fecha))
        date.dateTime = item.fecha
        meta.append(date)
    }

    const title = createRecursoElement("h2", "newsletter-card-title", item.titulo)
    const body = createRecursoBody(item, isNewsletter)

    const button = createRecursoElement("a", "newsletter-btn", buttonText)
    button.href = item.enlace
    button.target = "_blank"
    button.rel = "noopener noreferrer"
    button.setAttribute("aria-label", `${buttonText}: ${label}, ${item.titulo}`)

    card.append(icon, meta, title, body, button)
    return card
}

const showRecursosMessage = (grid, text) => {
    grid.replaceChildren(createRecursoElement("p", "newsletter-message", text))
}

const initRecursos = async (initialFilter = null) => {
    const grid = DOM.mainContent.querySelector(".newsletter-grid") 
    if (!grid) return

    try 
    {
        const response = await fetch(RECURSOS_DATA_URL)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const recursos = await response.json()
        if (!Array.isArray(recursos) || !recursos.length)
        {
            showRecursosMessage(grid, "Todavía no hay recursos publicados.")
            return
        }

        const cards = document.createDocumentFragment()
        sortRecursos(recursos).forEach((newsletter) => {
            cards.append(createRecursoCard(newsletter))
        })
        grid.replaceChildren(cards)

        // Las cards ya están en el DOM, ahora se activan los filtros y "Cargar más"
        initRecursosFilters(initialFilter)
    } 
    catch (err) 
    {
        console.error("Error al cargar el recurso:", err)
        showRecursosMessage(grid, "No pudimos cargar los recursos. Intenta de nuevo más tarde.")
    }
}

const initRecursosFilters = (initialFilter = null) => {
    const grid = DOM.mainContent.querySelector(".newsletter-grid")
    const filters = DOM.mainContent.querySelectorAll(".recursos-filter")
    const emptyState = DOM.mainContent.querySelector(".newsletter-empty")
    const moreBox = DOM.mainContent.querySelector(".newsletter-more")
    const moreBtn = DOM.mainContent.querySelector(".newsletter-more-btn")
    if (!grid || !filters.length || !emptyState || !moreBox || !moreBtn) return

    const step = 12 // Cada paso revela 12 cards (4 filas de 3)
    let visible = step // Cuántas cards se muestran del filtro actual
    let activeFilter = "todo"

    const update = () => {
        const cards = Array.from(grid.querySelectorAll(".newsletter-card"))

        // Cards que pertenecen al filtro activo ("todo" las incluye todas)
        const matching = cards.filter((card) => {
            return activeFilter === "todo" || card.dataset.category === activeFilter
        })

        // Ocultar las que no coinciden y las que sobrepasan el contador
        cards.forEach((card) => {
            const index = matching.indexOf(card)
            card.classList.toggle("newsletter-card-hidden", index === -1 || index >= visible)
        })

        // Sin cards en este filtro: mostrar la imagen de "aún no hay información"
        emptyState.hidden = matching.length > 0

        // Ocultar "Cargar más" cuando no hay más cards que mostrar
        moreBox.hidden = visible >= matching.length
    }

    filters.forEach((filter) => {
        filter.addEventListener("click", () => {
            activeFilter = filter.dataset.filter
            visible = step // Al cambiar de filtro se vuelve a empezar en 12

            // Solo informa a lectores de pantalla cuál filtro está seleccionado
            filters.forEach((other) => {
                other.setAttribute("aria-pressed", String(other === filter))
            })

            update()
        })
    })

    moreBtn.addEventListener("click", () => {
        visible += step
        update()
    })

    // Si se llegó desde el footer, se activa ese filtro; si no, se muestra todo
    const initialButton = initialFilter
        ? DOM.mainContent.querySelector(`.recursos-filter[data-filter="${initialFilter}"]`)
        : null

    if (initialButton)
    {
        initialButton.click()
    }
    else
    {
        update()
    }
}

const applyRecursosFilter = (filter) => {
    const button = DOM.mainContent.querySelector(`.recursos-filter[data-filter="${filter}"]`)
    if (!button) return
    button.click()
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

const initContactoForm = () => {
    const form = document.getElementById("contacto-form")
    if (!form) return

    const status = form.querySelector(".contacto-status")
    let sending = false // Previene que el mensaje se mande repetidas veces
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        if (sending) return // Existe un envío de email en progreso

        if (!form.checkValidity()) {
            form.reportValidity()
            return
        }

        sending = true
        status.textContent = "Enviando ..."

        try {
            const response = await fetch(CONTACTO_ENDPOINT, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            })

            if (!response.ok) { throw new Error("Envío rechazado")}

            form.reset()
            status.textContent = 'Gracias, recibimos tu mensaje. Te responderemos pronto.'

        } catch (error) {
            
            status.textContent = 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.';

        } finally {

            sending = false
        }
    })
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
    link.addEventListener("click", (e) => {
        e.preventDefault()
        const route = link.getAttribute("data-route")
        const target = link.getAttribute("data-target")
        const filter = link.getAttribute("data-filter")
        loadPage(route, target, filter)
    })
})