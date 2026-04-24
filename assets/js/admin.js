// ==========================================
// 🛡️ ADMIN PANEL MASTER LOGIC (CLEAN, LIVE & PREMIUM)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // 👇 1. APNA SCRIPT URL AUR KEY DALEIN 👇
    const API_KEY = "SNKPM_ADMIN_2026";
    const baseSheetURL = 'https://script.google.com/macros/s/AKfycbxmLFd9i1Up4AUwqR9O0EPA6690BBJMrbu4_cUU9qaHHiEv-_W3VhApZMIKkDzm-lRC/exec';
    const sheetURL = `${baseSheetURL}?key=${API_KEY}`;

    // --- UI ELEMENTS ---
    const dashboardTable = document.getElementById('dashboardRecentTable');
    const statTotal = document.getElementById('statTotalAdmissions');
    const statNew = document.getElementById('statNewInquiries');
    const fullAdmissionsTable = document.getElementById('fullAdmissionsTable');
    const statCourses = document.getElementById('statCourses');
    const statRevenue = document.getElementById('statRevenue');
    const searchInput = document.getElementById('topSearchBar');
    const classFilter = document.getElementById('classFilter');
    const smsBtn = document.getElementById('quickSmsBtn');
    const smsText = document.getElementById('quickSmsText');

    let globalStudentData = []; // 🧠 GLOBAL DATA STORE

    // --- 🌌 BACKGROUND STARS ANIMATION ---
    const starsContainer = document.querySelector('.global-stars');
    if (starsContainer) {
        starsContainer.style.position = 'relative';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            star.style.position = 'absolute';
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.background = '#22d3ee';
            star.style.borderRadius = '50%';
            star.style.opacity = `${Math.random() * 0.7 + 0.2}`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.pointerEvents = 'none';
            star.style.boxShadow = '0 0 12px rgba(34, 211, 238, 0.45)';
            star.style.animation = `twinkle ${Math.random() * 4 + 3}s linear infinite`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            fragment.appendChild(star);
        }

        starsContainer.appendChild(fragment);

        const style = document.createElement('style');
        style.innerHTML = `@keyframes twinkle { 0% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; } 100% { opacity: 0.2; transform: translateY(-20px); } }`;
        document.head.appendChild(style);
    }

    // --- 📢 SMS LOGIC ---
    if (smsBtn && smsText) {
        smsBtn.addEventListener('click', () => {
            const message = smsText.value.trim();
            if (message === "") { alert("Please type a message first!"); return; }

            const originalHtml = smsBtn.innerHTML;
            smsBtn.innerHTML = `<i class="ph ph-spinner animate-spin text-lg"></i> Sending...`;
            smsBtn.style.pointerEvents = "none";
            smsBtn.style.opacity = "0.7";

            setTimeout(() => {
                smsBtn.innerHTML = `<i class="ph-fill ph-check-circle text-lg"></i> Sent Successfully!`;
                smsBtn.style.background = "#10b981";
                smsBtn.style.opacity = "1";
                smsText.value = '';
                setTimeout(() => {
                    smsBtn.innerHTML = originalHtml;
                    smsBtn.style.background = "";
                    smsBtn.style.pointerEvents = "auto";
                }, 3000);
            }, 2000);
        });
    }

    // --- 🔍 ADVANCED SEARCH & FILTER ---
    function filterTable() {
        const filterText = searchInput ? searchInput.value.toLowerCase() : "";
        const filterClass = classFilter ? classFilter.value.toLowerCase() : "";
        const activeTable = dashboardTable || fullAdmissionsTable;

        if (activeTable) {
            const rows = activeTable.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                if (cells.length > 1) {
                    let textMatch = false;
                    let classMatch = false;

                    for (let j = 0; j < cells.length; j++) {
                        const cellText = cells[j].textContent || cells[j].innerText;
                        if (cellText.toLowerCase().indexOf(filterText) > -1) {
                            textMatch = true; break;
                        }
                    }
                    const classCellText = cells[1].textContent || cells[1].innerText;
                    if (filterClass === "" || classCellText.toLowerCase().trim() === filterClass) classMatch = true;

                    if (textMatch && classMatch) rows[i].style.display = "";
                    else rows[i].style.display = "none";
                }
            }
        }
    }
    if (searchInput) searchInput.addEventListener('keyup', filterTable);
    if (classFilter) classFilter.addEventListener('change', filterTable);

    // --- Dynamic Status Badge Helper ---
    function getStatusBadge(status, uniqueId) {
        if (status === 'Verified') {
            return `<span id="tableStatus-${uniqueId}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 tracking-wide uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]"><i class="ph-fill ph-check-circle"></i> Verified</span>`;
        } else if (status === 'Rejected') {
            return `<span id="tableStatus-${uniqueId}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[11px] font-bold border border-rose-500/20 tracking-wide uppercase"><i class="ph-fill ph-x-circle"></i> Rejected</span>`;
        } else {
            return `<span id="tableStatus-${uniqueId}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20 tracking-wide uppercase"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Pending</span>`;
        }
    }

    // --- 🧮 REAL-TIME STATS CALCULATOR ---
    window.recalculateStats = function() {
        const data = globalStudentData;
        
        let uniqueClasses = new Set();
        let todayCount = 0;
        let pendingCount = 0;
        let verifiedCount = 0;
        let thisMonthCount = 0;
        let lastMonthCount = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth < 0) { previousMonth = 11; previousYear--; }

        data.forEach(item => {
            if (item.Class) uniqueClasses.add(item.Class.trim());
            const itemDate = new Date(item.Timestamp);

            if (itemDate.toDateString() === now.toDateString()) todayCount++;
            if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) thisMonthCount++;
            else if (itemDate.getMonth() === previousMonth && itemDate.getFullYear() === previousYear) lastMonthCount++;

            const status = item.Status ? item.Status.trim() : 'Pending';
            if (status === 'Pending') pendingCount++;
            if (status === 'Verified') verifiedCount++;
        });

        // Update DOM Elements directly
        if (statTotal) statTotal.innerText = data.length;
        if (statCourses) statCourses.innerText = uniqueClasses.size;
        if (statNew) statNew.innerText = thisMonthCount;

        // 💰 REVENUE LOGIC
        const FEE_PER_STUDENT = 15000;
        const totalRevenue = verifiedCount * FEE_PER_STUDENT; // Sirf Verified
        const pendingRevenue = pendingCount * FEE_PER_STUDENT; // Sirf Pending

        if (statRevenue) {
            if (totalRevenue >= 100000) statRevenue.innerText = `₹${(totalRevenue / 100000).toFixed(1)}L`;
            else if (totalRevenue >= 1000) statRevenue.innerText = `₹${(totalRevenue / 1000).toFixed(1)}K`;
            else statRevenue.innerText = `₹${totalRevenue}`;
        }

        const statTotalSub = document.getElementById('statTotalSub');
        const statNewSub = document.getElementById('statNewSub');
        const statRevPending = document.getElementById('statRevPending');

        if (statTotalSub) {
            if (lastMonthCount === 0) {
                statTotalSub.innerHTML = thisMonthCount > 0 ? `<span class="text-green-400"><i class="ph-bold ph-trend-up"></i> +100% from last month</span>` : `<span class="text-gray-500">0% from last month</span>`;
            } else {
                const diff = thisMonthCount - lastMonthCount;
                const percentage = ((diff / lastMonthCount) * 100).toFixed(1);
                if (diff > 0) statTotalSub.innerHTML = `<span class="text-green-400"><i class="ph-bold ph-trend-up"></i> +${percentage}% from last month</span>`;
                else if (diff < 0) statTotalSub.innerHTML = `<span class="text-red-400"><i class="ph-bold ph-trend-down"></i> ${percentage}% from last month</span>`;
                else statTotalSub.innerHTML = `<span class="text-gray-400">0% from last month</span>`;
            }
        }

        if (statNewSub) {
            statNewSub.innerHTML = todayCount > 0 ? `<span class="text-green-400"><i class="ph-bold ph-trend-up"></i> +${todayCount} today</span>` : `<span class="text-gray-500">0 today</span>`;
        }

        if (statRevPending) {
            let formattedPending = pendingRevenue >= 1000 ? `₹${(pendingRevenue / 1000).toFixed(1)}K` : `₹${pendingRevenue}`;
            statRevPending.innerHTML = `Pending: <span class="text-yellow-400 font-bold">${formattedPending}</span>`;
        }
    };

    // --- 📊 FETCH DATA & RENDER ---
    if (dashboardTable || fullAdmissionsTable) {
        const liveURL = `${sheetURL}&nocache=${new Date().getTime()}`;

        fetch(liveURL)
            .then(response => response.json())
            .then(rawData => {
                globalStudentData = rawData.filter(student => student['Student Name'] && student['Student Name'].trim() !== '');

                // Call Calculator
                window.recalculateStats();

                // 🚀 Notifications Logic
                const notifBadge = document.getElementById('notificationCountBadge');
                const notifList = document.getElementById('notificationList');
                let seenCount = parseInt(localStorage.getItem('seenAdmissionsCount')) || 0;

                if (seenCount > globalStudentData.length) {
                    seenCount = globalStudentData.length;
                    localStorage.setItem('seenAdmissionsCount', seenCount);
                }

                let actualNewCount = globalStudentData.length - seenCount;
                if (notifBadge) notifBadge.innerText = `${actualNewCount} New`;

                if (notifList) {
                    notifList.innerHTML = '';
                    if (actualNewCount === 0) {
                        notifList.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">All caught up! No new alerts. 🚀</div>`;
                    } else {
                        globalStudentData.slice(0, actualNewCount).forEach(student => {
                            const rawTime = student['Timestamp'];
                            const safeName = student['Student Name'].replace(/'/g, "\\'");
                            const uniqueId = safeName.replace(/\s+/g, '') + '_' + Date.parse(rawTime);

                            notifList.innerHTML += `
                            <div onclick="viewStudentProfile('${safeName}', '${student['Class']}', '${student['Mobile'] || 'N/A'}', '${student['Gender'] || 'N/A'}', '${uniqueId}', '${student['Status'] || 'Pending'}'); this.remove(); decreaseNotifCount();" class="p-4 border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer flex gap-4 group/item relative overflow-hidden">
                                <div class="relative w-10 h-10 rounded-full bg-[#151e32] flex items-center justify-center border border-white/5 shrink-0">
                                    <i class="ph-fill ph-student text-[#a855f7] text-lg"></i>
                                </div>
                                <div class="relative w-full">
                                    <p class="text-sm text-gray-200 font-medium">New Admission Request</p>
                                    <p class="text-xs text-gray-400 mt-1"><span class="text-white">${student['Student Name']}</span> for <span class="text-[#22d3ee]">${student['Class']}</span>.</p>
                                </div>
                            </div>`;
                        });
                    }
                }

                window.decreaseNotifCount = function () {
                    let currentSeen = parseInt(localStorage.getItem('seenAdmissionsCount')) || 0;
                    localStorage.setItem('seenAdmissionsCount', currentSeen + 1);
                    if (notifBadge) {
                        let newBadgeCount = parseInt(notifBadge.innerText.replace(' New', '')) - 1;
                        notifBadge.innerText = newBadgeCount <= 0 ? '0 New' : `${newBadgeCount} New`;
                    }
                };

                const markAllReadBtn = document.getElementById('markAllReadBtn');
                if (markAllReadBtn) {
                    markAllReadBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        localStorage.setItem('seenAdmissionsCount', globalStudentData.length);
                        if (notifBadge) notifBadge.innerText = `0 New`;
                        if (notifList) notifList.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">All caught up! No new alerts. 🚀</div>`;
                    });
                }

                // Render Dashboard Table
                if (dashboardTable) {
                    dashboardTable.innerHTML = '';
                    globalStudentData.slice(0, 4).forEach(student => {
                        const rawTime = student['Timestamp'];
                        const dateStr = new Date(rawTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                        const safeName = student['Student Name'].replace(/'/g, "\\'");
                        const uniqueId = safeName.replace(/\s+/g, '') + '_' + Date.parse(rawTime);
                        const currentStatus = student['Status'] || 'Pending';
                        const initials = student['Student Name'].substring(0, 2).toUpperCase();

                        dashboardTable.innerHTML += `
                        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td class="py-4 pr-4 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#22d3ee] to-[#a855f7] flex justify-center items-center text-white text-xs font-bold shadow-lg">${initials}</div>
                                <span class="font-medium text-white capitalize">${student['Student Name']}</span>
                            </td>
                            <td class="py-4 px-4">${student['Class']}</td>
                            <td class="py-4 px-4 text-gray-400">${dateStr}</td>
                            <td class="py-4 px-4">${getStatusBadge(currentStatus, uniqueId)}</td>
                            <td class="py-4 pl-4 text-right">
                                <button onclick="viewStudentProfile('${safeName}', '${student['Class']}', '${student['Mobile'] || 'N/A'}', '${student['Gender'] || 'N/A'}', '${uniqueId}', '${currentStatus}')" class="text-gray-300 bg-white/5 hover:bg-[#22d3ee]/20 hover:text-[#22d3ee] p-2 rounded-lg transition-all border border-transparent hover:border-[#22d3ee]/30"><i class="ph-duotone ph-eye text-lg"></i></button>
                            </td>
                        </tr>`;
                    });
                }

                // Render Full Admissions Table
                if (fullAdmissionsTable) {
                    fullAdmissionsTable.innerHTML = '';
                    globalStudentData.forEach(student => {
                        const rawTime = student['Timestamp'];
                        const dateStr = new Date(rawTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                        const safeName = student['Student Name'].replace(/'/g, "\\'");
                        const uniqueId = safeName.replace(/\s+/g, '') + '_' + Date.parse(rawTime);
                        const currentStatus = student['Status'] || 'Pending';
                        const initials = student['Student Name'].substring(0, 2).toUpperCase();
                        const mobile = student['Mobile'] || 'N/A';
                        const gender = student['Gender'] || 'N/A';

                        fullAdmissionsTable.innerHTML += `
                        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td class="py-4 px-4 flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#22d3ee] to-[#a855f7] flex justify-center items-center text-white text-xs font-bold shadow-lg">${initials}</div>
                                <div>
                                    <span class="font-medium text-white block">${student['Student Name']}</span>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-gray-300 font-medium">${student['Class']}</td>
                            <td class="py-4 px-4 text-gray-400"><i class="ph ph-phone mr-1"></i>${mobile}</td>
                            <td class="py-4 px-4 text-gray-400">${gender}</td>
                            <td class="py-4 px-4 text-gray-400">${dateStr}</td>
                            <td class="py-4 px-4">${getStatusBadge(currentStatus, uniqueId)}</td>
                            <td class="py-4 px-4 text-right">
                                <button onclick="viewStudentProfile('${safeName}', '${student['Class']}', '${mobile}', '${gender}', '${uniqueId}', '${currentStatus}')" class="bg-[#151e32] border border-white/5 p-2 rounded-lg text-gray-400 hover:text-[#22d3ee] hover:border-[#22d3ee]/30 transition-all mr-2"><i class="ph ph-eye text-lg"></i></button>
                            </td>
                        </tr>`;
                    });
                }
            });
    }

    // --- 👤 PROFILE POPUP MODAL (NEW ID CARD STYLE) ---
    window.viewStudentProfile = function (name, studentClass, mobile, gender, uniqueId, currentStatus) {
        const existingModal = document.getElementById('studentProfileModal');
        if (existingModal) existingModal.remove();

        const initials = name.substring(0, 2).toUpperCase();
        let statusColorClass = currentStatus === 'Verified' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : currentStatus === 'Rejected' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        let statusIcon = currentStatus === 'Verified' ? 'check-circle' : currentStatus === 'Rejected' ? 'x-circle' : 'hourglass-medium';

        const modal = document.createElement('div');
        modal.id = 'studentProfileModal';
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#050810]/90 backdrop-blur-md transition-all duration-300 opacity-0 cursor-pointer';

        modal.innerHTML = `
            <div class="relative w-[90%] max-w-sm bg-[#0b1120] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 transform scale-95 transition-all duration-300 cursor-default" id="modalContent-${uniqueId}">
                
                <div class="h-28 bg-gradient-to-r from-[#22d3ee] to-[#a855f7] relative">
                    <button onclick="closeProfileModal()" class="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all duration-300">
                        <i class="ph ph-x font-bold"></i>
                    </button>
                </div>
                
                <div class="px-6 pb-8 relative">
                    <div class="w-24 h-24 rounded-full border-4 border-[#0b1120] bg-gradient-to-br from-[#151e32] to-[#1e293b] flex items-center justify-center text-3xl font-black text-white shadow-xl -mt-12 mx-auto relative z-10">
                        ${initials}
                        <div class="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 border-[3px] border-[#0b1120] rounded-full"></div>
                    </div>
                    
                    <div class="text-center mt-3 mb-6">
                        <h3 class="text-2xl font-extrabold text-white capitalize tracking-wide">${name}</h3>
                        <span class="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-[#22d3ee] font-bold tracking-widest uppercase mt-2">
                            Applicant Info
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="bg-[#151e32]/50 hover:bg-[#151e32] border border-white/5 rounded-2xl p-3.5 text-center transition-colors">
                            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Class</p>
                            <p class="text-white font-extrabold text-lg">${studentClass}</p>
                        </div>
                        <div class="bg-[#151e32]/50 hover:bg-[#151e32] border border-white/5 rounded-2xl p-3.5 text-center transition-colors">
                            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Mobile</p>
                            <p class="text-white font-bold">${mobile}</p>
                        </div>
                        <div class="bg-[#151e32]/50 hover:bg-[#151e32] border border-white/5 rounded-2xl p-3.5 text-center transition-colors">
                            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Gender</p>
                            <p class="text-gray-300 font-semibold">${gender}</p>
                        </div>
                        <div class="bg-[#151e32]/50 hover:bg-[#151e32] border border-white/5 rounded-2xl p-3.5 text-center flex flex-col justify-center items-center transition-colors" id="statusBox-${uniqueId}">
                            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                            <span class="${statusColorClass} border px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                <i class="ph-fill ph-${statusIcon} text-sm"></i> ${currentStatus}
                            </span>
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button id="rBtn-${uniqueId}" onclick="updateStatus('${name}', 'Rejected', '${uniqueId}')" class="flex-1 py-3.5 rounded-xl bg-transparent border border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/10 transition-all duration-300 flex items-center justify-center gap-2">
                            <i class="ph ph-x-circle text-xl"></i> Reject
                        </button>
                        <button id="vBtn-${uniqueId}" onclick="updateStatus('${name}', 'Verified', '${uniqueId}')" class="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                            <i class="ph-bold ph-check-circle text-xl"></i> Approve
                        </button>
                    </div>
                </div>
            </div>`;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeProfileModal();
        });

        setTimeout(() => {
            modal.classList.remove('opacity-0');
            document.getElementById(`modalContent-${uniqueId}`).classList.remove('scale-95');
        }, 10);
    };

    window.closeProfileModal = function () {
        const modal = document.getElementById('studentProfileModal');
        if (modal) {
            modal.classList.add('opacity-0');
            const content = modal.querySelector('div');
            if (content) content.classList.add('scale-95');
            setTimeout(() => modal.remove(), 300);
        }
    };

    // --- 🚀 STATUS UPDATE LOGIC (NOW WITH AUTO-CALCULATE) ---
    window.updateStatus = function (name, status, uniqueId) {
        const vBtn = document.getElementById(`vBtn-${uniqueId}`);
        const rBtn = document.getElementById(`rBtn-${uniqueId}`);

        if (status === 'Verified' && vBtn) vBtn.innerHTML = `<i class="ph ph-spinner animate-spin text-lg"></i> Updating...`;
        if (status === 'Rejected' && rBtn) rBtn.innerHTML = `<i class="ph ph-spinner animate-spin text-lg"></i> Updating...`;

        const updateURL = `${baseSheetURL}?key=${API_KEY}&action=update&name=${encodeURIComponent(name)}&status=${status}`;

        fetch(updateURL, { mode: 'no-cors' })
            .then(() => {
                
                // 1. UPDATE MODAL UI
                const statusBox = document.getElementById(`statusBox-${uniqueId}`);
                if (statusBox) {
                    let newColor = status === 'Verified' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                    let newIcon = status === 'Verified' ? 'check-circle' : 'x-circle';
                    statusBox.innerHTML = `
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                    <span class="${newColor} border px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <i class="ph-fill ph-${newIcon} text-sm"></i> ${status}
                    </span>`;
                }

                // 2. UPDATE TABLE BADGES
                const tableBadges = document.querySelectorAll(`[id="tableStatus-${uniqueId}"]`);
                tableBadges.forEach(badge => {
                    badge.innerHTML = status === 'Verified' ? '<i class="ph-fill ph-check-circle"></i> Verified' : '<i class="ph-fill ph-x-circle"></i> Rejected';
                    badge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} text-[11px] font-bold border tracking-wide uppercase`;
                });

                // 3. LOCK BUTTONS
                if (status === 'Verified' && vBtn) {
                    vBtn.innerHTML = `<i class="ph-bold ph-check text-xl"></i> Approved`;
                    vBtn.className = "flex-1 py-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold flex items-center justify-center gap-2 cursor-default pointer-events-none";
                    if (rBtn) rBtn.classList.add('opacity-30', 'pointer-events-none');
                }
                if (status === 'Rejected' && rBtn) {
                    rBtn.innerHTML = `<i class="ph-bold ph-x text-xl"></i> Rejected`;
                    rBtn.className = "flex-1 py-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 font-bold flex items-center justify-center gap-2 cursor-default pointer-events-none";
                    if (vBtn) vBtn.classList.add('opacity-30', 'pointer-events-none');
                }

                // 🧠 4. MAGIC: UPDATE GLOBAL DATA & RECALCULATE WITHOUT REFRESH!
                const studentIndex = globalStudentData.findIndex(s => {
                    const expectedId = s['Student Name'].replace(/'/g, "\\'").replace(/\s+/g, '') + '_' + Date.parse(s['Timestamp']);
                    return expectedId === uniqueId;
                });

                if (studentIndex > -1) {
                    globalStudentData[studentIndex]['Status'] = status; // Memory update
                    window.recalculateStats(); // Dashboard re-calculate instantly!
                }
            });
    };
});