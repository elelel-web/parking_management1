$(document).ready(function() {
    loadDashboard();
    loadAllParkedVehicles();


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
            $('.entry_button[data-tab="entry"]').click();
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
    
    const today = new Date().toISOString().split('T')[0];
    $('#report-date-from').val(today);
    $('#report-date-to').val(today);
    
    // Set default values for new filter inputs
    $('#report-single-day').val(today);
    const currentMonth = new Date().toISOString().substring(0, 7);
    $('#report-month').val(currentMonth);
    
    // ==================== REPORT FILTER TYPE CHANGE ====================
    $('#report-filter-type').change(function() {
        const filterType = $(this).val();
        
        // Hide all input sections first
        $('#date-range-inputs').hide();
        $('#day-input').hide();
        $('#month-input').hide();
        $('#year-input').hide();
        
        // Show the appropriate input based on filter type
        switch(filterType) {
            case 'date_range':
                $('#date-range-inputs').show();
                break;
            case 'day':
                $('#day-input').show();
                // Set default to today
                const today = new Date().toISOString().split('T')[0];
                $('#report-single-day').val(today);
                break;
            case 'month':
                $('#month-input').show();
                // Set default to current month
                const currentMonth = new Date().toISOString().substring(0, 7);
                $('#report-month').val(currentMonth);
                break;
            case 'year':
                $('#year-input').show();
                break;
        }
    });
    
    // ==================== TAB SWITCHING ====================
    $('.tab-btn').click(function() {
        const tabName = $(this).data('tab');
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').removeClass('active');
        $('#' + tabName).addClass('active');
        
        if (tabName === 'dashboard') loadDashboard();
        else if (tabName === 'slots') loadSlots();
        else if (tabName === 'manage-vehicles') loadAllParkedVehicles();
    });
    
    // ==================== ENTRY MODAL ====================
    $('#open-entry-modal').click(function() {
        $('#entry-modal').fadeIn();
    });
    
    $('#close-entry-modal').click(function() {
        $('#entry-modal').fadeOut();
    });
    
    // ==================== VEHICLE TYPE CHANGE ====================
    $('#vehicle-type').change(function() {
        loadAvailableSlots($(this).val());
    });
    
    // ==================== ENTRY FORM ====================
    $('#entry-form').submit(function(e) {
        e.preventDefault();
        
        $.ajax({
            url: 'api/entry.php',
            method: 'POST',
            data: JSON.stringify({
                vehicle_number: $('#vehicle-number').val().toUpperCase(),
                vehicle_type: $('#vehicle-type').val(),
                slot_id: $('#slot-select').val()
            }),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    showMessage('success', 'Vehicle parked successfully!');
                    $('#entry-form')[0].reset();
                    $('#entry-modal').fadeOut();
                    showParkingTicket(response.ticket);
                    loadDashboard();
                    loadAllParkedVehicles();
                } else {
                    showMessage('error', response.message);
                }
            }
        });
    });
    
    // ==================== SEARCH VEHICLE ====================
    $('#search-vehicle').click(function() {
        const vehicleNumber = $('#exit-vehicle-number').val().trim().toUpperCase();
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
                    $('#vehicle-info').data('record-id', response.data.id);
                    displayVehicleInfo(response.data);
                } else {
                    showMessage('error', response.message);
                    $('#vehicle-info').hide();
                }
            }
        });
    });
    
    // ==================== PROCESS EXIT (SEARCH SECTION) ====================
    $('#process-exit').click(function() {
        const recordId = $('#vehicle-info').data('record-id');
        if (!recordId) {
            showMessage('error', 'No vehicle found');
            return;
        }
        processVehicleExit(recordId);
    });
    
    // ==================== GENERATE REPORT (UPDATED WITH FILTERS) ====================
    $('#generate-report').click(function() {
        const filterType = $('#report-filter-type').val();
        let dateFrom, dateTo;
        let filterMsg = '';
        
        // Determine date range based on filter type
        switch(filterType) {
            case 'date_range':
                dateFrom = $('#report-date-from').val();
                dateTo = $('#report-date-to').val();
                
                if (!dateFrom || !dateTo) {
                    showMessage('error', 'Please select both From and To dates');
                    return;
                }
                filterMsg = `Date Range: ${dateFrom} to ${dateTo}`;
                break;
                
            case 'day':
                const day = $('#report-single-day').val();
                if (!day) {
                    showMessage('error', 'Please select a day');
                    return;
                }
                dateFrom = day;
                dateTo = day;
                const dayDate = new Date(day);
                filterMsg = `Day: ${dayDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}`;
                break;
                
            case 'month':
                const month = $('#report-month').val();
                if (!month) {
                    showMessage('error', 'Please select a month');
                    return;
                }
                // Calculate first and last day of month
                const [year, monthNum] = month.split('-');
                dateFrom = `${year}-${monthNum}-01`;
                const lastDay = new Date(year, monthNum, 0).getDate();
                dateTo = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;
                filterMsg = `Month: ${new Date(dateFrom).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                })}`;
                break;
                
            case 'year':
                const yearVal = $('#report-year').val();
                dateFrom = `${yearVal}-01-01`;
                dateTo = `${yearVal}-12-31`;
                filterMsg = `Year: ${yearVal}`;
                break;
        }
        
        console.log('Generating report:', { filterType, dateFrom, dateTo });
        
        $.ajax({
            url: 'api/reports.php',
            method: 'POST',
            data: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    displayReport(response.data, response.summary);
                    showMessage('success', `Report generated for ${filterMsg} - ${response.data.length} records found`);
                } else {
                    showMessage('error', response.message);
                }
            }
        });
    });
    
    // ==================== REFRESH BUTTON ====================
    $('#refresh-parked-vehicles').click(function() {
        $(this).html('<i class="fas fa-spinner fa-spin"></i> Refreshing...');
        loadAllParkedVehicles();
        setTimeout(() => {
            $(this).html('<i class="fas fa-sync-alt"></i> Refresh');
        }, 500);
    });
    
    // ==================== EVENT DELEGATION FOR EDIT/EXIT BUTTONS ====================
    // This is the KEY FIX - using event delegation on dynamically created buttons
    
    $(document).on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const number = $(this).data('number');
        const type = $(this).data('type');
        const slot = $(this).data('slot');
        const entry = $(this).data('entry');
        
        console.log('Edit clicked:', { id, number, type, slot, entry });
        openEditModal(id, number, type, slot, entry);
    });
    
    $(document).on('click', '.btn-exit', function() {
        const id = $(this).data('id');
        const number = $(this).data('number');
        const type = $(this).data('type');
        const slot = $(this).data('slot');
        const entry = $(this).data('entry');
        const duration = $(this).data('duration');
        const mins = $(this).data('mins');
        
        console.log('Exit clicked:', { id, number, type, slot, entry, duration, mins });
        openExitModal(id, number, type, slot, entry, duration, mins);
    });
    
    // ==================== KEYBOARD SHORTCUTS ====================
    $(document).keydown(function(e) {
        if (e.key === 'Escape') {
            $('.modal').fadeOut();
            $('.modal-overlay').fadeOut();
        }
    });
    
    $('#show-shortcuts').click(function() {
        $('#shortcuts-modal').show();
    });
    
    $('.close').click(function() {
        $(this).closest('.modal').fadeOut();
    });
    
    // ==================== LOGOUT ====================
    $('#logout-btn').click(function() {
        if (confirm('Logout?')) {
            $.ajax({
                url: 'api/auth/logout.php',
                method: 'POST',
                success: function() {
                    window.location.href = 'login.php';
                }
            });
        }
    });
});

