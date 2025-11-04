// tracking.js - Tracking functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchTrackingBtn = document.getElementById('searchTracking');
    const trackingNumberInput = document.getElementById('trackingNumber');
    const trackingResult = document.getElementById('trackingResult');
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Handle search
    searchTrackingBtn.addEventListener('click', function() {
        const trackingNumber = trackingNumberInput.value.trim();
        
        if (!trackingNumber) {
            showNotification('Masukkan nomor delivery order', 'error');
            return;
        }
        
        const trackingData = dataTracking[trackingNumber];
        
        if (!trackingData) {
            trackingResult.innerHTML = `
                <div class="tracking-error">
                    <div class="error-icon">❌</div>
                    <h3>Data Tidak Ditemukan</h3>
                    <p>Nomor delivery order <strong>${trackingNumber}</strong> tidak ditemukan.</p>
                    <p>Silakan periksa kembali nomor yang Anda masukkan.</p>
                </div>
            `;
            return;
        }
        
        // Calculate progress percentage based on status
        let progressPercentage = 0;
        let statusColor = '';
        
        switch(trackingData.status) {
            case 'Dikirim':
                progressPercentage = 25;
                statusColor = '#ff9800';
                break;
            case 'Dalam Perjalanan':
                progressPercentage = 60;
                statusColor = '#2196f3';
                break;
            case 'Selesai':
                progressPercentage = 100;
                statusColor = '#4caf50';
                break;
            default:
                progressPercentage = 10;
                statusColor = '#9e9e9e';
        }
        
        // Display tracking information
        trackingResult.innerHTML = `
            <div class="tracking-info">
                <div class="tracking-header">
                    <h2>Informasi Pengiriman</h2>
                    <span class="tracking-status" style="background: ${statusColor}">${trackingData.status}</span>
                </div>
                
                <div class="tracking-details-grid">
                    <div class="detail-item">
                        <label>Nomor DO</label>
                        <span>${trackingData.nomorDO}</span>
                    </div>
                    <div class="detail-item">
                        <label>Nama Pemesan</label>
                        <span>${trackingData.nama}</span>
                    </div>
                    <div class="detail-item">
                        <label>Ekspedisi</label>
                        <span>${trackingData.ekspedisi}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tanggal Kirim</label>
                        <span>${new Date(trackingData.tanggalKirim).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Jenis Paket</label>
                        <span>${trackingData.paket}</span>
                    </div>
                    <div class="detail-item">
                        <label>Total Pembayaran</label>
                        <span class="total-amount">${trackingData.total}</span>
                    </div>
                </div>
                
                <div class="progress-section">
                    <h3>Status Pengiriman</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercentage}%; background: ${statusColor}"></div>
                    </div>
                    <div class="progress-labels">
                        <span>Dikirim</span>
                        <span>Dalam Perjalanan</span>
                        <span>Selesai</span>
                    </div>
                </div>
            </div>
            
            <div class="tracking-history">
                <h3>Riwayat Pengiriman</h3>
                <div class="history-timeline">
                    ${trackingData.perjalanan.map((step, index) => `
                        <div class="timeline-item ${index === 0 ? 'active' : ''}">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <div class="timeline-time">${step.waktu}</div>
                                <div class="timeline-description">${step.keterangan}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // Allow Enter key to trigger search
    trackingNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTrackingBtn.click();
        }
    });
});

// Add CSS for tracking page
const trackingStyle = document.createElement('style');
trackingStyle.textContent = `
    .tracking-error {
        text-align: center;
        padding: 40px;
        color: var(--text-light);
    }
    
    .error-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.7;
    }
    
    .tracking-info {
        padding: 30px;
        border-bottom: 1px solid var(--medium-gray);
    }
    
    .tracking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
    }
    
    .tracking-status {
        background: var(--primary-pink);
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .tracking-details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .detail-item {
        display: flex;
        flex-direction: column;
    }
    
    .detail-item label {
        font-weight: 600;
        color: var(--text-light);
        font-size: 0.9rem;
        margin-bottom: 5px;
    }
    
    .detail-item span {
        color: var(--text-dark);
        font-size: 1rem;
    }
    
    .total-amount {
        color: var(--primary-pink) !important;
        font-weight: 600;
        font-size: 1.1rem !important;
    }
    
    .progress-section {
        margin-top: 30px;
    }
    
    .progress-bar {
        background: var(--medium-gray);
        height: 8px;
        border-radius: 4px;
        margin: 15px 0;
        overflow: hidden;
    }
    
    .progress {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
    }
    
    .progress-labels {
        display: flex;
        justify-content: space-between;
        color: var(--text-light);
        font-size: 0.8rem;
    }
    
    .tracking-history {
        padding: 30px;
    }
    
    .history-timeline {
        position: relative;
        margin-top: 20px;
    }
    
    .timeline-item {
        display: flex;
        margin-bottom: 25px;
        position: relative;
    }
    
    .timeline-item:not(:last-child):before {
        content: '';
        position: absolute;
        left: 9px;
        top: 25px;
        bottom: -25px;
        width: 2px;
        background: var(--medium-gray);
    }
    
    .timeline-marker {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--medium-gray);
        margin-right: 20px;
        flex-shrink: 0;
        position: relative;
        z-index: 2;
    }
    
    .timeline-item.active .timeline-marker {
        background: var(--primary-pink);
        box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.2);
    }
    
    .timeline-content {
        flex: 1;
    }
    
    .timeline-time {
        font-weight: 600;
        color: var(--primary-purple);
        margin-bottom: 5px;
    }
    
    .timeline-description {
        color: var(--text-dark);
        line-height: 1.4;
    }
    
    @media (max-width: 768px) {
        .tracking-details-grid {
            grid-template-columns: 1fr;
        }
        
        .tracking-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(trackingStyle);