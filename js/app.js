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

const loadPage = async (route, scrollTargetId = null) => {
    
    // Solo volver a solicitar el HTML si es una página distinta a la actual
    if (route != currentRoute)
    {
        const response = await fetch(route)     // Solicita el archivo HTML al servidor
        const htmlData = await response.text()  // Convierte la respuesta en texto HTML
        DOM.mainContent.innerHTML = htmlData
        currentRoute = route
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
