document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tree-container");
    const btnParent = document.getElementById("btn-parent");
    
    let currentRoot = fullTree;
    let parentsMap = new Map();
    const MAX_LEVELS = 3; // Niveles a mostrar inicialmente

    function extractNode(wrapper) {
        return wrapper?.data?.attributes?.[0] || wrapper;
    }

    function buildParentsMap(nodeWrapper, parentWrapper = null, level = 0) {
        const node = extractNode(nodeWrapper);
        if (!node) return;

        if (parentWrapper && level <= MAX_LEVELS) {
            parentsMap.set(node.distributor_id, parentWrapper);
        }

        if (node.children && level < MAX_LEVELS) {
            node.children.forEach(child => buildParentsMap(child, nodeWrapper, level + 1));
        }
    }

    buildParentsMap(fullTree);

    function createNodeElement(wrapper, level = 0) {
        const node = extractNode(wrapper);
        if (!node) return document.createElement("div");

        const li = document.createElement("li");
        const nodeDiv = document.createElement("div");
        
        nodeDiv.className = "node";
        nodeDiv.innerHTML = `
            <strong>${node.full_name}</strong><br>
            <small>${node.username}</small><br>
            <em>${node.product_name || 'No product'}</em>
        `;
        
        // Manejar clic para expandir
        nodeDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Si es un nodo terminal o ya tiene hijos mostrados, renderizar normalmente
            if (!node.children || node.children.length === 0 || (li.querySelector('ul') && level < MAX_LEVELS)) {
                renderTree(wrapper);
                return;
            }
            
            // Si no tiene hijos mostrados pero sí tiene hijos en los datos
            if (node.children && !li.querySelector('ul')) {
                // Construir mapa de padres para los nuevos niveles
                buildParentsMap(wrapper, null, level);
                
                // Crear subárbol
                const ul = document.createElement("ul");
                node.children.forEach(child => {
                    const childEl = createNodeElement(child, level + 1);
                    ul.appendChild(childEl);
                });
                
                // Reemplazar el nodo actual con el expandido
                const newLi = createNodeElement(wrapper, level);
                newLi.appendChild(ul);
                li.parentNode.replaceChild(newLi, li);
            }
        });

        li.appendChild(nodeDiv);

        // Solo mostrar hijos si estamos dentro del límite de niveles
        if (node.children && level < MAX_LEVELS - 1) {
            const ul = document.createElement("ul");
            node.children.forEach(child => {
                const childEl = createNodeElement(child, level + 1);
                ul.appendChild(childEl);
            });
            li.appendChild(ul);
        }
        // Mostrar indicador de más niveles si existen
        else if (node.children && node.children.length > 0) {
            const expandIndicator = document.createElement("div");
            expandIndicator.className = "expand-indicator";
            expandIndicator.textContent = `▼ ${node.children.length} más ▼`;
            li.appendChild(expandIndicator);
        }

        return li;
    }

    function renderTree(rootWrapper = currentRoot) {
        const root = extractNode(rootWrapper);
        if (!root) return;

        container.innerHTML = "";
        
        const treeWrapper = document.createElement("div");
        treeWrapper.className = "tree-wrapper";
        
        const ul = document.createElement("ul");
        ul.className = "tree";
        
        const li = createNodeElement(rootWrapper);
        ul.appendChild(li);
        treeWrapper.appendChild(ul);
        container.appendChild(treeWrapper);

        const parent = parentsMap.get(root.distributor_id);
        btnParent.style.display = parent ? "block" : "none";
        btnParent.onclick = parent ? () => renderTree(parent) : null;
        
        currentRoot = rootWrapper;
    }

    renderTree();
});