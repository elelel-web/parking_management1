<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['vehicle_number']) || empty($data['vehicle_type']) || empty($data['slot_id'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

$vehicle_number = strtoupper(trim($data['vehicle_number']));
$vehicle_type = $data['vehicle_type'];
$slot_id = $data['slot_id'];

$conn->begin_transaction();

try {
    // Check if vehicle already parked
    $stmt = $conn->prepare("SELECT id FROM parking_records WHERE vehicle_id IN (SELECT id FROM vehicles WHERE vehicle_number = ?) AND status = 'parked' LIMIT 1");
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Vehicle is already parked']);
        $conn->rollback();
        exit;
    }

    // Check slot available
    $stmt = $conn->prepare("SELECT status FROM parking_slots WHERE id = ? AND status = 'available'");
    $stmt->bind_param('i', $slot_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Slot not available']);
        $conn->rollback();
        exit;
    }

    // Get or create vehicle
    $stmt = $conn->prepare("SELECT id FROM vehicles WHERE vehicle_number = ?");
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $vehicle_id = $result->fetch_assoc()['id'];
        $stmt = $conn->prepare("UPDATE vehicles SET vehicle_type = ?, updated_at = NOW() WHERE id = ?");
        $stmt->bind_param('si', $vehicle_type, $vehicle_id);
        $stmt->execute();
    } else {
        $stmt = $conn->prepare("INSERT INTO vehicles (vehicle_number, vehicle_type) VALUES (?, ?)");
        $stmt->bind_param('ss', $vehicle_number, $vehicle_type);
        $stmt->execute();
        $vehicle_id = $conn->insert_id;
    }

    // Insert parking record
    $stmt = $conn->prepare("INSERT INTO parking_records (user_id, vehicle_id, slot_id, entry_time, status) VALUES (?, ?, ?, NOW(), 'parked')");
    $stmt->bind_param('iii', $user_id, $vehicle_id, $slot_id);
    $stmt->execute();
    $record_id = $conn->insert_id;

    // Update slot
    $stmt = $conn->prepare("UPDATE parking_slots SET status = 'occupied' WHERE id = ?");
    $stmt->bind_param('i', $slot_id);
    $stmt->execute();

    // Get ticket info
    $stmt = $conn->prepare("SELECT pr.id, pr.entry_time, v.vehicle_number, v.vehicle_type, ps.slot_number, u.full_name as processed_by
                           FROM parking_records pr
                           JOIN vehicles v ON pr.vehicle_id = v.id
                           JOIN parking_slots ps ON pr.slot_id = ps.id
                           JOIN users u ON pr.user_id = u.id
                           WHERE pr.id = ?");
    $stmt->bind_param('i', $record_id);
    $stmt->execute();
    $ticket = $stmt->get_result()->fetch_assoc();
    $ticket['ticket_number'] = str_replace('-', '', $ticket['slot_number']);

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Vehicle parked successfully', 'ticket' => $ticket]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>