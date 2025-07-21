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
    function createNodeElement(userWrapper) {
        const node = extractNode(userWrapper);
        if (!node) return document.createTextNode("Nodo inválido");

        const div = document.createElement("div");
        div.className = "node";
        div.textContent = `${node.full_name}\n(${node.username})`;

        div.title = `Usuario: ${node.username}\nProducto: ${node.product_name}\nEstado: ${node.status}`;

        div.addEventListener("click", () => {
            showDetails(node);
            currentRoot = userWrapper;
            renderTree();
        });

        return div;
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

        // Function to build the tree HTML recursively
        function buildTreeHTML(nodeWrapper) {
            const node = extractNode(nodeWrapper);
            if (!node) return null;

            const li = document.createElement("li");
            li.appendChild(createNodeElement(nodeWrapper));

            if (Array.isArray(node.children) && node.children.length > 0) {
                const ul = document.createElement("ul");
                node.children.forEach(childWrapper => {
                    const childLi = buildTreeHTML(childWrapper);
                    if (childLi) ul.appendChild(childLi);
                });
                li.appendChild(ul);
            }
            return li;
        }

        const treeRoot = document.createElement("div");
        treeRoot.className = "tree";

        const ulRoot = document.createElement("ul");
        const liRoot = buildTreeHTML(currentRoot);
        if (liRoot) ulRoot.appendChild(liRoot);

        treeRoot.appendChild(ulRoot);
        container.appendChild(treeRoot);
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
