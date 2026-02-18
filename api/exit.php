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
    $conn->begin_transaction();
    
    // Get parking record
    $query = "SELECT pr.*, v.vehicle_number, v.vehicle_type, v.owner_name, v.owner_phone,
                     ps.slot_number, ps.id as slot_id, p.first_hour_rate, p.additional_hour_rate,
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
    
    $parking_data = $result->fetch_assoc();
    
    // Calculate parking fee
    $minutes_parked = $parking_data['minutes_parked'];
    $hours_parked = ceil($minutes_parked / 60);
    
    $parking_fee = $parking_data['first_hour_rate'];
    if ($hours_parked > 1) {
        $parking_fee += ($hours_parked - 1) * $parking_data['additional_hour_rate'];
    }
    
    // Calculate duration
    $hours = floor($minutes_parked / 60);
    $minutes = $minutes_parked % 60;
    $duration = $hours . ' hour' . ($hours != 1 ? 's' : '') . ' ' . $minutes . ' minute' . ($minutes != 1 ? 's' : '');
    
    $exit_time = date('Y-m-d H:i:s');
    
    // Update parking record
    $update_query = "UPDATE parking_records 
                    SET exit_time = ?, parking_fee = ?, status = 'exited' 
                    WHERE id = ?";
    $stmt = $conn->prepare($update_query);
    $stmt->bind_param('sdi', $exit_time, $parking_fee, $parking_data['id']);
    $stmt->execute();
    
    // Update slot status
    $update_slot = "UPDATE parking_slots SET status = 'available' WHERE id = ?";
    $stmt = $conn->prepare($update_slot);
    $stmt->bind_param('i', $parking_data['slot_id']);
    $stmt->execute();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Vehicle exit processed successfully',
        'data' => [
            'record_id' => $parking_data['id'],
            'vehicle_number' => $parking_data['vehicle_number'],
            'vehicle_type' => $parking_data['vehicle_type'],
            'owner_name' => $parking_data['owner_name'],
            'slot_number' => $parking_data['slot_number'],
            'entry_time' => $parking_data['entry_time'],
            'exit_time' => $exit_time,
            'duration' => $duration,
            'parking_fee' => $parking_fee
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>