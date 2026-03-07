<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $result = $conn->query("SELECT ps.*, v.vehicle_number, pr.entry_time, TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as minutes_parked
                           FROM parking_slots ps
                           LEFT JOIN parking_records pr ON ps.id = pr.slot_id AND pr.status = 'parked'
                           LEFT JOIN vehicles v ON pr.vehicle_id = v.id
                           ORDER BY ps.slot_number ASC");

    $slots = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['minutes_parked']) {
            $hours = floor($row['minutes_parked'] / 60);
            $minutes = $row['minutes_parked'] % 60;
            $row['duration'] = $hours . 'h ' . $minutes . 'm';
        }
        $slots[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $slots]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>