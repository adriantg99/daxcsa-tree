<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Árbol Genealógico Daxcsa</title>
    <link rel="stylesheet" href="assets/css/style.css" />
</head>

<body>
    <h1>Árbol Genealógico Daxcsa</h1>
    <button id="btn-parent" style="display:none;">⬆ Volver al padre</button>
    <div id="tree-container"></div>
    <div id="node-details" style="display:none;"></div>
    <script>
        const fullTree = <?php echo json_encode($tree, JSON_PRETTY_PRINT | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
        console.log(fullTree);
    </script>
    <script src="assets/js/tree.js"></script>
</body>

</html>