// ==================== LOAD FUNCTIONS ====================

function loadDashboard() {
    $.ajax({
        url: 'api/dashboard.php',
        method: 'POST',
        success: function(response) {
            if (response.success) {
                $('#total-slots').text(response.data.total_slots);
                $('#available-slots').text(response.data.available_slots);
                $('#occupied-slots').text(response.data.occupied_slots);
                $('#total-revenue').text('₱' + parseFloat(response.data.today_revenue).toFixed(2));
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
                response.data.forEach(s => options += `<option value="${s.id}">${s.slot_number}</option>`);
                $('#slot-select').html(options);
            } else {
                $('#slot-select').html('<option value="">No slots available</option>');
            }
        }
    });
}

function loadSlots() {
    $.ajax({
        url: 'api/all_slots.php',
        method: 'GET',
        success: function(response) {
            if (response.success) displaySlots(response.data);
        }
    });
}

function loadAllParkedVehicles() {
    $.ajax({
        url: 'api/dashboard.php',
        method: 'POST',
        success: function(response) {
            if (response.success) {
                displayAllParkedVehicles(response.data.parked_vehicles);
            }
        }
    });
}

// ==================== DISPLAY FUNCTIONS ====================

function displayParkedVehicles(vehicles) {
    if (!vehicles || vehicles.length === 0) {
        $('#parked-vehicles-body').html('<tr><td colspan="5" class="no-data">No vehicles parked</td></tr>');
        return;
    }
    
    let html = '';
    vehicles.forEach(v => {
        html += `
            <tr>
                <td>${v.slot_number}</td>
                <td>${v.vehicle_number}</td>
                <td>${v.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                <td>${new Date(v.entry_time).toLocaleString()}</td>
                <td><span class="duration-badge">${v.duration}</span></td>
            </tr>
        `;
    });
    $('#parked-vehicles-body').html(html);
}

