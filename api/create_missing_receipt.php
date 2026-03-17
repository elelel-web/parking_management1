<?php
// ==================== CREATE MISSING RECEIPT RECORD (FIXED) ====================
// File: api/create_missing_receipt.php
// Fix: Handle missing 'notes' column gracefully

session_start();
header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once '../config.php';

// Get input
$input = json_decode(file_get_contents('php://input'), true);

$vehicleNumber = isset($input['vehicle_number']) ? trim(strtoupper($input['vehicle_number'])) : '';
$vehicleType = isset($input['vehicle_type']) ? $input['vehicle_type'] : '';
$slotNumber = isset($input['slot_number']) ? trim(strtoupper($input['slot_number'])) : '';
$entryTime = isset($input['entry_time']) ? $input['entry_time'] : '';
$exitTime = isset($input['exit_time']) ? $input['exit_time'] : '';
$parkingFee = isset($input['parking_fee']) ? floatval($input['parking_fee']) : 0;
$notes = isset($input['notes']) ? trim($input['notes']) : 'MISSING RECEIPT - MANUAL ENTRY';

// Validate required fields
if (empty($vehicleNumber) || empty($vehicleType) || empty($slotNumber) || empty($entryTime) || empty($exitTime)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate vehicle type
if (!in_array($vehicleType, ['two_wheeler', 'four_wheeler'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid vehicle type']);
    exit;
}

// Validate times
$entry = strtotime($entryTime);
$exit = strtotime($exitTime);
if ($exit <= $entry) {
    echo json_encode(['success' => false, 'message' => 'Exit time must be after entry time']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Check if vehicle exists, if not create it
    $sql = "SELECT id FROM vehicles WHERE vehicle_number = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $vehicleNumber);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $vehicleId = $row['id'];
    } else {
        // Create new vehicle
        $sql = "INSERT INTO vehicles (vehicle_number, vehicle_type) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ss', $vehicleNumber, $vehicleType);
        $stmt->execute();
        $vehicleId = $conn->insert_id;
    }
    $stmt->close();
    
    // Check if slot exists, if not create it
    $sql = "SELECT id FROM parking_slots WHERE slot_number = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $slotNumber);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $slotId = $row['id'];
    } else {
        // Create slot
        $zone = substr($slotNumber, 0, 1); // Get first character (A or B)
        $slotType = ($vehicleType === 'two_wheeler') ? 'two_wheeler' : 'four_wheeler';
        
        $sql = "INSERT INTO parking_slots (slot_number, zone, slot_type, status) VALUES (?, ?, ?, 'available')";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sss', $slotNumber, $zone, $slotType);
        $stmt->execute();
        $slotId = $conn->insert_id;
    }
    $stmt->close();
    
    // Check if 'notes' column exists in parking_records table
    $checkColumn = $conn->query("SHOW COLUMNS FROM parking_records LIKE 'notes'");
    $hasNotesColumn = ($checkColumn->num_rows > 0);
    
    // Create parking record
    if ($hasNotesColumn) {
        // Include notes column
        $sql = "INSERT INTO parking_records (vehicle_id, slot_id, entry_time, exit_time, parking_fee, status, notes) 
                VALUES (?, ?, ?, ?, ?, 'exited', ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iissds', $vehicleId, $slotId, $entryTime, $exitTime, $parkingFee, $notes);
    } else {
        // Without notes column
        $sql = "INSERT INTO parking_records (vehicle_id, slot_id, entry_time, exit_time, parking_fee, status) 
                VALUES (?, ?, ?, ?, ?, 'exited')";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iissd', $vehicleId, $slotId, $entryTime, $exitTime, $parkingFee);
    }
    
    if ($stmt->execute()) {
        $recordId = $conn->insert_id;
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Missing receipt record created successfully',
            'record_id' => $recordId
        ]);
    } else {
        throw new Exception('Failed to create parking record');
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>