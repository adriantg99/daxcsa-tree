document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tree-container");
    const btnParent = document.getElementById("btn-parent");

    // Create UI controls
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "tree-controls";

    const searchInput = document.createElement("input");
    searchInput.placeholder = "Search distributor...";
    searchInput.className = "tree-search";

    const btnExpandAll = document.createElement("button");
    btnExpandAll.textContent = "Expand Branch";
    btnExpandAll.className = "tree-btn";

    const btnCollapseAll = document.createElement("button");
    btnCollapseAll.textContent = "Reset View";
    btnCollapseAll.className = "tree-btn";

    const searchResultsDiv = document.createElement("div");
    searchResultsDiv.className = "search-results";

    controlsDiv.appendChild(searchInput);
    controlsDiv.appendChild(btnExpandAll);
    controlsDiv.appendChild(btnCollapseAll);
    controlsDiv.appendChild(searchResultsDiv);
    container.before(controlsDiv);

    let currentRoot = fullTree;
    let parentsMap = new Map();
    let allNodesMap = new Map();
    const MAX_INITIAL_LEVELS = 3;

    // Extract node data from wrapper
    function extractNode(wrapper) {
        return wrapper?.data?.attributes?.[0] || wrapper;
    }

    // Build maps of parent-child relationships
    function buildMaps(nodeWrapper, parentWrapper = null, level = 0) {
        const node = extractNode(nodeWrapper);
        if (!node) return;

        if (parentWrapper) {
            parentsMap.set(node.distributor_id, parentWrapper);
        }
        allNodesMap.set(node.distributor_id, nodeWrapper);

        if (node.children) {
            node.children.forEach(child => buildMaps(child, nodeWrapper, level + 1));
        }
    }

    buildMaps(fullTree);

    // Get color based on status
    function getStatusColor(status) {
        const colors = {
            'Active': '#2ecc71',
            'Inactive': '#e74c3c',
            'Pending': '#f39c12',
            'Suspended': '#95a5a6',
            'default': '#3498db'
        };
        return colors[status] || colors['default'];
    }

    // Create node element with proper connectors
    // Modified createNodeElement function
    function createNodeElement(wrapper, level = 0, forceExpand = false) {
        const node = extractNode(wrapper);
        if (!node) return document.createElement("div");

        const li = document.createElement("li");
        const nodeDiv = document.createElement("div");

        // Add connection point element
        const connectionPoint = document.createElement("div");
        connectionPoint.className = "connection-point";
        li.appendChild(connectionPoint);

        // Add vertical connector for all except root
        if (level > 0) {
            const verticalConnector = document.createElement("div");
            verticalConnector.className = "vertical-connector";
            li.appendChild(verticalConnector);
        }

        nodeDiv.className = "node";
        nodeDiv.style.borderColor = getStatusColor(node.status);
        nodeDiv.innerHTML = `
        <div class="node-content">
            <strong>${node.full_name}</strong><br>
            <small>${node.username}</small><br>
            <em>${node.product_name || 'No product'}</em>
        </div>
        <div class="node-status" style="background:${getStatusColor(node.status)}">${node.status}</div>
    `;

        li.appendChild(nodeDiv);

        if (node.children && (forceExpand || level < MAX_INITIAL_LEVELS)) {
            const ul = document.createElement("ul");
            ul.className = "level-" + (level + 1);

            node.children.forEach(child => {
                const childEl = createNodeElement(child, level + 1, forceExpand);
                ul.appendChild(childEl);
            });

            li.appendChild(ul);

            nodeDiv.addEventListener("click", (e) => {
                e.stopPropagation();
                ul.style.display = ul.style.display === 'none' ? 'flex' : 'none';
                updateConnectorLines();
            });
        }
        else if (node.children && node.children.length > 0) {
            const expandIndicator = document.createElement("div");
            expandIndicator.className = "expand-indicator";
            expandIndicator.textContent = `▼ ${node.children.length} children ▼`;

            expandIndicator.addEventListener("click", (e) => {
                e.stopPropagation();
                const ul = document.createElement("ul");
                ul.className = "level-" + (level + 1);

                node.children.forEach(child => {
                    const childEl = createNodeElement(child, level + 1);
                    ul.appendChild(childEl);
                });

                li.replaceChild(ul, expandIndicator);
                updateConnectorLines();
            });

            li.appendChild(expandIndicator);
        }

        return li;
    }

    // Enhanced updateConnectorLines function
    function updateConnectorLines() {
        const nodes = document.querySelectorAll('.tree li');

        nodes.forEach(node => {
            // Force connectors to remain visible
            const before = node;
            const after = node;
            const vertical = node.querySelector('.vertical-connector');

            if (vertical) vertical.style.display = 'block';

            // Mark first and last children
            const parentUl = node.parentNode;
            if (parentUl && parentUl.children) {
                const children = Array.from(parentUl.children);
                node.classList.toggle('first-child', children[0] === node);
                node.classList.toggle('last-child', children[children.length - 1] === node);
            }
        });
    }

    // Render the complete tree
    function renderTree(rootWrapper = currentRoot, forceExpand = false) {
        const root = extractNode(rootWrapper);
        if (!root) return;

        container.innerHTML = "";

        const treeWrapper = document.createElement("div");
        treeWrapper.className = "tree-wrapper";

        const ul = document.createElement("ul");
        ul.className = "tree level-0";

        const li = createNodeElement(rootWrapper, 0, forceExpand);
        ul.appendChild(li);
        treeWrapper.appendChild(ul);
        container.appendChild(treeWrapper);

        const parent = parentsMap.get(root.distributor_id);
        btnParent.style.display = parent ? "block" : "none";
        btnParent.onclick = parent ? () => renderTree(parent) : null;

        currentRoot = rootWrapper;
        updateConnectorLines();
    }

    // Expand all nodes in current branch
    function expandAllNodes(nodeWrapper = currentRoot) {
        renderTree(nodeWrapper, true);
    }

    // Search functionality
    function searchNodes(query) {
        if (!query || query.length < 3) {
            searchResultsDiv.innerHTML = "";
            searchResultsDiv.style.display = "none";
            return;
        }

        const results = [];
        const lowerQuery = query.toLowerCase();

        allNodesMap.forEach((wrapper, id) => {
            const node = extractNode(wrapper);
            if (node.full_name.toLowerCase().includes(lowerQuery) ||
                node.username.toLowerCase().includes(lowerQuery) ||
                (node.distributor_id + "").includes(query)) {
                results.push(node);
            }
        });

        searchResultsDiv.innerHTML = "";

        if (results.length === 0) {
            searchResultsDiv.innerHTML = `<div class="search-result">No results found</div>`;
        } else {
            results.slice(0, 10).forEach(node => {
                const resultDiv = document.createElement("div");
                resultDiv.className = "search-result";
                resultDiv.innerHTML = `
                    <strong>${node.full_name}</strong> (${node.username})<br>
                    <small>ID: ${node.distributor_id} - ${node.status}</small>
                `;
                resultDiv.addEventListener("click", () => {
                    const wrapper = allNodesMap.get(node.distributor_id);
                    if (wrapper) {
                        renderTree(wrapper);
                        searchResultsDiv.style.display = "none";
                        searchInput.value = "";
                    }
                });
                searchResultsDiv.appendChild(resultDiv);
            });
        }

        searchResultsDiv.style.display = results.length ? "block" : "none";
    }

    // Event listeners
    btnExpandAll.addEventListener("click", () => expandAllNodes(currentRoot));
    btnCollapseAll.addEventListener("click", () => renderTree(fullTree));
    searchInput.addEventListener("input", (e) => searchNodes(e.target.value));
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.length >= 3 && searchResultsDiv.children.length) {
            searchResultsDiv.style.display = "block";
        }
    });
    document.addEventListener("click", (e) => {
        if (!controlsDiv.contains(e.target)) {
            searchResultsDiv.style.display = "none";
        }
    });

    // Initial render
    renderTree();
});