function displayAllParkedVehicles(vehicles) {
    console.log('Displaying all parked vehicles:', vehicles);
    
    if (!vehicles || vehicles.length === 0) {
        $('#all-parked-vehicles-body').html('<tr><td colspan="6" class="no-data">No vehicles parked</td></tr>');
        return;
    }
    
    let html = '';
    vehicles.forEach(v => {
        // Using data attributes instead of onclick
        html += `
            <tr>
                <td>${v.slot_number}</td>
                <td>${v.vehicle_number}</td>
                <td>${v.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                <td>${new Date(v.entry_time).toLocaleString()}</td>
                <td><span class="duration-badge">${v.duration}</span></td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" 
                            data-id="${v.id}"
                            data-number="${v.vehicle_number}"
                            data-type="${v.vehicle_type}"
                            data-slot="${v.slot_number}"
                            data-entry="${v.entry_time}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-exit" 
                            data-id="${v.id}"
                            data-number="${v.vehicle_number}"
                            data-type="${v.vehicle_type}"
                            data-slot="${v.slot_number}"
                            data-entry="${v.entry_time}"
                            data-duration="${v.duration}"
                            data-mins="${v.mins || 0}">
                        <i class="fas fa-sign-out-alt"></i> Exit
                    </button>
                </td>
            </tr>
        `;
    });
    
    $('#all-parked-vehicles-body').html(html);
    console.log('Table updated successfully');
}

function displayVehicleInfo(data) {
    $('#info-vehicle-number').text(data.vehicle_number);
    $('#info-vehicle-type').text(data.vehicle_type.replace('_', ' '));
    $('#info-slot-number').text(data.slot_number);
    $('#info-entry-time').text(new Date(data.entry_time).toLocaleString());
    $('#info-duration').text(data.duration);
    $('#info-parking-fee').text('₱' + parseFloat(data.parking_fee).toFixed(2));
    $('#vehicle-info').show();
}

function displaySlots(slots) {
    const twoWheeler = slots.filter(s => s.slot_type === 'two_wheeler');
    const fourWheeler = slots.filter(s => s.slot_type === 'four_wheeler');
    
    let htmlA = '';
    twoWheeler.forEach(s => {
        htmlA += `<div class="parking-slot ${s.status}"><div class="slot-number">${s.slot_number}</div></div>`;
    });
    $('#zone-a-slots').html(htmlA || '<p>No slots</p>');
    
    let htmlB = '';
    fourWheeler.forEach(s => {
        htmlB += `<div class="parking-slot ${s.status}"><div class="slot-number">${s.slot_number}</div></div>`;
    });
    $('#zone-b-slots').html(htmlB || '<p>No slots</p>');
}

