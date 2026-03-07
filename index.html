<?php require_once 'auth_check.php'; ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vehicle Parking Management System</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>



    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="logo">
                <i class="fas fa-parking"></i>
                <h1>Vehicle Parking Management</h1>
            </div>
            <div class="header-actions">
                <button class="keyboard-help-btn" id="show-shortcuts">
                    <i class="fas fa-keyboard"></i> Keyboard Shortcuts
                </button>
            </div>
            <nav class="nav-tabs">
                <button class="tab-btn active" data-tab="dashboard">
                    <i class="fas fa-dashboard"></i> Dashboard
             
                <button class="tab-btn" data-tab="manage-vehicles">
                    <i class="fas fa-car"></i> Manage Vehicles
                </button>
                <button class="tab-btn" data-tab="slots">
                    <i class="fas fa-th"></i> Parking Layout
                </button>
                <button class="tab-btn" data-tab="reports">
                    <i class="fas fa-chart-bar"></i> Reports
                </button>

                <div class="nav-user-section">
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($current_full_name); ?></span>
                </div>
                <button class="btn-logout" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
            </nav>
        </header>


        


        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-content active">
            <h2>Dashboard Overview</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-parking"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="total-slots">0</h3>
                        <p>Total Slots</p>
                    </div>
                </div>
                <div class="stat-card available">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="available-slots">0</h3>
                        <p>Available Slots</p>
                    </div>
                </div>
                <div class="stat-card occupied">
                    <div class="stat-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="occupied-slots">0</h3>
                        <p>Occupied Slots</p>
                    </div>
                </div>
                <div class="stat-card revenue">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="total-revenue">₱0.00</h3>
                        <p>Today's Revenue</p>
                    </div>
                </div>
            </div>

            <div class="current-parking">
                <h3>Currently Parked Vehicles</h3>
                <div class="table-container">
                    <table id="parked-vehicles-table">
                        <thead>
                            <tr>
                                <th>Slot</th>
                                <th>Vehicle Number</th>
                                <th>Type</th>
                                <th>Entry Time</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody id="parked-vehicles-body">
                            <tr>
                                <td colspan="5" class="no-data">No vehicles currently parked</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Manage Vehicles Tab -->
        <div id="manage-vehicles" class="tab-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Manage Vehicles</h2>
        
        <!-- ⭐ ADD BUTTON HERE - aligned right -->
        <button class="entry_button" id="open-entry-modal" data-tab="entry">
            <i class="fas fa-sign-in-alt"></i> Vehicle Entry
        </button>
    </div>

            

           
            <!-- Search and Exit Section -->
            <div class="manage-vehicle-section">
                <div class="section-header">
                       </button>
                
                    <h3><i class="fas fa-search"></i> Search & Exit Vehicle</h3>
                </div>
                
                <div class="form-container">
                    <form id="exit-form">
                        <div class="form-group">
                            <label for="exit-vehicle-number">Vehicle Number *</label>
                            <input type="text" id="exit-vehicle-number" name="vehicle_number" placeholder="Enter vehicle number" required>
                        </div>
                        <button type="button" class="btn btn-secondary" id="search-vehicle">
                            <i class="fas fa-search"></i> Search Vehicle
                        </button>
                    </form>

                    <div id="vehicle-info" class="vehicle-info" style="display: none;">
                        <h3>Vehicle Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Vehicle Number:</strong>
                                <span id="info-vehicle-number"></span>
                            </div>
                            <div class="info-item">
                                <strong>Type:</strong>
                                <span id="info-vehicle-type"></span>
                            </div>
                            <div class="info-item">
                                <strong>Slot Number:</strong>
                                <span id="info-slot-number"></span>
                            </div>
                            <div class="info-item">
                                <strong>Entry Time:</strong>
                                <span id="info-entry-time"></span>
                            </div>
                            <div class="info-item">
                                <strong>Duration:</strong>
                                <span id="info-duration"></span>
                            </div>
                            <div class="info-item total-fee">
                                <strong>Total Parking Fee:</strong>
                                <span id="info-parking-fee"></span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger" id="process-exit">
                            <i class="fas fa-sign-out-alt"></i> Process Exit & Print Receipt
                        </button>
                    </div>
                </div>
            </div>

            <!-- All Parked Vehicles Section -->
            <div class="manage-vehicle-section">
                <div class="section-header">
                    <h3><i class="fas fa-list"></i> Currently Parked Vehicles</h3>
                    <button class="btn btn-primary btn-small" id="refresh-parked-vehicles">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                
                <div class="table-container">
                    <table id="all-parked-vehicles-table">
                        <thead>
                            <tr>
                                <th style="width: 10%;">Slot</th>
                                <th style="width: 20%;">Vehicle Number</th>
                                <th style="width: 15%;">Type</th>
                                <th style="width: 25%;">Entry Time</th>
                                <th style="width: 15%;">Duration</th>
                                <th style="width: 15%;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="all-parked-vehicles-body">
                            <tr>
                                <td colspan="8" class="no-data">Loading...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Vehicle Entry Modal -->
            <div id="entry-modal" class="modal">
                <div class="modal-content">
                    <span class="close" id="close-entry-modal">&times;</span>
                    <h2><i class="fas fa-sign-in-alt"></i> Vehicle Entry</h2>

                    <div class="form-container">
                        <form id="entry-form">
                            <div class="form-group">
                                <label for="vehicle-number">Vehicle Number *</label>
                                <input type="text" id="vehicle-number" name="vehicle_number" placeholder="e.g., ABC-1234" required>
                            </div>

                            <div class="form-group">
                                <label for="vehicle-type">Vehicle Type *</label>
                                <select id="vehicle-type" name="vehicle_type" required>
                                    <option value="">Select Type</option>
                                    <option value="two_wheeler">Two Wheeler</option>
                                    <option value="four_wheeler">Four Wheeler</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="slot-select">Available Parking Slot *</label>
                                <select id="slot-select" name="slot_id" required>
                                    <option value="">Select vehicle type first</option>
                                </select>
                            </div>

                            <button type="submit" class="btn btn-success btn-park">
                                <i class="fas fa-parking"></i> Park Vehicle
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        <!-- Manage Slots Tab -->
        <div id="slots" class="tab-content">
            <h2>Parking Layout Overview</h2>
            
            <div class="parking-legend">
                <div class="legend-item">
                    <div class="legend-box available"></div>
                    <span>Available</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box occupied"></div>
                    <span>Occupied</span>
                </div>
            </div>

            <div class="parking-layout">
                <!-- Ground Floor Section -->
                <div class="floor-section">
                    <h3 class="floor-title"><i class="fas fa-layer-group"></i> Ground Floor</h3>
                    
                    <div class="zone-container">
                        <div class="parking-zone">
                            <div class="zone-header">
                                <i class="fas fa-motorcycle"></i> Zone A - Two Wheeler Parking
                            </div>
                            <div class="slot-row" id="zone-a-slots">
                                <!-- Two wheeler slots will be loaded here -->
                            </div>
                        </div>

                        <div class="parking-zone">
                            <div class="zone-header">
                                <i class="fas fa-car"></i> Zone B - Four Wheeler Parking
                            </div>
                            <div class="slot-row" id="zone-b-slots">
                                <!-- Four wheeler slots will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reports Tab -->
        <!-- ==================== REPORTS TAB - UPDATED WITH FILTER ==================== -->
