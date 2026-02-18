<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['vehicle_number'])) {
    echo json_encode(['success' => false, 'message' => 'Vehicle number is required']);
    exit;
}

$vehicle_number = strtoupper(trim($data['vehicle_number']));

try {
    $query = "SELECT pr.*, v.vehicle_number, v.vehicle_type, v.owner_name, v.owner_phone,
                     ps.slot_number, p.first_hour_rate, p.additional_hour_rate,
                     TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as minutes_parked
              FROM parking_records pr
              JOIN vehicles v ON pr.vehicle_id = v.id
              JOIN parking_slots ps ON pr.slot_id = ps.id
              JOIN pricing p ON p.vehicle_type = v.vehicle_type
              WHERE v.vehicle_number = ? AND pr.status = 'parked'";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Vehicle not found or already exited'
        ]);
        exit;
    }
    
    $vehicle_data = $result->fetch_assoc();
    
    // Calculate parking fee
    $minutes_parked = $vehicle_data['minutes_parked'];
    $hours_parked = ceil($minutes_parked / 60);
    
    $parking_fee = $vehicle_data['first_hour_rate'];
    if ($hours_parked > 1) {
        $parking_fee += ($hours_parked - 1) * $vehicle_data['additional_hour_rate'];
    }
    
    // Calculate duration
    $hours = floor($minutes_parked / 60);
    $minutes = $minutes_parked % 60;
    $duration = $hours . ' hour' . ($hours != 1 ? 's' : '') . ' ' . $minutes . ' minute' . ($minutes != 1 ? 's' : '');
    
    $vehicle_data['parking_fee'] = $parking_fee;
    $vehicle_data['duration'] = $duration;
    
    echo json_encode([
        'success' => true,
        'data' => $vehicle_data
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>