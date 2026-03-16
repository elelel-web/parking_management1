<?php
session_start();
header('Content-Type: application/json');


if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once '../config.php';

try {
    
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
            AND (pr.notes LIKE '%MISSING RECEIPT%' OR pr.notes LIKE '%MANUAL ENTRY%')
            ORDER BY pr.created_at DESC, pr.exit_time DESC
            LIMIT 100";
    
    $result = $conn->query($sql);
    
    $records = [];
    $totalFee = 0;
    
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
        $totalFee += floatval($row['parking_fee']);
    }
    
    if (count($records) > 0) {
        echo json_encode([
            'success' => true,
            'data' => $records,
            'summary' => [
                'count' => count($records),
                'total' => $totalFee
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No missing receipt records found',
            'data' => [],
            'summary' => [
                'count' => 0,
                'total' => 0
            ]
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>