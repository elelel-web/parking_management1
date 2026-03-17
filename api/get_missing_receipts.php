<?php
// ==================== GET MISSING RECEIPTS (COMPLETE FIX) ====================
// File: api/get_missing_receipts.php
// Fix: Shows ALL manually created records

session_start();
header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once '../config.php';

try {
    // Check if 'notes' column exists
    $checkColumn = $conn->query("SHOW COLUMNS FROM parking_records LIKE 'notes'");
    $hasNotesColumn = ($checkColumn->num_rows > 0);
    
    // Get ALL exited records (will show all your manually created ones)
    if ($hasNotesColumn) {
        $sql = "SELECT 
                    pr.id,
                    v.vehicle_number,
                    v.vehicle_type,
                    ps.slot_number,
                    pr.entry_time,
                    pr.exit_time,
                    pr.parking_fee,
                    pr.status,
                    pr.notes,
                    CONCAT(
                        FLOOR(TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time) / 60), 'h ',
                        MOD(TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time), 60), 'm'
                    ) AS duration
                FROM parking_records pr
                JOIN vehicles v ON pr.vehicle_id = v.id
                JOIN parking_slots ps ON pr.slot_id = ps.id
                WHERE pr.status = 'exited'
                AND (
                    pr.notes LIKE '%MISSING RECEIPT%' 
                    OR pr.notes LIKE '%MANUAL ENTRY%'
                    OR pr.notes LIKE '%Customer%'
                    OR pr.notes LIKE '%Emergency%'
                    OR pr.notes IS NOT NULL
                )
                ORDER BY pr.id DESC
                LIMIT 100";
    } else {
        // Without notes - show recent exited records
        $sql = "SELECT 
                    pr.id,
                    v.vehicle_number,
                    v.vehicle_type,
                    ps.slot_number,
                    pr.entry_time,
                    pr.exit_time,
                    pr.parking_fee,
                    pr.status,
                    CONCAT(
                        FLOOR(TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time) / 60), 'h ',
                        MOD(TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time), 60), 'm'
                    ) AS duration
                FROM parking_records pr
                JOIN vehicles v ON pr.vehicle_id = v.id
                JOIN parking_slots ps ON pr.slot_id = ps.id
                WHERE pr.status = 'exited'
                ORDER BY pr.id DESC
                LIMIT 100";
    }
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception($conn->error);
    }
    
    $records = [];
    $totalFee = 0;
    
    while ($row = $result->fetch_assoc()) {
        // Add empty notes if column doesn't exist
        if (!$hasNotesColumn) {
            $row['notes'] = '';
        }
        $records[] = $row;
        $totalFee += floatval($row['parking_fee']);
    }
    
    // Return data even if empty
    echo json_encode([
        'success' => true,
        'data' => $records,
        'summary' => [
            'count' => count($records),
            'total' => $totalFee
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'data' => [],
        'summary' => ['count' => 0, 'total' => 0]
    ]);
}

$conn->close();
?>