<!-- Replace your existing Reports tab section with this -->

<div id="reports" class="tab-content">
    <h2>Parking Reports</h2>
    
    <!-- Filter and Date Range Container -->
    <div class="report-filters">
        <!-- NEW: Report Type Filter -->
        <div class="form-group">
            <label for="report-filter-type">
                <i class="fas fa-filter"></i> Report Type
            </label>
            <select id="report-filter-type" class="form-control">
                <option value="date_range">Date Range (Custom)</option>
                <option value="day">Single Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
            </select>
        </div>

        <!-- Date Range Inputs (shown for date_range filter) -->
        <div id="date-range-inputs">
            <div class="form-group">
                <label for="report-date-from">From Date:</label>
                <input type="date" id="report-date-from" class="form-control">
            </div>
            
            <div class="form-group">
                <label for="report-date-to">To Date:</label>
                <input type="date" id="report-date-to" class="form-control">
            </div>
        </div>

        <!-- Single Day Input (hidden by default) -->
        <div id="day-input" style="display: none;">
            <div class="form-group">
                <label for="report-single-day">Select Day:</label>
                <input type="date" id="report-single-day" class="form-control">
            </div>
        </div>

        <!-- Month Input (hidden by default) -->
        <div id="month-input" style="display: none;">
            <div class="form-group">
                <label for="report-month">Select Month:</label>
                <input type="month" id="report-month" class="form-control">
            </div>
        </div>

        <!-- Year Input (hidden by default) -->
        <div id="year-input" style="display: none;">
            <div class="form-group">
                <label for="report-year">Select Year:</label>
                <select id="report-year" class="form-control">
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026" selected>2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>&nbsp;</label>
            <button id="generate-report" class="btn btn-primary">
                <i class="fas fa-chart-bar"></i> Generate Report
            </button>
        </div>
    </div>

    <!-- Search Box -->
    <div class="form-group" style="max-width: 400px; margin: 20px 0;">
        <label for="search-vehicle-report">
            <i class="fas fa-search"></i> Search by Vehicle Number
        </label>
        <input type="text" 
               id="search-vehicle-report" 
               class="form-control" 
               placeholder="Enter vehicle number"
               oninput="filterReportTable(this.value)">
    </div>

    <!-- Report Table -->
    <div class="table-container">
        <table id="reports-table">
            <thead>
                <tr>
                    <th>VEHICLE NUMBER</th>
                    <th>TYPE</th>
                    <th>SLOT</th>
                    <th>ENTRY TIME</th>
                    <th>EXIT TIME</th>
                    <th>DURATION</th>
                    <th>FEE</th>
                </tr>
            </thead>
            <tbody id="reports-body">
                <tr>
                    <td colspan="7" class="no-data">Select date range and click Generate Report</td>
                </tr>
            </tbody>
        </table>
    </div>

   
    <div id="pagination-container" style="margin-top: 20px;"></div>

   
    <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold;">
        <span>Total Revenue:</span>
        <span id="report-total" style="color: #27ae60; margin-left: 10px;">₱0.00</span>
    </div>
