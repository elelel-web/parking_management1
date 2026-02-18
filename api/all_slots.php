<?php
header('Content-Type: application/json');
require_once '../config.php';

try {
    $query = "SELECT * FROM parking_slots ORDER BY slot_number";
    $result = $conn->query($query);
    
    $slots = [];
    while ($row = $result->fetch_assoc()) {
        $slots[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $slots
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>