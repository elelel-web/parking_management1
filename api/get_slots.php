<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['vehicle_type'])) {
    echo json_encode(['success' => false, 'message' => 'Vehicle type is required']);
    exit;
}

$vehicle_type = $data['vehicle_type'];

try {
    // Get available slots for the vehicle type
    // Two wheelers can use two_wheeler slots
    // Four wheelers can use four_wheeler slots
    // Any vehicle can use handicapped slots if available
    
    if ($vehicle_type === 'two_wheeler') {
        $query = "SELECT * FROM parking_slots 
                 WHERE status = 'available' AND (slot_type = 'two_wheeler' OR slot_type = 'handicapped')
                 ORDER BY slot_number";
    } else {
        $query = "SELECT * FROM parking_slots 
                 WHERE status = 'available' AND (slot_type = 'four_wheeler' OR slot_type = 'handicapped')
                 ORDER BY slot_number";
    }
    
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