</div>


    <!-- Parking Ticket Modal -->
    <div id="ticket-modal" class="modal">
        <div class="modal-content ticket-content">
            <div id="ticket-print-area">
                <div class="ticket-header">
                    <h2>🅿️ PARKING TICKET</h2>
                    <p class="facility-name">Vehicle Parking Management System</p>
                </div>
                <div class="ticket-body" id="ticket-details">
                    <!-- Ticket details will be inserted here -->
                </div>
                <div class="ticket-footer">
                    <p>Please keep this ticket safe</p>
                    <p>Present this ticket when exiting</p>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Ticket
                </button>
                <button class="btn btn-secondary close">
                    <i class="fas fa-times"></i> 
                </button>
            </div>
        </div>
    </div>

    <!-- Receipt Modal -->
    <div id="receipt-modal" class="modal">
        <div class="modal-content receipt-modal-content">
            <div id="receipt-print-area">
                <div class="receipt-header">
                    <h2>🧾 PARKING RECEIPT</h2>
                    <p class="facility-name">Vehicle Parking Management System</p>
                    <div class="receipt-date" id="receipt-date"></div>
                </div>
                <div class="receipt-body" id="receipt-details">
                    <!-- Receipt details will be inserted here -->
                </div>
                <div class="receipt-footer">
                    <p>✓ Payment Received - Thank You!</p>
                    <p>Drive Safely!</p>
                </div>
            </div>
            <div class="receipt-actions">
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
                <button class="btn btn-secondary close">
                    <i class="fas fa-times"></i> 
                </button>
            </div>
        </div>
    </div>

    <!-- Keyboard Shortcuts Modal -->
    <div id="shortcuts-modal" class="modal">
        <div class="modal-content shortcuts-content">
            <span class="close">&times;</span>
            <h2><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
            
            <div class="shortcuts-grid">
                <div class="shortcut-section">
                    <h3>Navigation</h3>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>1</kbd>
                        <span>Go to Dashboard</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>2</kbd>
                        <span>Go to Vehicle Entry</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>3</kbd>
                        <span>Go to Manage Vehicles</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>4</kbd>
                        <span>Go to Parking Layout</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>5</kbd>
                        <span>Go to Reports</span>
                    </div>
                </div>

                <div class="shortcut-section">
                    <h3>Actions</h3>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>S</kbd>
                        <span>Save/Submit Active Form</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Enter</kbd>
                        <span>Search Vehicle / Next Field</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>F5</kbd>
                        <span>Refresh Dashboard Data</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close Modal/Panel</span>
                    </div>
                </div>

                <div class="shortcut-section">
                    <h3>Form Navigation</h3>
                    <div class="shortcut-item">
                        <kbd>↑</kbd> Arrow Up
                        <span>Previous Field</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>↓</kbd> Arrow Down
                        <span>Next Field</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Tab</kbd>
                        <span>Next Field (Standard)</span>
                    </div>
                </div>
            </div>

            <div class="shortcuts-footer">
                <p><i class="fas fa-info-circle"></i> Press <kbd>?</kbd> to show/hide this panel anytime</p>
            </div>
        </div>
    </div>

    <script src="script.js"></script>

    <!-- EDIT VEHICLE MODAL -->
