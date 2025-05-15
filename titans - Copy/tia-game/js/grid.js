/**
 * grid.js
 * Handles the rendering and updating of the game grid UI
 */

/**
 * Initializes the grid UI elements and sets up event listeners for node interactions
 */
function initializeGrid() {
    // Get all node elements
    const nodeElements = document.querySelectorAll('.node');
    
    // Add click event listeners to each node
    nodeElements.forEach(node => {
        node.addEventListener('click', function() {
            const nodeId = this.id;
            handleNodeClick(nodeId);
        });
    });
    
    // Initialize node appearance based on starting game state
    updateGridDisplay();

    // Draw edge lines
    drawEdgeLines();
}

/**
 * Calculates the center coordinates of a node relative to the game board.
 * @param {string} nodeId - The ID of the node.
 * @returns {{x: number, y: number}} - The x and y coordinates of the node's center.
 */
function getNodeCenter(nodeId) {
    const nodeElement = document.getElementById(nodeId);
    const gameBoardElement = document.querySelector('.game-board');

    if (!nodeElement || !gameBoardElement) {
        console.error(`Cannot find node ${nodeId} or game board for coordinate calculation.`);
        return { x: 0, y: 0 };
    }

    const gameBoardRect = gameBoardElement.getBoundingClientRect();
    const nodeRect = nodeElement.getBoundingClientRect();

    // Calculate center relative to the game board's top-left corner
    const x = nodeRect.left + nodeRect.width / 2 - gameBoardRect.left;
    const y = nodeRect.top + nodeRect.height / 2 - gameBoardRect.top;

    return { x, y };
}

/**
 * Draws lines between connected nodes on the SVG canvas.
 */
function drawEdgeLines() {
    const svg = document.getElementById('edge-lines-svg');
    if (!svg) {
        console.error("SVG element #edge-lines-svg not found!");
        return;
    }

    // Clear existing lines
    svg.innerHTML = ''; 

    const drawnEdges = new Set(); // To avoid drawing the same edge twice (e.g., A-B and B-A)

    for (const nodeId1 in CONFIG.adjacencyList) {
        const connectedNodes = CONFIG.adjacencyList[nodeId1];
        const center1 = getNodeCenter(nodeId1);

        connectedNodes.forEach(nodeId2 => {
            // Always create a unique, sorted key for the edge
            const edgeKey = [nodeId1, nodeId2].sort().join('-');

            if (!drawnEdges.has(edgeKey)) {
                const center2 = getNodeCenter(nodeId2);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', center1.x);
                line.setAttribute('y1', center1.y);
                line.setAttribute('x2', center2.x);
                line.setAttribute('y2', center2.y);
                line.classList.add('edge-line');
                svg.appendChild(line);
                // 2. Get the edge weight from CONFIG
                // Ensure CONFIG.edgeWeights has entries for all edges in your new adjacencyList
                // The keys in edgeWeights should also be sorted, e.g., "inner-0-middle-0"
                const edgeWeight = CONFIG.edgeWeights[edgeKey];

                // Only display weight if it's defined (and not, say, 0 or null if you prefer)
                if (edgeWeight !== undefined) {
                    // 3. Calculate the midpoint of the edge for placing the text
                    const midX = (center1.x + center2.x) / 2;
                    const midY = (center1.y + center2.y) / 2;
                    // 2. Calculate the direction vector from center1 to center2
                    const dx = center2.x - center1.x;
                    const dy = center2.y - center1.y;
                    // Perpendicular vector: (-dy, dx)
                    const length = Math.sqrt(dx*dx + dy*dy);
                    const offset = 20;
                    // 4. Normalize and apply offset
                    const normX = -dy / length;
                    const normY = dx / length;
                    function isZeroFiveEdge(edgeKey) {
                        // Works for outer, middle, and inner circuits
                        return (
                            edgeKey === "outer-0-outer-5" ||
                            edgeKey === "middle-0-middle-5" ||
                            edgeKey === "inner-0-inner-5"
                        );
                    }
                    const isFiveZero = isZeroFiveEdge(edgeKey);
                    const sign = isFiveZero ? -1 : 1;
                    const labelX = midX + normX * offset * sign;
                    const labelY = midY + normY * offset * sign;
                    // 4. Create the SVG <text> element for the weight
                    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    textElement.setAttribute('x', labelX);
                    textElement.setAttribute('y', labelY);

                    // Adjust styling as needed for visibility and aesthetics
                    textElement.setAttribute('fill', '#FFFFFF'); // Example: White text
                    textElement.setAttribute('font-size', '30px'); // Adjust as needed
                    textElement.setAttribute('font-family', 'Arial, sans-serif');
                    textElement.setAttribute('text-anchor', 'middle'); // Horizontally center the text
                    textElement.setAttribute('dominant-baseline', 'middle'); // Vertically center the text
                    // Add a class if you want to style it further via CSS
                    // textElement.classList.add('edge-weight-label');

                    textElement.textContent = edgeWeight.toString();
                    svg.appendChild(textElement);
                }
                drawnEdges.add(edgeKey);
            }
        });
    }
    console.log('Edge lines drawn.');
}

