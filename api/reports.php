<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['date_from']) || empty($data['date_to'])) {
    echo json_encode(['success' => false, 'message' => 'Date range required']);
    exit;
}

// Get dates from input (format: YYYY-MM-DD from HTML date input)
$date_from = $data['date_from'] . ' 00:00:00';
$date_to = $data['date_to'] . ' 23:59:59';

try {
    // Query using your exact database structure
    $stmt = $conn->prepare("SELECT 
                           pr.id,
                           pr.entry_time,
                           pr.exit_time,
                           pr.parking_fee,
                           pr.status,
                           v.vehicle_number,
                           v.vehicle_type,
                           ps.slot_number,
                           TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time) as minutes_parked,
                           u.full_name as processed_by
                           FROM parking_records pr
                           JOIN vehicles v ON pr.vehicle_id = v.id
                           JOIN parking_slots ps ON pr.slot_id = ps.id
                           LEFT JOIN users u ON pr.user_id = u.id
                           WHERE pr.status = 'exited' 
                           AND pr.exit_time BETWEEN ? AND ?
                           ORDER BY pr.exit_time DESC");
    
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $result = $stmt->get_result();

    $records = [];
    $total_revenue = 0;

    while ($row = $result->fetch_assoc()) {
        // Calculate duration
        $hours = floor($row['minutes_parked'] / 60);
        $minutes = $row['minutes_parked'] % 60;
        $row['duration'] = $hours . 'h ' . $minutes . 'm';
        
        // Process user info
        $row['processed_by'] = $row['processed_by'] ?? 'Unknown';
        
        // Add to total
        $total_revenue += $row['parking_fee'];
        
        $records[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $records,
        'summary' => [
            'total_transactions' => count($records),
            'total_revenue' => number_format($total_revenue, 2)
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>