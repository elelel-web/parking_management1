$(document).ready(function() {
    // Initialize
    loadDashboard();
    
    // ==================== KEYBOARD EVENT HANDLERS ====================
    
    // Global keyboard shortcuts
    $(document).keydown(function(e) {
        // Alt + 1 = Dashboard
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            $('.tab-btn[data-tab="dashboard"]').click();
            showMessage('success', 'Switched to Dashboard (Alt+1)');
        }
        
        // Alt + 2 = Vehicle Entry
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            $('.tab-btn[data-tab="entry"]').click();
            $('#vehicle-number').focus();
            showMessage('success', 'Switched to Vehicle Entry (Alt+2)');
        }
        
        // Alt + 3 = Manage Vehicles
        if (e.altKey && e.key === '3') {
            e.preventDefault();
            $('.tab-btn[data-tab="manage-vehicles"]').click();
            $('#exit-vehicle-number').focus();
            showMessage('success', 'Switched to Manage Vehicles (Alt+3)');
        }
        
        // Alt + 4 = Parking Layout
        if (e.altKey && e.key === '4') {
            e.preventDefault();
            $('.tab-btn[data-tab="slots"]').click();
            showMessage('success', 'Switched to Parking Layout (Alt+4)');
        }
        
        // Alt + 5 = Reports
        if (e.altKey && e.key === '5') {
            e.preventDefault();
            $('.tab-btn[data-tab="reports"]').click();
            $('#report-date-from').focus();
            showMessage('success', 'Switched to Reports (Alt+5)');
        }
        
        // F5 = Refresh Dashboard Data
        if (e.key === 'F5') {
            e.preventDefault();
            loadDashboard();
            loadSlots();
            showMessage('success', 'Data refreshed! (F5)');
        }
        
        // Escape = Close modals
        if (e.key === 'Escape') {
            $('.modal').hide();
            $('#vehicle-info').hide();
        }
    });
    
    // Auto-uppercase vehicle numbers as user types
    $('#vehicle-number, #exit-vehicle-number').on('input', function() {
        $(this).val($(this).val().toUpperCase());
    });
    
    // Enter key to search vehicle in Exit tab
    $('#exit-vehicle-number').keypress(function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            $('#search-vehicle').click();
        }
    });
    
    // Enter key on entry form to submit
    $('#vehicle-number, #owner-name, #owner-phone').keypress(function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            const nextInput = $(this).closest('.form-group').next('.form-group').find('input, select');
            if (nextInput.length) {
                nextInput.focus();
            }
        }
    });
    
    // Ctrl + S = Quick Save/Submit on active form
    $(document).keydown(function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            
            // Check which tab is active and submit appropriate form
            const activeTab = $('.tab-content.active').attr('id');
            
            if (activeTab === 'entry') {
                $('#entry-form').submit();
            } else if (activeTab === 'exit' && $('#vehicle-info').is(':visible')) {
                $('#process-exit').click();
            } else if (activeTab === 'reports') {
                $('#generate-report').click();
            }
        }
    });
    
    // Number keys 1-9 for quick slot selection when in entry form
    $('#vehicle-type').on('change', function() {
        $('#slot-select').focus();
    });
    
    // Arrow keys for navigating between form fields
    $('input, select').keydown(function(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            $(this).closest('.form-group').next('.form-group').find('input, select').focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            $(this).closest('.form-group').prev('.form-group').find('input, select').focus();
        }
    });
    
    // ? key to show keyboard shortcuts
    $(document).keypress(function(e) {
        if (e.key === '?') {
            e.preventDefault();
            $('#shortcuts-modal').show();
        }
    });
    
    // Show keyboard shortcuts button
    $('#show-shortcuts').click(function() {
        $('#shortcuts-modal').show();
    });
    
    // Close shortcuts modal
    $('.close').click(function() {
        const modal = $(this).closest('.modal');
        modal.hide();
        
        // If closing receipt modal, refresh the parked vehicles table
        if (modal.attr('id') === 'receipt-modal') {
            loadAllParkedVehicles();
        }
    });
    
    $(window).click(function(event) {
        if ($(event.target).hasClass('modal')) {
            const modalId = $(event.target).attr('id');
            $('.modal').hide();
            
            // If closing receipt modal, refresh the parked vehicles table
            if (modalId === 'receipt-modal') {
                loadAllParkedVehicles();
            }
        }
    });
    
    // ==================== END KEYBOARD EVENT HANDLERS ====================
    
    // Tab switching
    $('.tab-btn').click(function() {
        const tabName = $(this).data('tab');
        
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        $('.tab-content').removeClass('active');
        $('#' + tabName).addClass('active');
        
        // Load data when switching tabs
        if (tabName === 'dashboard') {
            loadDashboard();
        } else if (tabName === 'slots') {
            loadSlots();
        } else if (tabName === 'manage-vehicles') {
            loadAllParkedVehicles();
        }
    });
    
    // Vehicle type change - load available slots
    $('#vehicle-type').change(function() {
        const vehicleType = $(this).val();
        loadAvailableSlots(vehicleType);
    });
    
    // Vehicle Entry Form Submit
    $('#entry-form').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            vehicle_number: $('#vehicle-number').val().toUpperCase(),
            vehicle_type: $('#vehicle-type').val(),
            slot_id: $('#slot-select').val()
        };
        
        $.ajax({
            url: 'api/entry.php',
            method: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    showMessage('success', 'Vehicle parked successfully!');
                    $('#entry-form')[0].reset();
                    $('#slot-select').html('<option value="">Select vehicle type first</option>');
                    
                    // Show parking ticket
                    showParkingTicket(response.ticket);
                } else {
                    showMessage('error', response.message);
                }
            },
            error: function() {
                showMessage('error', 'An error occurred. Please try again.');
            }
        });
    });
    
    // Search Vehicle for Exit
    $('#search-vehicle').click(function() {
        const vehicleNumber = $('#exit-vehicle-number').val().toUpperCase();
        
        if (!vehicleNumber) {
            showMessage('error', 'Please enter vehicle number');
            return;
        }
        
        $.ajax({
            url: 'api/search_vehicle.php',
            method: 'POST',
            data: JSON.stringify({ vehicle_number: vehicleNumber }),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    displayVehicleInfo(response.data);
                } else {
                    showMessage('error', response.message);
                    $('#vehicle-info').hide();
                }
            },
            error: function() {
                showMessage('error', 'An error occurred. Please try again.');
            }
        });
    });
    
    // Process Exit
    $('#process-exit').click(function() {
        const vehicleNumber = $('#exit-vehicle-number').val().toUpperCase();
        
        if (confirm('Are you sure you want to process the exit for this vehicle?')) {
            $.ajax({
                url: 'api/exit.php',
                method: 'POST',
                data: JSON.stringify({ vehicle_number: vehicleNumber }),
                contentType: 'application/json',
                success: function(response) {
                    if (response.success) {
                        showReceipt(response.data);
                        $('#exit-form')[0].reset();
                        $('#vehicle-info').hide();
                        showMessage('success', 'Vehicle exit processed successfully!');
                        
                        // Refresh the parked vehicles table
                        loadAllParkedVehicles();
                        
                        // Also refresh dashboard if on that tab
                        if ($('.tab-btn[data-tab="dashboard"]').hasClass('active')) {
                            loadDashboard();
                        }
                    } else {
                        showMessage('error', response.message);
                    }
                },
                error: function() {
                    showMessage('error', 'An error occurred. Please try again.');
                }
            });
        }
    });
    
    // Add Slot Modal
    // REMOVED - Add slot functionality disabled
    
    // Add Slot Form Submit
    // REMOVED - Add slot functionality disabled
    
    // Delete Slot
    // REMOVED - Delete slot functionality disabled
    
    // Generate Report
    $('#generate-report').click(function() {
        const dateFrom = $('#report-date-from').val();
        const dateTo = $('#report-date-to').val();
        
        if (!dateFrom || !dateTo) {
            showMessage('error', 'Please select both from and to dates');
            return;
        }
        
        $.ajax({
            url: 'api/reports.php',
            method: 'POST',
            data: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    displayReport(response.data);
                } else {
                    showMessage('error', response.message);
                }
            },
            error: function() {
                showMessage('error', 'An error occurred. Please try again.');
            }
        });
    });
    
    // Refresh Parked Vehicles
    $('#refresh-parked-vehicles').click(function() {
        loadAllParkedVehicles();
        showMessage('success', 'Vehicle list refreshed!');
    });
    
    // Quick Exit from table
    $(document).on('click', '.quick-exit-btn', function() {
        const vehicleNumber = $(this).data('vehicle');
        $('#exit-vehicle-number').val(vehicleNumber);
        $('#search-vehicle').click();
        
        // Scroll to top of manage vehicles section
        $('html, body').animate({
            scrollTop: $('#manage-vehicles').offset().top - 100
        }, 500);
    });
    
    // Functions
    function loadDashboard() {
        $.ajax({
            url: 'api/dashboard.php',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    // Update stats
                    $('#total-slots').text(response.data.total_slots);
                    $('#available-slots').text(response.data.available_slots);
                    $('#occupied-slots').text(response.data.occupied_slots);
                    $('#total-revenue').text('₱' + parseFloat(response.data.today_revenue).toFixed(2));
                    
                    // Update parked vehicles table
                    displayParkedVehicles(response.data.parked_vehicles);
                }
            }
        });
    }
    
    function loadAvailableSlots(vehicleType) {
        if (!vehicleType) {
            $('#slot-select').html('<option value="">Select vehicle type first</option>');
            return;
        }
        
        $.ajax({
            url: 'api/get_slots.php',
            method: 'POST',
            data: JSON.stringify({ vehicle_type: vehicleType }),
            contentType: 'application/json',
            success: function(response) {
                if (response.success && response.data.length > 0) {
                    let options = '<option value="">Select Slot</option>';
                    response.data.forEach(function(slot) {
                        options += `<option value="${slot.id}">${slot.slot_number} (${slot.slot_type.replace('_', ' ')})</option>`;
                    });
                    $('#slot-select').html(options);
                } else {
                    $('#slot-select').html('<option value="">No available slots</option>');
                }
            }
        });
    }
    
    function displayParkedVehicles(vehicles) {
        const tbody = $('#parked-vehicles-body');
        
        if (!vehicles || vehicles.length === 0) {
            tbody.html('<tr><td colspan="6" class="no-data">No vehicles currently parked</td></tr>');
            return;
        }
        
        let html = '';
        vehicles.forEach(function(vehicle) {
            html += `
                <tr>
                    <td>${vehicle.slot_number}</td>
                    <td><strong>${vehicle.vehicle_number}</strong></td>
                    <td>${vehicle.vehicle_type.replace('_', ' ')}</td>
                    <td>${vehicle.owner_name}</td>
                    <td>${formatDateTime(vehicle.entry_time)}</td>
                    <td>${vehicle.duration}</td>
                </tr>
            `;
        });
        
        tbody.html(html);
    }
    
    function displayVehicleInfo(data) {
        $('#info-vehicle-number').text(data.vehicle_number);
        $('#info-vehicle-type').text(data.vehicle_type.replace('_', ' '));
        $('#info-owner-name').text(data.owner_name);
        $('#info-owner-phone').text(data.owner_phone);
        $('#info-slot-number').text(data.slot_number);
        $('#info-entry-time').text(formatDateTime(data.entry_time));
        $('#info-duration').text(data.duration);
        $('#info-parking-fee').text('₱' + parseFloat(data.parking_fee).toFixed(2));
        
        $('#vehicle-info').show();
    }
    
    function loadSlots() {
        $.ajax({
            url: 'api/all_slots.php',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    displaySlots(response.data);
                }
            }
        });
    }
    
    function displaySlots(slots) {
        if (!slots || slots.length === 0) {
            $('#zone-a-slots').html('<p class="no-data">No parking slots found</p>');
            return;
        }
        
        // Separate slots by type
        const twoWheelerSlots = slots.filter(s => s.slot_type === 'two_wheeler');
        const fourWheelerSlots = slots.filter(s => s.slot_type === 'four_wheeler');
        const handicappedSlots = slots.filter(s => s.slot_type === 'handicapped');
        
        // Display Two Wheeler Slots (Zone A)
        let zoneAHtml = '';
        twoWheelerSlots.forEach(function(slot) {
            const statusClass = slot.status === 'available' ? 'available' : 'occupied';
            zoneAHtml += `
                <div class="parking-slot ${statusClass}" title="Click for details">
                    <div class="slot-number">${slot.slot_number}</div>
                    <div class="slot-status ${statusClass}">${slot.status}</div>
                </div>
            `;
        });
        $('#zone-a-slots').html(zoneAHtml || '<p class="no-data">No slots in this zone</p>');
        
        // Display Four Wheeler Slots (Zone B)
        let zoneBHtml = '';
        fourWheelerSlots.forEach(function(slot) {
            const statusClass = slot.status === 'available' ? 'available' : 'occupied';
            zoneBHtml += `
                <div class="parking-slot ${statusClass}" title="Click for details">
                    <div class="slot-number">${slot.slot_number}</div>
                    <div class="slot-status ${statusClass}">${slot.status}</div>
                </div>
            `;
        });
        $('#zone-b-slots').html(zoneBHtml || '<p class="no-data">No slots in this zone</p>');
        
        // Display Handicapped Slots (Zone H)
        let zoneHHtml = '';
        handicappedSlots.forEach(function(slot) {
            const statusClass = slot.status === 'available' ? 'available' : 'occupied';
            zoneHHtml += `
                <div class="parking-slot ${statusClass} handicapped" title="Priority Parking">
                    <div class="slot-number">${slot.slot_number}</div>
                    <div class="slot-status ${statusClass}">${slot.status}</div>
                    <div class="vehicle-info-slot"><i class="fas fa-wheelchair"></i></div>
                </div>
            `;
        });
        $('#zone-h-slots').html(zoneHHtml || '<p class="no-data">No slots in this zone</p>');
    }
    
    function displayReport(data) {
        const tbody = $('#reports-body');
        
        if (!data.records || data.records.length === 0) {
            tbody.html('<tr><td colspan="8" class="no-data">No records found for selected date range</td></tr>');
            $('#report-total').text('₱0.00');
            return;
        }
        
        let html = '';
        data.records.forEach(function(record) {
            html += `
                <tr>
                    <td>${record.vehicle_number}</td>
                    <td>${record.vehicle_type.replace('_', ' ')}</td>
                    <td>${record.owner_name}</td>
                    <td>${record.slot_number}</td>
                    <td>${formatDateTime(record.entry_time)}</td>
                    <td>${formatDateTime(record.exit_time)}</td>
                    <td>${record.duration}</td>
                    <td>₱${parseFloat(record.parking_fee).toFixed(2)}</td>
                </tr>
            `;
        });
        
        tbody.html(html);
        $('#report-total').text('₱' + parseFloat(data.total_revenue).toFixed(2));
    }
    
    function showReceipt(data) {
        const now = new Date();
        $('#receipt-date').text(now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));
        
        const receiptHtml = `
            <div class="receipt-info-section">
                <div class="receipt-row">
                    <span class="receipt-label">Receipt No:</span>
                    <span class="receipt-value receipt-number">#${String(data.record_id).padStart(6, '0')}</span>
                </div>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-info-section">
                <h4 class="section-title">Vehicle Information</h4>
                <div class="receipt-row">
                    <span class="receipt-label">Vehicle Number:</span>
                    <span class="receipt-value vehicle-number">${data.vehicle_number}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Vehicle Type:</span>
                    <span class="receipt-value">${data.vehicle_type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Parking Slot:</span>
                    <span class="receipt-value slot-highlight">${data.slot_number}</span>
                </div>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-info-section">
                <h4 class="section-title">Parking Duration</h4>
                <div class="receipt-row">
                    <span class="receipt-label">Entry Time:</span>
                    <span class="receipt-value">${formatDateTime(data.entry_time)}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Exit Time:</span>
                    <span class="receipt-value">${formatDateTime(data.exit_time)}</span>
                </div>
                <div class="receipt-row duration-row">
                    <span class="receipt-label">Total Duration:</span>
                    <span class="receipt-value duration-highlight">${data.duration}</span>
                </div>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-total-section">
                <div class="receipt-total-row">
                    <span class="total-label">TOTAL PARKING FEE</span>
                    <span class="total-amount">₱${parseFloat(data.parking_fee).toFixed(2)}</span>
                </div>
            </div>
        `;
        
        $('#receipt-details').html(receiptHtml);
        $('#receipt-modal').show();
        
        // NO auto-print - user clicks Print button manually
    }
    
    function showParkingTicket(ticketData) {
        const ticketHtml = `
            <div class="ticket-number">
                <h3>TICKET #</h3>
                <div class="ticket-num">${ticketData.ticket_number}</div>
            </div>
            <div class="ticket-divider"></div>
            <table class="ticket-table">
                <tr>
                    <td class="ticket-label">Vehicle Number:</td>
                    <td class="ticket-value">${ticketData.vehicle_number}</td>
                </tr>
                <tr>
                    <td class="ticket-label">Vehicle Type:</td>
                    <td class="ticket-value">${ticketData.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                </tr>
                <tr>
                    <td class="ticket-label">Parking Slot:</td>
                    <td class="ticket-value">${ticketData.slot_number}</td>
                </tr>
                <tr>
                    <td class="ticket-label">Entry Date:</td>
                    <td class="ticket-value">${new Date(ticketData.entry_time).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td class="ticket-label">Entry Time:</td>
                    <td class="ticket-value">${new Date(ticketData.entry_time).toLocaleTimeString()}</td>
                </tr>
            </table>
            <div class="ticket-divider"></div>
            <div class="ticket-notice">
                <div class="notice-icon">⚠️</div>
                <div class="notice-title">IMPORTANT PRIVACY NOTICE</div>
                <div class="notice-text">
                    <p>• In case of emergency, you will be paged using your <strong>TICKET NUMBER</strong> only.</p>
                    <p>• Your plate number will <strong>NOT</strong> be announced publicly to protect your privacy.</p>
                    <p>• Please <strong>KEEP THIS TICKET SAFE</strong> and remember your ticket number.</p>
                </div>
            </div>
            <div class="ticket-divider"></div>
            <div class="ticket-rates">
                <p><strong>Parking Rates:</strong></p>
                <p>${ticketData.vehicle_type === 'two_wheeler' ? '₱10 first hour, ₱5 additional' : '₱20 first hour, ₱10 additional'}</p>
            </div>
        `;
        
        $('#ticket-details').html(ticketHtml);
        $('#ticket-modal').show();
        
        // NO auto-print - user clicks Print button manually
    }
    
    function showMessage(type, message) {
        const messageDiv = $(`<div class="message ${type}">${message}</div>`);
        $('.tab-content.active').prepend(messageDiv);
        
        setTimeout(function() {
            messageDiv.fadeOut(function() {
                $(this).remove();
            });
        }, 3000);
    }
    
    function formatDateTime(datetime) {
        if (!datetime) return 'N/A';
        const date = new Date(datetime);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function loadAllParkedVehicles() {
        $.ajax({
            url: 'api/dashboard.php',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    displayAllParkedVehicles(response.data.parked_vehicles);
                }
            }
        });
    }
    
    function displayAllParkedVehicles(vehicles) {
        const tbody = $('#all-parked-vehicles-body');
        
        if (!vehicles || vehicles.length === 0) {
            tbody.html('<tr><td colspan="6" class="no-data">No vehicles currently parked</td></tr>');
            return;
        }
        
        let html = '';
        vehicles.forEach(function(vehicle) {
            html += `
                <tr>
                    <td><strong>${vehicle.slot_number}</strong></td>
                    <td><strong>${vehicle.vehicle_number}</strong></td>
                    <td>${vehicle.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                    <td>${formatDateTime(vehicle.entry_time)}</td>
                    <td><span class="duration-badge">${vehicle.duration}</span></td>
                    <td>
                        <button class="btn btn-danger btn-small quick-exit-btn" data-vehicle="${vehicle.vehicle_number}">
                            <i class="fas fa-sign-out-alt"></i> Exit
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.html(html);
    }
    
    // Set today's date as default for reports
    const today = new Date().toISOString().split('T')[0];
    $('#report-date-from').val(today);
    $('#report-date-to').val(today);
});