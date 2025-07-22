document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tree-container");
    const btnParent = document.getElementById("btn-parent");
    

    let currentRoot = fullTree;
    let parentsMap = new Map();

    function extractNode(wrapper) {
        if (wrapper?.data?.attributes?.length) {
            return wrapper.data.attributes[0];
        }
        return wrapper;
    }

    function buildParentsMap(nodeWrapper, parentWrapper = null) {
        const node = extractNode(nodeWrapper);
        if (!node) return;

        if (node.children && node.children.length > 0) {
            node.children.forEach(childWrapper => {
                const childNode = extractNode(childWrapper);
                if (!childNode) return;
                parentsMap.set(childNode.distributor_id, nodeWrapper);
                buildParentsMap(childWrapper, nodeWrapper);
            });
        }
    }

    buildParentsMap(fullTree);

    function createNodeElement(wrapper, level) {
        const user = extractNode(wrapper);
        const li = document.createElement("li");

        const nodeDiv = document.createElement("div");
        nodeDiv.className = "node";
        nodeDiv.textContent = `${user.full_name} (${user.username})`;
        nodeDiv.title = `Producto: ${user.product_name}\nStatus: ${user.status}`;

        nodeDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            renderTree(wrapper);
        });

        li.appendChild(nodeDiv);

        if (user.children && level < 3) {
            const ul = document.createElement("ul");
            user.children.forEach(childWrapper => {
                const childNode = extractNode(childWrapper);
                if (!childNode) return;
                const childEl = createNodeElement(childWrapper, level + 1);
                ul.appendChild(childEl);
            });
            li.appendChild(ul);
        }

        return li;
    }

    function renderTree(rootWrapper = currentRoot) {
        const root = extractNode(rootWrapper);
        if (!root) return;

        container.innerHTML = "";

        const ul = document.createElement("ul");
        ul.className = "tree";

        const li = createNodeElement(rootWrapper, 0);
        ul.appendChild(li);
        container.appendChild(ul);

        const parent = parentsMap.get(root.distributor_id);
        if (parent) {
            btnParent.style.display = "inline-block";
            btnParent.onclick = () => renderTree(parent);
        } else {
            btnParent.style.display = "none";
        }

        currentRoot = rootWrapper;
    }

    renderTree();
});
