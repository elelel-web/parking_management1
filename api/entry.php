<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

$vehicle_number = strtoupper(trim($data['vehicle_number']));
$vehicle_type = $data['vehicle_type'];
$slot_id = intval($data['slot_id']);

// Validate inputs
if (empty($vehicle_number) || empty($vehicle_type) || empty($slot_id)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    $conn->begin_transaction();
    
    // Check if vehicle is already parked
    $check_query = "SELECT pr.id FROM parking_records pr 
                    JOIN vehicles v ON pr.vehicle_id = v.id 
                    WHERE v.vehicle_number = ? AND pr.status = 'parked'";
    $stmt = $conn->prepare($check_query);
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Vehicle is already parked']);
        exit;
    }
    
    // Check if slot is available
    $slot_query = "SELECT slot_number FROM parking_slots WHERE id = ? AND status = 'available'";
    $stmt = $conn->prepare($slot_query);
    $stmt->bind_param('i', $slot_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Selected slot is not available']);
        exit;
    }
    
    $slot_data = $result->fetch_assoc();
    $slot_number = $slot_data['slot_number'];
    
    // Generate random ticket number (8 digits)
    $ticket_number = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    
    // Insert or update vehicle (with dummy owner data since DB requires it)
    $vehicle_id = null;
    $check_vehicle = "SELECT id FROM vehicles WHERE vehicle_number = ?";
    $stmt = $conn->prepare($check_vehicle);
    $stmt->bind_param('s', $vehicle_number);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $owner_name = "N/A";
    $owner_phone = "N/A";
    
    if ($result->num_rows > 0) {
        $vehicle_id = $result->fetch_assoc()['id'];
        // Update vehicle details
        $update_query = "UPDATE vehicles SET vehicle_type = ?, owner_name = ?, owner_phone = ? WHERE id = ?";
        $stmt = $conn->prepare($update_query);
        $stmt->bind_param('sssi', $vehicle_type, $owner_name, $owner_phone, $vehicle_id);
        $stmt->execute();
    } else {
        // Insert new vehicle
        $insert_query = "INSERT INTO vehicles (vehicle_number, vehicle_type, owner_name, owner_phone) 
                        VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($insert_query);
        $stmt->bind_param('ssss', $vehicle_number, $vehicle_type, $owner_name, $owner_phone);
        $stmt->execute();
        $vehicle_id = $conn->insert_id;
    }
    
    // Create parking record
    $entry_time = date('Y-m-d H:i:s');
    $record_query = "INSERT INTO parking_records (vehicle_id, slot_id, entry_time, status) 
                    VALUES (?, ?, ?, 'parked')";
    $stmt = $conn->prepare($record_query);
    $stmt->bind_param('iis', $vehicle_id, $slot_id, $entry_time);
    $stmt->execute();
    
    // Update slot status
    $update_slot = "UPDATE parking_slots SET status = 'occupied' WHERE id = ?";
    $stmt = $conn->prepare($update_slot);
    $stmt->bind_param('i', $slot_id);
    $stmt->execute();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Vehicle parked successfully',
        'ticket' => [
            'ticket_number' => $ticket_number,
            'vehicle_number' => $vehicle_number,
            'vehicle_type' => $vehicle_type,
            'slot_number' => $slot_number,
            'entry_time' => $entry_time
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