function displayReport(data, summary) {
    if (!data || data.length === 0) {
        $('#reports-body').html('<tr><td colspan="7" class="no-data">NO RECORDS</td></tr>');
        $('#report-total').text('₱0.00');
        return;
    }
    
    let html = '';
    data.forEach(r => {
        html += `
            <tr>
                <td>${r.vehicle_number}</td>
                <td>${r.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                <td>${r.slot_number}</td>
                <td>${new Date(r.entry_time).toLocaleString()}</td>
                <td>${new Date(r.exit_time).toLocaleString()}</td>
                <td>${r.duration}</td>
                <td>₱${parseFloat(r.parking_fee).toFixed(2)}</td>
            </tr>
        `;
    });
    $('#reports-body').html(html);
    $('#report-total').text('₱' + summary.total_revenue);
}

// ==================== MODAL FUNCTIONS ====================

function openEditModal(id, number, type, slot, entry) {
    console.log('Opening edit modal:', { id, number, type, slot, entry });
    
    $('#edit-record-id').val(id);
    $('#edit-vehicle-number').val(number);
    $('#edit-vehicle-type').val(type);
    $('#edit-current-slot').val(slot);
    $('#edit-entry-time').val(new Date(entry).toLocaleString());
    
    $.ajax({
        url: 'api/get_slots.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ vehicle_type: type }),
        success: function(response) {
            if (response.success) {
                let options = '<option value="">Keep current slot</option>';
                response.data.forEach(s => options += `<option value="${s.id}">${s.slot_number}</option>`);
                $('#edit-new-slot').html(options);
            }
        }
    });
    
    $('#edit-vehicle-modal').css('display', 'flex').hide().fadeIn(300);
}

function closeEditModal() {
    $('#edit-vehicle-modal').fadeOut(300);
}

function saveVehicleEdit() {
    alert('Edit saved! (Feature coming soon)');
    closeEditModal();
}

function openExitModal(id, number, type, slot, entry, duration, mins) {
    console.log('Opening exit modal:', { id, number, type, slot, entry, duration, mins });
    
    $('#exit-record-id').val(id);
    $('#exit-vehicle-number').text(number);
    $('#exit-vehicle-type').text(type.replace('_', ' ').toUpperCase());
    $('#exit-slot-number').text(slot);
    $('#exit-entry-time').text(new Date(entry).toLocaleString());
    $('#exit-duration').text(duration);
    
    const hours = Math.ceil((mins || 60) / 60);
    const firstRate = type === 'two_wheeler' ? 10 : 20;
    const addRate = type === 'two_wheeler' ? 5 : 10;
    let fee = firstRate + (hours > 1 ? (hours - 1) * addRate : 0);
    
    $('#exit-fee').text('₱' + fee.toFixed(2));
    $('#exit-vehicle-modal').css('display', 'flex').hide().fadeIn(300);
}

function closeExitModal() {
    $('#exit-vehicle-modal').fadeOut(300);
}

function confirmVehicleExit() {
    const recordId = $('#exit-record-id').val();
    console.log('Confirming exit for record:', recordId);
    processVehicleExit(recordId);
}

function processVehicleExit(recordId) {
    const btn = $('#exit-vehicle-modal .btn-danger, #process-exit');
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Processing...');
    
    $.ajax({
        url: 'api/exit.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ record_id: recordId }),
        success: function(response) {
            if (response.success) {
                closeExitModal();
                $('#vehicle-info').hide();
                showMessage('success', 'Exit processed!');
                showReceipt(response.data);
                loadAllParkedVehicles();
                loadDashboard();
            } else {
                alert('Error: ' + response.message);
            }
        },
        complete: function() {
            btn.prop('disabled', false).html('<i class="fas fa-sign-out-alt"></i> Process Exit & Print Receipt');
        }
    });
}

// ==================== RECEIPT & TICKET ====================

