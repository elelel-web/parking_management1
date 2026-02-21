<?php
header('Content-Type: application/json');
require_once '../config.php';

try {
    // Get total slots
    $total_slots_query = "SELECT COUNT(*) as total FROM parking_slots";
    $total_result = $conn->query($total_slots_query);
    $total_slots = $total_result->fetch_assoc()['total'];
    
    // Get available slots
    $available_query = "SELECT COUNT(*) as available FROM parking_slots WHERE status = 'available'";
    $available_result = $conn->query($available_query);
    $available_slots = $available_result->fetch_assoc()['available'];
    
    // Get occupied slots
    $occupied_slots = $total_slots - $available_slots;
    
    // Get today's revenue
    $today = date('Y-m-d');
    $revenue_query = "SELECT SUM(parking_fee) as revenue FROM parking_records 
                     WHERE DATE(exit_time) = ? AND status = 'exited'";
    $stmt = $conn->prepare($revenue_query);
    $stmt->bind_param('s', $today);
    $stmt->execute();
    $revenue_result = $stmt->get_result();
    $today_revenue = $revenue_result->fetch_assoc()['revenue'] ?? 0;
    
    // Get currently parked vehicles
    $parked_query = "SELECT pr.*, v.vehicle_number, v.vehicle_type, 
                            ps.slot_number,
                            TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as minutes_parked
                     FROM parking_records pr
                     JOIN vehicles v ON pr.vehicle_id = v.id
                     JOIN parking_slots ps ON pr.slot_id = ps.id
                     WHERE pr.status = 'parked'
                     ORDER BY pr.entry_time DESC";
    $parked_result = $conn->query($parked_query);
    
    $parked_vehicles = [];
    while ($row = $parked_result->fetch_assoc()) {
        $hours = floor($row['minutes_parked'] / 60);
        $minutes = $row['minutes_parked'] % 60;
        $row['duration'] = $hours . 'h ' . $minutes . 'm';
        $parked_vehicles[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_slots' => $total_slots,
            'available_slots' => $available_slots,
            'occupied_slots' => $occupied_slots,
            'today_revenue' => $today_revenue,
            'parked_vehicles' => $parked_vehicles
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