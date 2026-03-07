<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['vehicle_number'])) {
    echo json_encode(['success' => false, 'message' => 'Vehicle number required']);
    exit;
}

$vehicle_number = strtoupper(trim($data['vehicle_number']));

try {
    // EXPLICITLY select pr.id to ensure it's returned
    $stmt = $conn->prepare("SELECT pr.id, pr.vehicle_id, pr.slot_id, pr.entry_time, pr.user_id,
                           v.vehicle_number, v.vehicle_type,
                           ps.slot_number,
                           p.first_hour_rate, p.additional_hour_rate,
                           TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as minutes_parked,
                           u.full_name as processed_by
                           FROM parking_records pr
                           JOIN vehicles v ON pr.vehicle_id = v.id
                           JOIN parking_slots ps ON pr.slot_id = ps.id
                           JOIN pricing p ON p.vehicle_type = v.vehicle_type
                           LEFT JOIN users u ON pr.user_id = u.id
                           WHERE v.vehicle_number = ? AND pr.status = 'parked'
                           LIMIT 1");
    
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Vehicle not found or already exited']);
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

    $hours = floor($minutes_parked / 60);
    $minutes = $minutes_parked % 60;
    $duration = $hours . ' hours ' . $minutes . ' minutes';

    // EXPLICITLY create response with id field
    $response_data = [
        'id' => (int)$vehicle_data['id'],  // ⭐ CRITICAL: Explicit ID field
        'vehicle_id' => (int)$vehicle_data['vehicle_id'],
        'slot_id' => (int)$vehicle_data['slot_id'],
        'user_id' => (int)$vehicle_data['user_id'],
        'vehicle_number' => $vehicle_data['vehicle_number'],
        'vehicle_type' => $vehicle_data['vehicle_type'],
        'slot_number' => $vehicle_data['slot_number'],
        'entry_time' => $vehicle_data['entry_time'],
        'parking_fee' => number_format($parking_fee, 2),
        'duration' => $duration,
        'hours_parked' => $hours_parked,
        'minutes_parked' => $minutes_parked,
        'processed_by' => $vehicle_data['processed_by'] ?? 'Unknown'
    ];

    echo json_encode([
        'success' => true,
        'data' => $response_data
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>