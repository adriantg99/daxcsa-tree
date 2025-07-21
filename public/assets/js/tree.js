document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tree-container");
    const details = document.getElementById("node-details");
    const btnParent = document.getElementById("btn-parent");

    let currentRoot = fullTree;
    let parentsMap = new Map(); // Para subir al padre rápido: childId => parentNode

    // Construye un mapa id->nodo para facilitar navegación padre
    function buildParentsMap(node, parent = null) {
        if (node.children) {
            node.children.forEach(child => {
                parentsMap.set(child.distributor_id, node);
                buildParentsMap(child, node);
            });
        }
    }
    buildParentsMap(fullTree);

    // Crea un nodo visual
    function createNode(user) {
        // Aquí extraemos los datos reales:
        const node = user?.data?.attributes?.[0];
        if (!node) return document.createTextNode("Nodo inválido");

        const fullName = node.full_name || "Sin Nombre";
        const username = node.username || "Sin Usuario";

        const div = document.createElement("div");
        div.className = "node";
        div.style.border = "2px solid #007BFF";
        div.style.backgroundColor = "#D0E9FF";
        div.style.padding = "10px";
        div.style.margin = "10px";
        div.style.width = "200px";
        div.style.textAlign = "center";
        div.style.cursor = "pointer";
        div.textContent = `${fullName} (${username})`;

        div.addEventListener("click", () => {
            showDetails(node);
            currentRoot = user; // o currentRoot = node; depende cómo manejas árbol
            renderTree();
        });

        return div;
    }


    // Muestra detalles del nodo seleccionado
    function showDetails(user) {
        details.style.display = "block";
        details.innerHTML = `
      <h2>${user.full_name}</h2>
      <p><strong>Usuario:</strong> ${user.username}</p>
      <p><strong>ID:</strong> ${user.distributor_id}</p>
      <p><strong>Status:</strong> ${user.status}</p>
      <p><strong>Producto:</strong> ${user.product_name}</p>
      <p><strong>Categoría:</strong> ${user.category_name}</p>
      <p><strong>Colocación:</strong> ${user.binary_placement || 'N/A'}</p>
    `;
    }

    // Renderiza el árbol limitado a 2 niveles a partir de currentRoot
    function renderTree() {
        container.innerHTML = "";
        details.style.display = "none";

        if (parentsMap.has(currentRoot.distributor_id)) {
            btnParent.style.display = "inline-block";
        } else {
            btnParent.style.display = "none";
        }

        console.log("Renderizando nodo raíz:", currentRoot.full_name);

        const rootNode = createNode(currentRoot);
        rootNode.classList.add("root-node");
        container.appendChild(rootNode);

        if (currentRoot.children && currentRoot.children.length > 0) {
            const level1 = document.createElement("div");
            level1.className = "level level-1";

            currentRoot.children.forEach(child => {
                const childNode = createNode(child);
                console.log("Nodo hijo:", child.full_name);

                if (child.children && child.children.length > 0) {
                    const level2 = document.createElement("div");
                    level2.className = "level level-2";

                    child.children.forEach(grandChild => {
                        const grandChildNode = createNode(grandChild);
                        level2.appendChild(grandChildNode);
                    });

                    childNode.appendChild(level2);
                }

                // Estilo según binary_placement
                if (child.binary_placement === "Left") {
                    childNode.classList.add("left-child");
                } else if (child.binary_placement === "Right") {
                    childNode.classList.add("right-child");
                }

                level1.appendChild(childNode);
            });

            container.appendChild(level1);
        }
    }

    btnParent.addEventListener("click", () => {
        if (parentsMap.has(currentRoot.distributor_id)) {
            currentRoot = parentsMap.get(currentRoot.distributor_id);
            renderTree();
            details.style.display = "none";
        }
    });

    // Render inicial
    renderTree();
});
