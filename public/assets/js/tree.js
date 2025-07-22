document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tree-container");
    const btnParent = document.getElementById("btn-parent");
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let currentlyExpandedNode = null;
    // Create UI controls
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "tree-controls";

    const searchInput = document.createElement("input");
    searchInput.placeholder = "Search distributor...";
    searchInput.className = "tree-search";

    /*
    const btnExpandAll = document.createElement("button");
    btnExpandAll.textContent = "Expand Branch";
    btnExpandAll.className = "tree-btn";*/

    const btnCollapseAll = document.createElement("button");
    btnCollapseAll.textContent = "Reset View";
    btnCollapseAll.className = "tree-btn";

    const searchResultsDiv = document.createElement("div");
    searchResultsDiv.className = "search-results";

    controlsDiv.appendChild(searchInput);
    //controlsDiv.appendChild(btnExpandAll);
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

    function countDescendantsBySide(node) {
        let counts = { Left: 0, Right: 0 };

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                if (child.binary_placement === "Left") {
                    counts.Left++;  // corregido
                    const subCounts = countDescendantsBySide(child);
                    counts.Left += subCounts.Left + subCounts.Right;
                }
                else if (child.binary_placement === "Right") {
                    counts.Right++;  // corregido
                    const subCounts = countDescendantsBySide(child);
                    counts.Right += subCounts.Left + subCounts.Right;
                }
            });
        }

        return counts;
    }

    function createNodeElement(wrapper, level = 0, forceExpand = false) {
        const node = extractNode(wrapper);
        if (!node) return document.createElement("div");

        const sideCounts = countDescendantsBySide(node);


        const li = document.createElement("li");
        li.style.position = 'relative';

        const nodeDiv = document.createElement("div");
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
        
        if (!isMobile) {
            const hoverInfo = document.createElement("div");
            hoverInfo.className = "hover-info";
            if (level === 0) {
                hoverInfo.style.top = "calc(0% + 10px)"; 
                hoverInfo.style.bottom = "auto";        
                hoverInfo.style.transform = "translateX(-50%)"; 
            }

            hoverInfo.innerHTML = `
            <div class="hover-info-content">
                <h4>${node.full_name}</h4>
                <p><strong>ID:</strong> ${node.distributor_id}</p>
                <p><strong>Username:</strong> ${node.username}</p>
                <p><strong>Status:</strong> <span style="color:${getStatusColor(node.status)}">${node.status}</span></p>
                <p><strong>Product:</strong> ${node.product_name || 'None'}</p>
                ${node.category_name ? `<p><strong>Category:</strong> ${node.category_name}</p>` : ''}
                ${node.parent_id ? `<p><strong>Parent ID:</strong> ${node.parent_id}</p>` : ''}
                
                <p><strong>Left:</strong> ${sideCounts.Left}</p>
                <p><strong>Right:</strong> ${sideCounts.Right}</p>
            </div>`;

            li.appendChild(hoverInfo); 
         
            li.appendChild(hoverInfo); 
        }
        else {
            const hoverInfo = document.createElement("div");
            hoverInfo.className = "hover-info";

                if (level === 0) {
                hoverInfo.style.top = "calc(0% + 10px)"; 
                hoverInfo.style.bottom = "auto";           
                hoverInfo.style.transform = "translateX(-50%)"; 
            }
            hoverInfo.innerHTML = `
        <div class="hover-info-content">
            <h4>${node.full_name}</h4>
            <p><strong>ID:</strong> ${node.distributor_id}</p>
            <p><strong>Username:</strong> ${node.username}</p>
            <p><strong>Status:</strong> <span style="color:${getStatusColor(node.status)}">${node.status}</span></p>
            <p><strong>Product:</strong> ${node.product_name || 'None'}</p>
            ${node.category_name ? `<p><strong>Category:</strong> ${node.category_name}</p>` : ''}
            ${node.parent_id ? `<p><strong>Parent ID:</strong> ${node.parent_id}</p>` : ''}
            ${node.num_children ? `<p><strong>Children:</strong> ${node.num_children}</p>` : ''}
        </div>`;

            li.appendChild(hoverInfo);

            nodeDiv.addEventListener("click", function (e) {
                e.stopPropagation();

                document.querySelectorAll(".hover-info.mobile-visible").forEach(el => {
                    if (el !== hoverInfo) {
                        el.classList.remove("mobile-visible");
                    }
                });

                hoverInfo.classList.toggle("mobile-visible");
            });

            document.addEventListener("click", function (e) {
                if (!e.target.closest("li") && !e.target.closest(".hover-info")) {
                    document.querySelectorAll(".hover-info.mobile-visible").forEach(el => {
                        el.classList.remove("mobile-visible");
                    });
                }
            });
        }

        li.appendChild(nodeDiv);

        if (level > 0) {
            const verticalConnector = document.createElement("div");
            verticalConnector.className = "vertical-connector";
            li.appendChild(verticalConnector);
        }

        // Manejo de hijos y expansión
        if (node.children && (forceExpand || level < MAX_INITIAL_LEVELS)) {

            const ul = document.createElement("ul");
            ul.className = "level-" + (level + 1);

            node.children.forEach(child => {
                const childEl = createNodeElement(child, level + 1, forceExpand);
                ul.appendChild(childEl);
            });

            li.appendChild(ul);

            if (!isMobile) {
                nodeDiv.addEventListener("click", (e) => {
                    e.stopPropagation();
                    ul.style.display = ul.style.display === 'none' ? 'flex' : 'none';
                    updateConnectorLines();
                });
            }
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
    document.addEventListener("mouseover", function (e) {
        // Desktop only
        if (!isMobile && e.target.closest(".node")) {
            document.querySelectorAll(".hover-info").forEach(info => {
                info.style.opacity = "0";
                info.style.visibility = "hidden";
            });

            const node = e.target.closest(".node");
            const hover = node.parentElement.querySelector(".hover-info");
            if (hover) {
                hover.style.opacity = "1";
                hover.style.visibility = "visible";
            }
        }
    });

    document.addEventListener("mouseout", function (e) {
        // Desktop only
        if (!isMobile && e.target.closest(".node")) {
            const node = e.target.closest(".node");
            const hover = node.parentElement.querySelector(".hover-info");
            if (hover) {
                hover.style.opacity = "0";
                hover.style.visibility = "hidden";
            }
        }
    });

    const style = document.createElement("style");
    style.textContent = `
    
    .hover-info {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        width: 280px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 15px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        pointer-events: none;
        white-space: normal; 
    }
    

  .hover-info.mobile-visible {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(-50%) translateY(-5px);
    pointer-events: auto;
}
`;
    document.head.appendChild(style);

    // Enhanced updateConnectorLines function
    function updateConnectorLines() {
        const nodes = document.querySelectorAll('.tree li');

        nodes.forEach(node => {
            // Hide all vertical connectors first
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

        if (isMobile) {
            container.style.overflowX = 'auto';
            container.style.maxWidth = '100vw';
            if (forceExpand) {
                // Limit expansion depth on mobile
                forceExpand = (level) => level < 3;
            }
        }

        if (currentlyExpandedNode && currentlyExpandedNode !== rootWrapper) {
            const previouslyExpandedUl = document.querySelector('.currently-expanded');
            if (previouslyExpandedUl) {
                previouslyExpandedUl.style.display = 'none';
                previouslyExpandedUl.classList.remove('currently-expanded');
            }
        }

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

        currentlyExpandedNode = rootWrapper;

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
    /* btnExpandAll.addEventListener("click", () => expandAllNodes(currentRoot));*/
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