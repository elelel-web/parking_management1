<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['date_from']) || empty($data['date_to'])) {
    echo json_encode(['success' => false, 'message' => 'Date range is required']);
    exit;
}

$date_from = $data['date_from'] . ' 00:00:00';
$date_to = $data['date_to'] . ' 23:59:59';

try {
    // Get parking records within date range
    $query = "SELECT pr.*, v.vehicle_number, v.vehicle_type,
                     ps.slot_number,
                     TIMESTAMPDIFF(MINUTE, pr.entry_time, pr.exit_time) as minutes_parked
              FROM parking_records pr
              JOIN vehicles v ON pr.vehicle_id = v.id
              JOIN parking_slots ps ON pr.slot_id = ps.id
              WHERE pr.status = 'exited' 
              AND pr.exit_time BETWEEN ? AND ?
              ORDER BY pr.exit_time DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $records = [];
    $total_revenue = 0;
    
    while ($row = $result->fetch_assoc()) {
        // Calculate duration
        $minutes_parked = $row['minutes_parked'];
        $hours = floor($minutes_parked / 60);
        $minutes = $minutes_parked % 60;
        $row['duration'] = $hours . 'h ' . $minutes . 'm';
        
        $total_revenue += $row['parking_fee'];
        $records[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'records' => $records,
            'total_revenue' => $total_revenue
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