<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$record_id = null;
if (!empty($data['record_id'])) {
    $record_id = $data['record_id'];
} elseif (!empty($data['vehicle_number'])) {
    $vehicle_number = strtoupper(trim($data['vehicle_number']));
    $stmt = $conn->prepare("SELECT pr.id FROM parking_records pr JOIN vehicles v ON pr.vehicle_id = v.id WHERE v.vehicle_number = ? AND pr.status = 'parked' LIMIT 1");
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $record_id = $result->fetch_assoc()['id'];
    }
}

if (!$record_id) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$conn->begin_transaction();

try {
    $stmt = $conn->prepare("SELECT pr.*, v.vehicle_type, ps.id as slot_id, p.first_hour_rate, p.additional_hour_rate, TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as minutes_parked
                           FROM parking_records pr
                           JOIN vehicles v ON pr.vehicle_id = v.id
                           JOIN parking_slots ps ON pr.slot_id = ps.id
                           JOIN pricing p ON p.vehicle_type = v.vehicle_type
                           WHERE pr.id = ? AND pr.status = 'parked'");
    $stmt->bind_param('i', $record_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Record not found or already exited']);
        $conn->rollback();
        exit;
    }

    $record = $result->fetch_assoc();
    $hours_parked = ceil($record['minutes_parked'] / 60);
    $parking_fee = $record['first_hour_rate'];
    if ($hours_parked > 1) {
        $parking_fee += ($hours_parked - 1) * $record['additional_hour_rate'];
    }

    $stmt = $conn->prepare("UPDATE parking_records SET exit_time = NOW(), parking_fee = ?, status = 'exited' WHERE id = ?");
    $stmt->bind_param('di', $parking_fee, $record_id);
    $stmt->execute();

    $stmt = $conn->prepare("UPDATE parking_slots SET status = 'available' WHERE id = ?");
    $stmt->bind_param('i', $record['slot_id']);
    $stmt->execute();

    $stmt = $conn->prepare("SELECT pr.*, v.vehicle_number, v.vehicle_type, ps.slot_number, TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time) as total_minutes, u.full_name as processed_by
                           FROM parking_records pr
                           JOIN vehicles v ON pr.vehicle_id = v.id
                           JOIN parking_slots ps ON pr.slot_id = ps.id
                           LEFT JOIN users u ON pr.user_id = u.id
                           WHERE pr.id = ?");
    $stmt->bind_param('i', $record_id);
    $stmt->execute();
    $exit_data = $stmt->get_result()->fetch_assoc();

    $hours = floor($exit_data['total_minutes'] / 60);
    $minutes = $exit_data['total_minutes'] % 60;
    $exit_data['duration'] = $hours . ' hours ' . $minutes . ' minutes';
    $exit_data['processed_by'] = $exit_data['processed_by'] ?? 'Unknown';

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Exit processed successfully', 'data' => $exit_data]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>