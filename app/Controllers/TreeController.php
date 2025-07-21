<?php
namespace App\Controllers;

class TreeController {
    public function show() {
        $json = file_get_contents(__DIR__ . '/../../public/data/tree.json');
        $tree = json_decode($json, true);
        
        include __DIR__ . '/../Views/tree.php';
    }
}