function showReceipt(data) {
    $('#receipt-date').text(new Date().toLocaleString());
    const html = `
        <div style="padding: 20px;">
            <div style="margin: 10px 0;"><strong>Receipt #:</strong> ${String(data.id).padStart(6, '0')}</div>
            <hr>
            <div style="margin: 10px 0;"><strong>Vehicle:</strong> ${data.vehicle_number}</div>
            <div style="margin: 10px 0;"><strong>Type:</strong> ${data.vehicle_type.replace('_', ' ').toUpperCase()}</div>
            <div style="margin: 10px 0;"><strong>Slot:</strong> ${data.slot_number}</div>
            <div style="margin: 10px 0;"><strong>Entry:</strong> ${new Date(data.entry_time).toLocaleString()}</div>
            <div style="margin: 10px 0;"><strong>Exit:</strong> ${new Date(data.exit_time).toLocaleString()}</div>
            <div style="margin: 10px 0;"><strong>Duration:</strong> ${data.duration}</div>
            <hr>
            <div style="margin: 10px 0; font-size: 24px;"><strong>TOTAL:</strong> ₱${parseFloat(data.parking_fee).toFixed(2)}</div>
        </div>
    `;
    $('#receipt-details').html(html);
    $('#receipt-modal').show();
}

function showParkingTicket(data) {
    const html = `
        <div style="padding: 20px; text-align: center;">
            <h2>TICKET #${data.ticket_number}</h2>
            <hr>
            <div style="margin: 10px 0;"><strong>Vehicle:</strong> ${data.vehicle_number}</div>
            <div style="margin: 10px 0;"><strong>Type:</strong> ${data.vehicle_type.replace('_', ' ').toUpperCase()}</div>
            <div style="margin: 10px 0;"><strong>Slot:</strong> ${data.slot_number}</div>
            <div style="margin: 10px 0;"><strong>Entry:</strong> ${new Date(data.entry_time).toLocaleString()}</div>
        </div>
    `;
    $('#ticket-details').html(html);
    $('#ticket-modal').show();
}

function showMessage(type, message) {
    const msg = $(`<div class="message ${type}" style="padding: 15px; margin: 10px 0; border-radius: 5px; background: ${type === 'success' ? '#d4edda' : '#f8d7da'}; color: ${type === 'success' ? '#155724' : '#721c24'};">${message}</div>`);
    $('.tab-content.active').prepend(msg);
    setTimeout(() => msg.fadeOut(() => msg.remove()), 3000);
}

// ==================== REPORTS PAGINATION ====================

let currentReportPage = 1;
let allReportData = [];
const reportsPerPage = 5;

function displayReport(data, summary) {
    if (!data || data.length === 0) {
        $('#reports-body').html('<tr><td colspan="7" class="no-data">NO RECORDS</td></tr>');
        $('#report-total').text('₱0.00');
        $('#pagination-container').hide();
        return;
    }
    
    // Store all data
    allReportData = data;
    currentReportPage = 1;
    
    // Display first page
    displayReportPage(1);
    
    // Show pagination
    renderPagination(data.length);
    
    // Update total
    $('#report-total').text('₱' + summary.total_revenue);
}