/**
 * Updates the visual appearance of all nodes based on current game state
 */
function updateGridDisplay() {
    // For each node in the game state, update its display
    Object.keys(gameState.board).forEach(nodeId => {
        updateNodeDisplay(nodeId);
    });
    
    // Highlight unlocked circuits
    highlightUnlockedCircuits();
}

/**
 * Updates the visual appearance of a single node
 * @param {string} nodeId - The ID of the node to update
 */
function updateNodeDisplay(nodeId) {
    const nodeElement = document.getElementById(nodeId);
    if (!nodeElement) return;
    
    // Clear existing state classes
    nodeElement.classList.remove('red-occupied', 'blue-occupied', 'selected', 'valid-move', 'invalid');
    
    // Apply appropriate class based on node state
    const occupiedBy = gameState.board[nodeId];
    if (occupiedBy) {
        nodeElement.classList.add(`${occupiedBy}-occupied`);
    }
    
    // Highlight selected node
    if (gameState.selectedNode === nodeId) {
        nodeElement.classList.add('selected');
    }
}

/**
 * Highlights nodes that are valid moves from a selected node
 * @param {string} selectedNodeId - The ID of the selected node
 */
function highlightValidMoves(selectedNodeId) {
    // Clear any existing highlights first
    clearAllHighlights();
    
    // If we're in movement phase and have a selected node
    if (gameState.currentPhase === 'movement' && selectedNodeId) {
        // Get adjacent nodes from the adjacency list
        const adjacentNodes = CONFIG.adjacencyList[selectedNodeId] || [];
        
        // Highlight each adjacent empty node as a valid move
        adjacentNodes.forEach(nodeId => {
            if (!gameState.board[nodeId]) { // If node is empty
                const nodeElement = document.getElementById(nodeId);
                if (nodeElement) {
                    nodeElement.classList.add('valid-move');
                }
            }
        });
    }
}

/**
 * Removes all highlighting from nodes
 */
function clearAllHighlights() {
    const nodeElements = document.querySelectorAll('.node');
    nodeElements.forEach(node => {
        node.classList.remove('valid-move', 'invalid');
    });
}

/**
 * Visually highlights the circuits that are unlocked for titan placement
 */
function highlightUnlockedCircuits() {
    // First, remove highlighting from all circuits
    CONFIG.circuits.forEach(circuit => {
        const circuitElement = document.getElementById(`${circuit}-circuit`);
        if (circuitElement) {
            circuitElement.classList.remove('unlocked');
        }
    });
    
    // Then highlight only the unlocked circuits
    gameState.unlockedCircuits.forEach(circuit => {
        const circuitElement = document.getElementById(`${circuit}-circuit`);
        if (circuitElement) {
            circuitElement.classList.add('unlocked');
        }
    });
}

/**
 * Visually highlights the edges controlled by players
 */
function highlightControlledEdges() {
    // This is a placeholder for edge highlighting
    // Will be implemented in a future iteration when the visual representation
    // of edges is added to the UI

    // For now, we can log the controlled edges
    // console.log("Red controlled edges:", gameState.controlledEdges.red);
    // console.log("Blue controlled edges:", gameState.controlledEdges.blue);
}

/**
 * Creates a visual effect for a successful move or placement
 * @param {string} nodeId - The ID of the node to animate
 */
function animateNodeAction(nodeId) {
    const nodeElement = document.getElementById(nodeId);
    if (!nodeElement) return;
    
    // Simple animation effect - add and remove a class
    nodeElement.classList.add('animated');
    setTimeout(() => {
        nodeElement.classList.remove('animated');
    }, 500);
}
