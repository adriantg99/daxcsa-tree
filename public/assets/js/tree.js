document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tree-container");
    const details = document.getElementById("node-details");
    const btnParent = document.getElementById("btn-parent");

    let currentRoot = fullTree; // Tree from php
    let parentsMap = new Map();

    // Extracts the node from the userWrapper
    function extractNode(userWrapper) {
        // If userWrapper is already a node object, return it directly
        if (userWrapper?.data?.attributes?.length > 0) {
            return userWrapper.data.attributes[0];
        }
        // if userWrapper is a simple object, return it directly
        return userWrapper;
    }


    // Builds a map of parents for quick access
    function buildParentsMap(nodeWrapper, parentWrapper = null) {
        const node = extractNode(nodeWrapper);
        if (!node) return;

        if (node.children && node.children.length > 0) {
            node.children.forEach(childWrapper => {
                const childNode = extractNode(childWrapper);
                if (!childNode) return; // <-- Prevent errors for invalid nodes
                parentsMap.set(childNode.distributor_id, nodeWrapper);
                buildParentsMap(childWrapper, nodeWrapper);
            });
        }
    }

    buildParentsMap(fullTree);

    function createNode(userWrapper) {
        const node = extractNode(userWrapper);
        if (!node) return document.createTextNode("Nodo inválido");

        const div = document.createElement("div");
        div.className = "node";
        div.style.border = "2px solid #007BFF";
        div.style.backgroundColor = "#D0E9FF";
        div.style.padding = "10px";
        div.style.margin = "10px";
        div.style.width = "200px";
        div.style.textAlign = "center";
        div.style.cursor = "pointer";

        div.textContent = `${node.full_name} (${node.username})`;

        div.addEventListener("click", () => {
            showDetails(node);
            currentRoot = userWrapper;
            renderTree();
        });

        // Add tooltip with additional information
        div.title = `Usuario: ${node.username}\nProducto: ${node.product_name}\nEstado: ${node.status}`;

        return div;
    }

    function showDetails(node) {
        details.style.display = "block";
        details.innerHTML = `
      <h2>${node.full_name}</h2>
      <p><strong>Usuario:</strong> ${node.username}</p>
      <p><strong>ID:</strong> ${node.distributor_id}</p>
      <p><strong>Status:</strong> ${node.status}</p>
      <p><strong>Producto:</strong> ${node.product_name}</p>
      <p><strong>Categoría:</strong> ${node.category_name}</p>
      <p><strong>Colocación:</strong> ${node.binary_placement || 'N/A'}</p>
    `;
    }

    function renderTree() {
        container.innerHTML = "";
        details.style.display = "none";

        const rootNode = extractNode(currentRoot);
        if (!rootNode) {
            container.textContent = "Nodo raíz inválido";
            return;
        }

        if (parentsMap.has(rootNode.distributor_id)) {
            btnParent.style.display = "inline-block";
        } else {
            btnParent.style.display = "none";
        }

        const rootDiv = createNode(currentRoot);
        rootDiv.classList.add("root-node");
        container.appendChild(rootDiv);

        // validate if rootNode has children
        if (Array.isArray(rootNode.children) && rootNode.children.length > 0) {
            const level1 = document.createElement("div");
            level1.className = "level level-1";
            level1.style.display = "flex";
            level1.style.justifyContent = "center";
            level1.style.marginTop = "20px";
            level1.style.gap = "20px";

            rootNode.children.forEach(childWrapper => {
                const childNode = extractNode(childWrapper);
                if (!childNode) {
                    console.warn("Nodo hijo inválido:", childWrapper);
                    return; // skip invalid nodes
                }

                const childDiv = createNode(childWrapper);

                if (Array.isArray(childNode.children) && childNode.children.length > 0) {
                    const level2 = document.createElement("div");
                    level2.className = "level level-2";
                    level2.style.display = "flex";
                    level2.style.justifyContent = "center";
                    level2.style.marginTop = "10px";
                    level2.style.gap = "15px";
                    level2.style.marginLeft = "20px";

                    childNode.children.forEach(grandChildWrapper => {
                        const grandChildNode = extractNode(grandChildWrapper);
                        if (!grandChildNode) {
                            console.warn("Nieto inválido:", grandChildWrapper);
                            return;
                        }
                        const grandChildDiv = createNode(grandChildWrapper);
                        level2.appendChild(grandChildDiv);
                    });

                    childDiv.appendChild(level2);
                }

                // Set the order based on binary placement
                if (childNode.binary_placement === "Left") {
                    childDiv.style.order = 1;
                } else if (childNode.binary_placement === "Right") {
                    childDiv.style.order = 2;
                }

                level1.appendChild(childDiv);
            });

            container.appendChild(level1);
        }
    }


    btnParent.addEventListener("click", () => {
        const rootNode = extractNode(currentRoot);
        if (rootNode && parentsMap.has(rootNode.distributor_id)) {
            currentRoot = parentsMap.get(rootNode.distributor_id);
            renderTree();
            details.style.display = "none";
        }
    });

    renderTree();
});
