<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['vehicle_type'])) {
    echo json_encode(['success' => false, 'message' => 'Vehicle type required']);
    exit;
}

$vehicle_type = $data['vehicle_type'];

try {
    $stmt = $conn->prepare("SELECT id, slot_number, slot_type FROM parking_slots WHERE slot_type = ? AND status = 'available' ORDER BY slot_number ASC");
    $stmt->bind_param('s', $vehicle_type);
    $stmt->execute();
    $result = $stmt->get_result();

    $slots = [];
    while ($row = $result->fetch_assoc()) {
        $slots[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $slots]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>