<div class="modal-overlay" id="edit-vehicle-modal" style="display: none;">
    <div class="modal-content modal-medium">
        <div class="modal-header">
            <h3><i class="fas fa-edit"></i> Edit Vehicle Information</h3>
            <button class="modal-close" onclick="closeEditModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <input type="hidden" id="edit-record-id">
            
            <div class="form-group">
                <label>Vehicle Number:</label>
                <input type="text" id="edit-vehicle-number" class="form-control" readonly>
            </div>
            
            <div class="form-group">
                <label>Current Slot:</label>
                <input type="text" id="edit-current-slot" class="form-control" readonly>
            </div>
            
            <div class="form-group">
                <label>Entry Time:</label>
                <input type="text" id="edit-entry-time" class="form-control" readonly>
            </div>
            
            <div class="form-group">
                <label>Vehicle Type:</label>
                <select id="edit-vehicle-type" class="form-control">
                    <option value="two_wheeler">Two Wheeler</option>
                    <option value="four_wheeler">Four Wheeler</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Move to New Slot (Optional):</label>
                <select id="edit-new-slot" class="form-control">
                    <option value="">Keep current slot</option>
                </select>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeEditModal()">
                <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn btn-primary" onclick="saveVehicleEdit()">
                <i class="fas fa-save"></i> Save Changes
            </button>
        </div>
    </div>
</div>

<!-- EXIT VEHICLE MODAL -->
<div class="modal-overlay" id="exit-vehicle-modal" style="display: none;">
    <div class="modal-content modal-medium">
        <div class="modal-header" style="background: #dc3545;">
            <h3 style="color: white;"><i class="fas fa-sign-out-alt"></i> Exit Vehicle</h3>
            <button class="modal-close" onclick="closeExitModal()" style="color: white;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <input type="hidden" id="exit-record-id">
            
            <div class="exit-info-card">
                <div class="info-row">
                    <span class="label">Vehicle Number:</span>
                    <span class="value" id="exit-vehicle-number"></span>
                </div>
                <div class="info-row">
                    <span class="label">Vehicle Type:</span>
                    <span class="value" id="exit-vehicle-type"></span>
                </div>
                <div class="info-row">
                    <span class="label">Slot Number:</span>
                    <span class="value" id="exit-slot-number"></span>
                </div>
                <div class="info-row">
                    <span class="label">Entry Time:</span>
                    <span class="value" id="exit-entry-time"></span>
                </div>
                <div class="info-row">
                    <span class="label">Duration:</span>
                    <span class="value" id="exit-duration" style="color: #ff9800; font-weight: bold;"></span>
                </div>
                <div class="info-row fee-row">
                    <span class="label">Parking Fee:</span>
                    <span class="value fee-amount" id="exit-fee"></span>
                </div>
            </div>
            
            <div class="exit-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to process exit for this vehicle?</p>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeExitModal()">
                <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn btn-danger" onclick="confirmVehicleExit()">
                <i class="fas fa-sign-out-alt"></i> Process Exit & Print Receipt
            </button>
        </div>
    </div>
</div>

</body>
</html>