function displayReportPage(page) {
    const startIndex = (page - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    const pageData = allReportData.slice(startIndex, endIndex);
    
    let html = '';
    pageData.forEach(r => {
        html += `
            <tr>
                <td>${r.vehicle_number}</td>
                <td>${r.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                <td>${r.slot_number}</td>
                <td>${new Date(r.entry_time).toLocaleString()}</td>
                <td>${new Date(r.exit_time).toLocaleString()}</td>
                <td>${r.duration}</td>
                <td>₱${parseFloat(r.parking_fee).toFixed(2)}</td>
            </tr>
        `;
    });
    
    $('#reports-body').html(html);
    currentReportPage = page;
}

function renderPagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / reportsPerPage);
    
    if (totalPages <= 1) {
        $('#pagination-container').hide();
        return;
    }
    
    let paginationHtml = '<div class="pagination">';
    
    // Previous button
    paginationHtml += `
        <button class="pagination-btn ${currentReportPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentReportPage - 1})" 
                ${currentReportPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;
    
    // Page numbers
    paginationHtml += '<div class="pagination-pages">';
    
    // Show first page
    if (currentReportPage > 3) {
        paginationHtml += `<button class="pagination-btn page-number" onclick="changePage(1)">1</button>`;
        if (currentReportPage > 4) {
            paginationHtml += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Show pages around current page
    for (let i = Math.max(1, currentReportPage - 2); i <= Math.min(totalPages, currentReportPage + 2); i++) {
        paginationHtml += `
            <button class="pagination-btn page-number ${i === currentReportPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Show last page
    if (currentReportPage < totalPages - 2) {
        if (currentReportPage < totalPages - 3) {
            paginationHtml += '<span class="pagination-ellipsis">...</span>';
        }
        paginationHtml += `<button class="pagination-btn page-number" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    paginationHtml += '</div>';
    
    // Next button
    paginationHtml += `
        <button class="pagination-btn ${currentReportPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentReportPage + 1})" 
                ${currentReportPage === totalPages ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationHtml += '</div>';
    
    // Show info
    const startRecord = (currentReportPage - 1) * reportsPerPage + 1;
    const endRecord = Math.min(currentReportPage * reportsPerPage, totalRecords);
    paginationHtml += `
        <div class="pagination-info">
            Showing ${startRecord} to ${endRecord} of ${totalRecords} records
        </div>
    `;
    
    $('#pagination-container').html(paginationHtml).show();
}

function changePage(page) {
    const totalPages = Math.ceil(allReportData.length / reportsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    displayReportPage(page);
    renderPagination(allReportData.length);
    
    // Scroll to top of table
    $('#reports-table')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== FILTER REPORT TABLE (Client-side search) ====================
function filterReportTable(searchValue) {
    const search = searchValue.toUpperCase();
    const rows = $('#reports-body tr');
    
    rows.each(function() {
        const vehicleNumber = $(this).find('td:first').text().toUpperCase();
        if (vehicleNumber.includes(search) || search === '') {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}


// ==================== COMPLETE FIXED MISSING RECEIPT JAVASCRIPT ====================
// Replace your existing missing receipt JS with this

$(document).ready(function() {
    
    // ==================== OPEN MODAL ====================
    $(document).on('click', '#open-missing-receipt-modal, button:contains("Missing Receipt")', function() {
        $('#missing-receipt-modal').fadeIn(300);
        loadMissingReceipts();
    });
    
    // ==================== AUTO-CALCULATE FEE ====================
    $(document).on('click', '#calculate-fee-btn', function() {
        const vehicleType = $('#missing-vehicle-type').val();
        const entryTime = $('#missing-entry-time').val();
        const exitTime = $('#missing-exit-time').val();
        
        if (!vehicleType) {
            alert('Please select vehicle type first');
            return;
        }
        
        if (!entryTime || !exitTime) {
            alert('Please enter both entry and exit times');
            return;
        }
        
        // Calculate duration
        const entry = new Date(entryTime);
        const exit = new Date(exitTime);
        const minutes = Math.floor((exit - entry) / 60000);
        const hours = Math.ceil(minutes / 60);
        
        if (hours <= 0) {
            alert('Exit time must be after entry time');
            return;
        }
        
        // Calculate fee
        let fee = 0;
        if (vehicleType === 'two_wheeler') {
            fee = 10; // First hour
            if (hours > 1) {
                fee += (hours - 1) * 5; // Additional hours
            }
        } else if (vehicleType === 'four_wheeler') {
            fee = 20; // First hour
            if (hours > 1) {
                fee += (hours - 1) * 10; // Additional hours
            }
        }
        
        $('#missing-fee').val(fee.toFixed(2));
        
        if (typeof showMessage === 'function') {
            showMessage('success', `Fee calculated: ₱${fee.toFixed(2)} for ${hours} hour(s)`);
        } else {
            alert(`Fee calculated: ₱${fee.toFixed(2)} for ${hours} hour(s)`);
        }
    });
    
    // ==================== SUBMIT FORM ====================
    $(document).on('submit', '#create-missing-receipt-form', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            vehicle_number: $('#missing-vehicle-number').val().trim().toUpperCase(),
            vehicle_type: $('#missing-vehicle-type').val(),
            slot_number: $('#missing-slot').val().trim().toUpperCase(),
            entry_time: $('#missing-entry-time').val(),
            exit_time: $('#missing-exit-time').val(),
            parking_fee: parseFloat($('#missing-fee').val()) || 0,
            notes: $('#missing-notes').val().trim() || 'MISSING RECEIPT - MANUAL ENTRY'
        };
        
        // Validate
        if (!formData.vehicle_number || !formData.vehicle_type || !formData.slot_number) {
            alert('Please fill in all required fields (Vehicle Number, Type, Slot)');
            return;
        }
        
        if (!formData.entry_time || !formData.exit_time) {
            alert('Please enter both entry and exit times');
            return;
        }
        
        if (formData.parking_fee <= 0) {
            alert('Please enter a valid parking fee or use Auto-Calculate');
            return;
        }
        
        // Show loading
        const submitBtn = $('#create-missing-receipt-form button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Creating...').prop('disabled', true);
        
        // Send to API
        $.ajax({
            url: 'api/create_missing_receipt.php',
            method: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    if (typeof showMessage === 'function') {
                        showMessage('success', 'Missing receipt record created successfully!');
                    } else {
                        alert('Missing receipt record created successfully!');
                    }
                    
                    // Clear form
                    $('#create-missing-receipt-form')[0].reset();
                    
                    // Reload table
                    loadMissingReceipts();
                } else {
                    alert('Error: ' + (response.message || 'Failed to create record'));
                }
            },
            error: function(xhr) {
                console.error('Error:', xhr);
                alert('Failed to create record. Please check console and try again.');
            },
            complete: function() {
                submitBtn.html(originalText).prop('disabled', false);
            }
        });
    });
    
});

// ==================== CLOSE MODALS ====================
function closeMissingReceiptModal() {
    $('#missing-receipt-modal').fadeOut(300);
}

function closeViewReceiptModal() {
    $('#view-receipt-modal').fadeOut(300);
}


// ==================== FIXED LOAD MISSING RECEIPTS ====================
// Replace your loadMissingReceipts() function with this

function loadMissingReceipts() {
    console.log('Loading missing receipts...');
    
    $('#missing-receipts-body').html('<tr><td colspan="9" style="text-align: center; padding: 25px; color: #999;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>');
    
    $.ajax({
        url: 'api/get_missing_receipts.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Response:', response);
            
            // Check if we have data
            if (response.success && response.data && response.data.length > 0) {
                console.log('Found ' + response.data.length + ' records');
                displayMissingReceiptsTable(response.data);
                updateMissingSummary(response.summary);
            } else {
                console.log('No records found');
                $('#missing-receipts-body').html('<tr><td colspan="9" style="text-align: center; padding: 25px; color: #999; font-style: italic; font-size: 13px;">No missing receipt records yet. Create one using the form above.</td></tr>');
                updateMissingSummary({ count: 0, total: 0 });
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', status, error);
            console.error('Response:', xhr.responseText);
            $('#missing-receipts-body').html('<tr><td colspan="9" style="text-align: center; padding: 25px; color: #e74c3c;">Failed to load data. Error: ' + error + '</td></tr>');
        }
    });
}

// ==================== DISPLAY TABLE (UPDATED) ====================
function displayMissingReceiptsTable(records) {
    console.log('Displaying ' + records.length + ' records');
    
    const tbody = $('#missing-receipts-body');
    tbody.empty();
    
    if (!records || records.length === 0) {
        tbody.html('<tr><td colspan="9" style="text-align: center; padding: 25px; color: #999;">No records to display</td></tr>');
        return;
    }
    
    records.forEach(function(record) {
        console.log('Processing record:', record);
        
        const entryTime = new Date(record.entry_time).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const exitTime = new Date(record.exit_time).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const fee = parseFloat(record.parking_fee).toFixed(2);
        
        const row = $(`
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 8px; font-size: 12px; font-weight: bold; color: #3498db;">#${String(record.id).padStart(6, '0')}</td>
                <td style="padding: 10px 8px; font-size: 12px; font-weight: bold;">${record.vehicle_number}</td>
                <td style="padding: 10px 8px; font-size: 12px;">${record.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                <td style="padding: 10px 8px; font-size: 12px;"><span style="background: #3498db; color: white; padding: 2px 7px; border-radius: 3px; font-size: 11px;">${record.slot_number}</span></td>
                <td style="padding: 10px 8px; font-size: 11px;">${entryTime}</td>
                <td style="padding: 10px 8px; font-size: 11px;">${exitTime}</td>
                <td style="padding: 10px 8px; font-size: 12px;">${record.duration}</td>
                <td style="padding: 10px 8px; font-size: 12px; font-weight: bold; color: #27ae60;">₱${fee}</td>
                <td style="padding: 10px 8px; text-align: center;">
                    <button class="btn-view-receipt" style="padding: 6px 12px; font-size: 11px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `);
        
        // Attach click event with proper data
        row.find('.btn-view-receipt').on('click', function() {
            console.log('Viewing receipt for:', record);
            viewReceipt(record);
        });
        
        tbody.append(row);
    });
    
    console.log('Table populated with ' + records.length + ' rows');
}

// ==================== UPDATE SUMMARY ====================
function updateMissingSummary(summary) {
    console.log('Updating summary:', summary);
    $('#missing-receipts-count').text(summary.count || 0);
    $('#missing-receipts-total').text('₱' + parseFloat(summary.total || 0).toFixed(2));
}

// ==================== VIEW RECEIPT ====================
function viewReceipt(record) {
    const entryTime = new Date(record.entry_time).toLocaleString();
    const exitTime = new Date(record.exit_time).toLocaleString();
    const now = new Date().toLocaleString();
    
    const receiptHTML = `
        <div style="font-family: 'Courier New', monospace; padding: 18px; border: 2px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px;">
                <h2 style="margin: 0; font-size: 19px;">PARKING RECEIPT</h2>
                <div style="background: #ffc107; color: #856404; padding: 4px 8px; margin: 8px 0; font-weight: bold; border-radius: 4px; font-size: 12px;">
                    MISSING RECEIPT - REPLACEMENT
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 12px;">
                Receipt #<span style="font-weight: bold; font-size: 17px;">${String(record.id).padStart(6, '0')}</span>
            </div>
            
            <table style="width: 100%; font-size: 12px; margin-bottom: 12px;">
                <tr>
                    <td style="padding: 4px 0; font-weight: 600;">Vehicle:</td>
                    <td style="text-align: right; font-weight: bold;">${record.vehicle_number}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: 600;">Type:</td>
                    <td style="text-align: right;">${record.vehicle_type.replace('_', ' ').toUpperCase()}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: 600;">Slot:</td>
                    <td style="text-align: right;">${record.slot_number}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: 600;">Entry:</td>
                    <td style="text-align: right; font-size: 11px;">${entryTime}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: 600;">Exit:</td>
                    <td style="text-align: right; font-size: 11px;">${exitTime}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: 600;">Duration:</td>
                    <td style="text-align: right; color: #e74c3c; font-weight: bold;">${record.duration}</td>
                </tr>
            </table>
            
            <div style="border-top: 2px dashed #000; padding-top: 12px; text-align: center;">
                <div style="font-size: 11px; color: #666; margin-bottom: 4px;">TOTAL AMOUNT</div>
                <div style="font-size: 28px; font-weight: bold; color: #27ae60;">₱${parseFloat(record.parking_fee).toFixed(2)}</div>
            </div>
            
            <div style="border-top: 1px solid #ccc; margin-top: 12px; padding-top: 10px; text-align: center; font-size: 10px; color: #888;">
                <div>Thank you for parking with us!</div>
                <div style="margin-top: 4px;">Generated: ${now}</div>
                ${record.notes ? '<div style="margin-top: 4px;">Note: ' + record.notes + '</div>' : ''}
            </div>
        </div>
    `;
    
    $('#receipt-display-content').html(receiptHTML);
    $('#view-receipt-modal').fadeIn(300);
}

// ==================== CLOSE ON OVERLAY CLICK ====================
$(document).on('click', '.modal-overlay', function(e) {
    if ($(e.target).hasClass('modal-overlay')) {
        $(this).fadeOut(300);
    }
});