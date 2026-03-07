<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $total_slots = $conn->query("SELECT COUNT(*) as total FROM parking_slots")->fetch_assoc()['total'];
    $available_slots = $conn->query("SELECT COUNT(*) as available FROM parking_slots WHERE status = 'available'")->fetch_assoc()['available'];
    $occupied_slots = $total_slots - $available_slots;
    
    $today = date('Y-m-d');
    $stmt = $conn->prepare("SELECT SUM(parking_fee) as revenue FROM parking_records WHERE DATE(exit_time) = ? AND status = 'exited'");
    $stmt->bind_param('s', $today);
    $stmt->execute();
    $today_revenue = $stmt->get_result()->fetch_assoc()['revenue'] ?? 0;
    
    $parked_result = $conn->query("SELECT pr.*, v.vehicle_number, v.vehicle_type, ps.slot_number,
                                   TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as minutes_parked,
                                   u.full_name as processed_by
                                   FROM parking_records pr
                                   JOIN vehicles v ON pr.vehicle_id = v.id
                                   JOIN parking_slots ps ON pr.slot_id = ps.id
                                   LEFT JOIN users u ON pr.user_id = u.id
                                   WHERE pr.status = 'parked'
                                   ORDER BY pr.entry_time DESC");
    
    $parked_vehicles = [];
    while ($row = $parked_result->fetch_assoc()) {
        $hours = floor($row['minutes_parked'] / 60);
        $minutes = $row['minutes_parked'] % 60;
        $row['duration'] = $hours . 'h ' . $minutes . 'm';
        $row['processed_by'] = $row['processed_by'] ?? 'Unknown';
        $parked_vehicles[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'total_slots' => $total_slots,
            'available_slots' => $available_slots,
            'occupied_slots' => $occupied_slots,
            'today_revenue' => number_format($today_revenue, 2),
            'parked_vehicles' => $parked_vehicles
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>