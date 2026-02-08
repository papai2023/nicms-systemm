/**
 * NICMS Mock Backend & Application Logic
 * Handles authentication, data persistence (localStorage), and business logic.
 */

// --- Constants & Config ---
// Simple salted hash (FNV-1a 32-bit) for demo purposes only
function simpleHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
}

const ROLES = {
    CORE_TEAM: 'core_team',
    SUPERVISOR: 'supervisor',
    ASSESSOR: 'assessment_officer',
    INTERVENOR: 'intervention_officer',
    WELFARE: 'welfare_officer',
    FOLLOWUP: 'followup_officer'
};

const COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu"];

// Mock Users
const USERS = [
    { id: 1, username: 'admin', password: 'password', role: ROLES.CORE_TEAM, name: 'Dr. Admin', county: 'All' },
    { id: 2, username: 'jane.supervisor', password: 'password', role: ROLES.SUPERVISOR, name: 'Sup. Jane', accessibleCounties: ['Nairobi'] },
    { id: 3, username: 'john.assessor', password: 'password', role: ROLES.ASSESSOR, name: 'Off. John', county: 'Nairobi' },
    { id: 4, username: 'mary.intervenor', password: 'password', role: ROLES.INTERVENOR, name: 'Therapist Mary', county: 'Nairobi' },
    { id: 5, username: 'grace.welfare', password: 'password', role: ROLES.WELFARE, name: 'Grace (Welfare)', county: 'Nairobi' },
    { id: 6, username: 'fred.followup', password: 'password', role: ROLES.FOLLOWUP, name: 'Fred (Follow-up)', county: 'Nairobi' },
    { id: 7, username: 'assessor_ref', password: 'password', role: ROLES.SUPERVISOR, name: 'Yvonne Shira', accessibleCounties: ['Taita Taveta', 'Kajiado', 'Nairobi'], extendedReferralView: true },
    { id: 8, username: 'followup_ref', password: 'password', role: ROLES.SUPERVISOR, name: 'Dominic Koech', accessibleCounties: ['Machakos', 'Makueni', 'Nairobi'], extendedReferralView: true },
    { id: 9, username: 'lilian', password: 'password', role: ROLES.SUPERVISOR, name: 'Lilian Iseren', accessibleCounties: ['Bungoma', 'Trans Nzoia'] },
    { id: 10, username: 'wilson', password: 'password', role: ROLES.SUPERVISOR, name: 'Wilson Nalwa', accessibleCounties: ['Busia', 'Kakamega'] },
    { id: 11, username: 'hudson', password: 'password', role: ROLES.SUPERVISOR, name: 'Hudson Obembi', accessibleCounties: ['Kisii', 'Migori'] },
    { id: 12, username: 'mariam', password: 'password', role: ROLES.SUPERVISOR, name: 'Mariam Maulid', accessibleCounties: ['Kwale', 'Kilifi'] },
    { id: 13, username: 'winnie', password: 'password', role: ROLES.SUPERVISOR, name: 'Winnie Adeke', accessibleCounties: ['Nandi', 'Kericho'] },
    { id: 14, username: 'steve', password: 'password', role: ROLES.SUPERVISOR, name: 'Steve Njoroge', accessibleCounties: ['Kitui', 'Muranga'] },
    { id: 15, username: 'vincent', password: 'password', role: ROLES.SUPERVISOR, name: 'Vincent Maniagi', accessibleCounties: ['Nakuru', 'Bomet'] },
    { id: 16, username: 'overall_supervisor', password: 'password', role: ROLES.SUPERVISOR, name: 'Overall Supervisor', accessibleCounties: ['Bungoma','Trans Nzoia','Busia','Kakamega','Kisii','Migori','Kwale','Kilifi','Nandi','Kericho','Kitui','Muranga','Nakuru','Bomet','Kiambu','Nairobi'] },
    { id: 17, username: 'caleb', password: 'password', role: ROLES.CORE_TEAM, name: 'Dr Caleb Barasa', county: 'All', perms: { adminUsers: false, trainingUpload: false, full: false } },
    { id: 18, username: 'steve.wafula', password: 'password', role: ROLES.CORE_TEAM, name: 'Steve Wafula', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: false } },
    { id: 19, username: 'susannah', password: 'password', role: ROLES.CORE_TEAM, name: 'Prof. Susannah Leppanen', county: 'All', perms: { adminUsers: false, trainingUpload: false, full: false } },
    { id: 20, username: 'pascalia', password: 'password', role: ROLES.CORE_TEAM, name: 'Pascalia Papai', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: true, canRefer: false }, extendedReferralView: true },
    { id: 21, username: 'maxwel', password: 'password', role: ROLES.CORE_TEAM, name: 'Maxwel Papai', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: true, canRefer: false }, extendedReferralView: true },
    { id: 22, username: 'simon', password: 'password', role: ROLES.CORE_TEAM, name: 'Simon Kamar', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: true, canRefer: false }, extendedReferralView: true },
    { id: 23, username: 'rosemary', password: 'password', role: ROLES.SUPERVISOR, name: 'Rosemary Omunyu', county: 'All' },
    { id: 24, username: 'musa.lepose', password: 'password', role: ROLES.CORE_TEAM, name: 'Musa Lepose', county: 'All', perms: { adminUsers: false, trainingUpload: false, full: false, canRefer: true } },
    { id: 25, username: 'elizabeth', password: 'password', role: ROLES.SUPERVISOR, name: 'Elizabeth Amoit', county: 'All' },
    { id: 26, username: 'silus', password: 'password', role: ROLES.SUPERVISOR, name: 'Silus Osheyo', county: 'All' },
    { id: 27, username: 'eliud', password: 'password', role: ROLES.SUPERVISOR, name: 'Eliud Ojala', county: 'All' },
    { id: 28, username: 'scovia', password: 'password', role: ROLES.SUPERVISOR, name: 'Scovia Ngecho', county: 'All' },
    { id: 29, username: 'charleane', password: 'password', role: ROLES.SUPERVISOR, name: 'Charleane Isabella', county: 'All' }
    ,{ id: 30, username: 'levi', password: 'password', role: ROLES.SUPERVISOR, name: 'Levi Pala', county: 'All' }
];

const API_BASE = (() => {
    const host = window.location.hostname;
    // Local development
    if (host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:') {
        return 'http://localhost:3000/api';
    }
    // Production (Railway/etc): Assume API is served from the same origin under /api
    return '/api';
})();

async function apiFetch(path, options = {}, retries = 3, backoffMs = 200) {
    try {
        const res = await fetch(API_BASE + path, options);
        if (!res.ok) throw new Error('bad status');
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : res.text();
    } catch (e) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoffMs));
            return apiFetch(path, options, retries - 1, Math.min(backoffMs * 2, 2000));
        }
        throw e;
    }
}
// --- State Management (LocalStorage Wrapper) ---
const DB = {
    init: () => {
        if (!localStorage.getItem('nicms_cases')) localStorage.setItem('nicms_cases', JSON.stringify([]));
        if (!localStorage.getItem('nicms_logs')) localStorage.setItem('nicms_logs', JSON.stringify([]));
        const existingStr = localStorage.getItem('nicms_users');
        if (!existingStr) {
            const initialized = USERS.map(u => {
                const salt = `nicms:${u.username}`;
                const initialPassword = u.username;
                const passwordHash = simpleHash(salt + initialPassword);
                return { ...u, passwordSalt: salt, passwordHash, nameLocked: false };
            });
            localStorage.setItem('nicms_users', JSON.stringify(initialized));
        } else {
            try {
                const existing = JSON.parse(existingStr);
                const usernames = new Set(existing.map(u => u.username));
                const additions = USERS.filter(u => !usernames.has(u.username)).map(u => {
                    const salt = `nicms:${u.username}`;
                    const initialPassword = u.username;
                    const passwordHash = simpleHash(salt + initialPassword);
                    return { ...u, passwordSalt: salt, passwordHash, nameLocked: false };
                });
                let merged = existing.concat(additions);
                // Apply policy updates: restrict referral action, enable extended referral view
                const targetUsernames = new Set(['pascalia', 'maxwel', 'simon']);
                merged = merged.map(u => {
                    if (targetUsernames.has(u.username)) {
                        const perms = { ...(u.perms || {}) };
                        perms.canRefer = false;
                        // Preserve admin/full flags as-is
                        u.perms = perms;
                        u.extendedReferralView = true;
                    }
                    if (u.username === 'caleb') {
                        const perms = { ...(u.perms || {}) };
                        perms.canRefer = true;
                        u.perms = perms;
                    }
                    if (u.username === 'susannah') {
                        u.perms = { adminUsers: false, trainingUpload: false, full: false };
                    }
                    if (u.username === 'scovia') {
                        u.role = ROLES.SUPERVISOR;
                        u.county = 'All';
                    }
                    return u;
                });
                localStorage.setItem('nicms_users', JSON.stringify(merged));
            } catch (e) {
                // Fallback: reinitialize if corrupted
                const initialized = USERS.map(u => {
                    const salt = `nicms:${u.username}`;
                    const initialPassword = u.username;
                    const passwordHash = simpleHash(salt + initialPassword);
                    return { ...u, passwordSalt: salt, passwordHash, nameLocked: false };
                });
                localStorage.setItem('nicms_users', JSON.stringify(initialized));
            }
        }
        // Cleanup old officer training submissions (TTL: 5 days)
        try {
            const submissionsStr = localStorage.getItem('nicms_training_submissions');
            if (submissionsStr) {
                const now = Date.now();
                const ttlMs = 5 * 24 * 60 * 60 * 1000;
                const submissions = JSON.parse(submissionsStr);
                const filtered = submissions.filter(s => {
                    const t = new Date(s.date).getTime();
                    return isFinite(t) && (now - t) < ttlMs;
                });
                if (filtered.length !== submissions.length) {
                    localStorage.setItem('nicms_training_submissions', JSON.stringify(filtered));
                }
            }
        } catch (_) {}
        try {
            fetch(API_BASE + '/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    users: JSON.parse(localStorage.getItem('nicms_users') || '[]'),
                    cases: JSON.parse(localStorage.getItem('nicms_cases') || '[]'),
                    logs: JSON.parse(localStorage.getItem('nicms_logs') || '[]'),
                    externalCerts: JSON.parse(localStorage.getItem('nicms_external_certs') || '[]'),
                    trainingMaterials: JSON.parse(localStorage.getItem('nicms_training_materials') || '[]'),
                    trainingSubmissions: JSON.parse(localStorage.getItem('nicms_training_submissions') || '[]'),
                    trainingCompletions: JSON.parse(localStorage.getItem('nicms_training_completions') || '[]')
                })
            });
        } catch (_) {}
    },
    getUsers: () => JSON.parse(localStorage.getItem('nicms_users')),
    saveUsers: (users) => {
        localStorage.setItem('nicms_users', JSON.stringify(users));
        try {
            fetch(API_BASE + '/users/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(users) });
        } catch (_) {}
    },
    updateUser: (updatedUser) => {
        const users = DB.getUsers();
        const idx = users.findIndex(u => u.username === updatedUser.username);
        if (idx >= 0) {
            users[idx] = updatedUser;
            DB.saveUsers(users);
            try {
                fetch(API_BASE + '/users/' + encodeURIComponent(updatedUser.username), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedUser) });
            } catch (_) {}
        }
    },
    getCases: () => JSON.parse(localStorage.getItem('nicms_cases')),
    saveCase: (newCase) => {
        const cases = DB.getCases();
        const existingIndex = cases.findIndex(c => c.id === newCase.id);
        if (existingIndex >= 0) {
            cases[existingIndex] = newCase;
        } else {
            cases.push(newCase);
        }
        localStorage.setItem('nicms_cases', JSON.stringify(cases));
        try {
            const url = existingIndex >= 0 ? (API_BASE + '/cases/' + encodeURIComponent(newCase.id)) : (API_BASE + '/cases');
            const method = existingIndex >= 0 ? 'PUT' : 'POST';
            fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCase) });
        } catch (_) {}
    },
    getLogs: () => JSON.parse(localStorage.getItem('nicms_logs')),
    addLog: (action, details) => {
        const logs = DB.getLogs();
        const user = Auth.getUser();
        logs.unshift({
            timestamp: new Date().toISOString(),
            user: user ? user.username : 'system',
            role: user ? user.role : 'system',
            action,
            details
        });
        localStorage.setItem('nicms_logs', JSON.stringify(logs));
        try {
            fetch(API_BASE + '/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logs[0]) });
        } catch (_) {}
    },
    fetchUsers: async () => {
        try {
            const data = await apiFetch('/users');
            localStorage.setItem('nicms_users', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_users') || '[]');
        }
    },
    fetchCases: async () => {
        try {
            const data = await apiFetch('/cases');
            localStorage.setItem('nicms_cases', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_cases') || '[]');
        }
    },
    fetchLogs: async () => {
        try {
            const data = await apiFetch('/logs');
            localStorage.setItem('nicms_logs', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_logs') || '[]');
        }
    },
    fetchTrainingMaterials: async () => {
        try {
            const data = await apiFetch('/training/materials');
            localStorage.setItem('nicms_training_materials', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_training_materials') || '[]');
        }
    },
    saveTrainingMaterial: async (m) => {
        try {
            await apiFetch('/training/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
        } catch (_) {}
        const mats = JSON.parse(localStorage.getItem('nicms_training_materials') || '[]');
        const i = mats.findIndex(x => x.id === m.id);
        if (i >= 0) mats[i] = m; else mats.unshift(m);
        localStorage.setItem('nicms_training_materials', JSON.stringify(mats));
    },
    fetchTrainingSubmissions: async () => {
        try {
            const data = await apiFetch('/training/submissions');
            localStorage.setItem('nicms_training_submissions', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_training_submissions') || '[]');
        }
    },
    saveTrainingSubmission: async (s) => {
        try {
            await apiFetch('/training/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
        } catch (_) {}
        const subs = JSON.parse(localStorage.getItem('nicms_training_submissions') || '[]');
        subs.unshift(s);
        localStorage.setItem('nicms_training_submissions', JSON.stringify(subs));
    },
    fetchTrainingCompletions: async () => {
        try {
            const data = await apiFetch('/training/completions');
            localStorage.setItem('nicms_training_completions', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_training_completions') || '[]');
        }
    },
    saveTrainingCompletions: async (arrOrOne) => {
        try {
            await apiFetch('/training/completions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(arrOrOne) });
        } catch (_) {}
        let completions = JSON.parse(localStorage.getItem('nicms_training_completions') || '[]');
        if (Array.isArray(arrOrOne)) completions = completions.concat(arrOrOne);
        else completions.push(arrOrOne);
        localStorage.setItem('nicms_training_completions', JSON.stringify(completions));
    },
    fetchExternalCertifications: async () => {
        try {
            const data = await apiFetch('/training/external-certs');
            localStorage.setItem('nicms_external_certs', JSON.stringify(data));
            return data;
        } catch (_) {
            return JSON.parse(localStorage.getItem('nicms_external_certs') || '[]');
        }
    },
    saveExternalCertification: async (cert) => {
        // cert: { id, courseName, completionDate, fileData, fileName, uploadedBy, uploadedAt, status, approvedBy }
        try {
            await apiFetch('/training/external-certs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cert) });
        } catch (_) {}
        const certs = JSON.parse(localStorage.getItem('nicms_external_certs') || '[]');
        const idx = certs.findIndex(c => c.id === cert.id);
        if (idx >= 0) certs[idx] = cert;
        else certs.unshift(cert);
        localStorage.setItem('nicms_external_certs', JSON.stringify(certs));
    }
};

// --- Authentication ---
const Auth = {
    login: (username, password) => {
        const users = DB.getUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            const candidateHash = simpleHash((user.passwordSalt || `nicms:${user.username}`) + password);
            if (candidateHash !== user.passwordHash) return false;
            localStorage.setItem('nicms_user', JSON.stringify(user));
            DB.addLog('Login', `User ${user.username} logged in`);
            return true;
        }
        return false;
    },
    logout: () => {
        const u = Auth.getUser();
        if (u) DB.addLog('Logout', `User ${u.username} logged out`);
        localStorage.removeItem('nicms_user');
        window.location.href = 'index.html';
    },
    getUser: () => JSON.parse(localStorage.getItem('nicms_user')),
    checkAuth: () => {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }
        return user;
    },
    
    // Strict Access Control
    enforceRole: (allowedRoles) => {
        const user = Auth.checkAuth();
        if (!user) return;

        if (!allowedRoles.includes(user.role)) {
            alert("Access Denied: You do not have permission to view this page.");
            Auth.redirectBasedOnRole(); // Send them back to their safe zone
        }
    },
    
    changePassword: (currentPassword, newPassword) => {
        const user = Auth.getUser();
        if (!user) return { ok: false, message: 'Not authenticated' };
        const users = DB.getUsers();
        const fullUser = users.find(u => u.username === user.username);
        if (!fullUser) return { ok: false, message: 'User not found' };
        
        const salt = fullUser.passwordSalt || `nicms:${fullUser.username}`;
        const currentHash = simpleHash(salt + currentPassword);
        if (currentHash !== fullUser.passwordHash) return { ok: false, message: 'Current password is incorrect' };
        if (!newPassword || newPassword.length < 8) return { ok: false, message: 'New password must be at least 8 characters' };
        
        fullUser.passwordHash = simpleHash(salt + newPassword);
        DB.updateUser(fullUser);
        localStorage.setItem('nicms_user', JSON.stringify(fullUser));
        DB.addLog('Password Changed', `Password updated for ${fullUser.username}`);
        return { ok: true };
    },
    
    changeName: (newName) => {
        const user = Auth.getUser();
        if (!user) return { ok: false, message: 'Not authenticated' };
        const users = DB.getUsers();
        const fullUser = users.find(u => u.username === user.username);
        if (!fullUser) return { ok: false, message: 'User not found' };
        if (['assessor_ref', 'followup_ref'].includes(fullUser.username)) {
            return { ok: false, message: 'Name change not allowed for this account' };
        }
        if (fullUser.nameLocked) {
            return { ok: false, message: 'Name change locked. Contact super admin.' };
        }
        
        // Only allow selecting names that exist in the system for the same role
        const template = users.find(u => u.name === newName && u.role === fullUser.role);
        if (!template) return { ok: false, message: 'Name not allowed for your role' };
        
        fullUser.name = template.name;
        // Update catchment to match selected template's coverage
        if (Array.isArray(template.accessibleCounties)) {
            fullUser.accessibleCounties = [...template.accessibleCounties];
            delete fullUser.county;
        } else if (template.county) {
            fullUser.county = template.county;
            delete fullUser.accessibleCounties;
        }
        fullUser.nameLocked = true;
        
        DB.updateUser(fullUser);
        localStorage.setItem('nicms_user', JSON.stringify(fullUser));
        DB.addLog('Profile Updated', `Name changed to ${fullUser.name}`);
        return { ok: true };
    },

    redirectBasedOnRole: () => {
        const user = Auth.getUser();
        if (!user) return;

        if (user.role === ROLES.ASSESSOR) {
            window.location.href = 'assessment.html';
        } else if (user.role === ROLES.INTERVENOR) {
            window.location.href = 'intervention.html';
        } else if (user.role === ROLES.WELFARE) {
            window.location.href = 'welfare.html';
        } else if (user.role === ROLES.FOLLOWUP) {
            window.location.href = 'followup.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    },

    canAccessCounty: (caseCounty) => {
        const user = Auth.getUser();
        if (user.role === ROLES.CORE_TEAM) return true;
        if (user.county === 'All') return true;
        if (Array.isArray(user.accessibleCounties)) return user.accessibleCounties.includes(caseCounty);
        return user.county === caseCounty;
    }
};

// --- Business Logic ---
const Logic = {
    generateId: () => 'NICMS-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    
    calculateSeverity: (scores) => {
        // Simple logic: Sum of scores. 
        // 0-5: Mild, 6-10: Moderate, 11+: Severe
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        if (total >= 11) return 'Severe';
        if (total >= 6) return 'Moderate';
        return 'Mild';
    },

    getRecommendations: (severity) => {
        if (severity === 'Severe') return ["Recommend medical evaluation", "Specialist Referral", "Immediate Intervention"];
        if (severity === 'Moderate') return ["Structured Intervention", "Regular Therapy Sessions"];
        return ["Community-based support", "Parental guidance", "Monitoring"];
    }
};

// --- UI Helpers ---
const UI = {
    renderNav: () => {
        const user = Auth.getUser();
        if (!user) return;
        
        // Determine "Dashboard" link based on role
        let dashLink = '<li><a href="dashboard.html" id="nav-dash">Dashboard</a></li>';
        if (user.role === ROLES.ASSESSOR || user.role === ROLES.INTERVENOR || user.role === ROLES.WELFARE || user.role === ROLES.FOLLOWUP) {
            dashLink = ''; // No general dashboard for them
        }

        const navHTML = `
            <div class="brand">NICMS</div>
            <div class="user-info" style="margin-bottom: 20px; text-align:center;">
                <small>${user.name}</small><br>
                <span class="badge badge-new">${user.role.replace('_', ' ')}</span>
            </div>
            <ul class="nav-links">
                ${dashLink}
                ${[ROLES.CORE_TEAM, ROLES.SUPERVISOR].includes(user.role) ? '<li><a href="onboarding.html" id="nav-onboard">Client Onboarding</a></li>' : ''}
                ${[ROLES.CORE_TEAM, ROLES.SUPERVISOR, ROLES.ASSESSOR, ROLES.INTERVENOR, ROLES.WELFARE, ROLES.FOLLOWUP].includes(user.role) ? '<li><a href="assessment.html" id="nav-assess">Assessments</a></li>' : ''}
                ${[ROLES.CORE_TEAM, ROLES.SUPERVISOR, ROLES.INTERVENOR].includes(user.role) ? '<li><a href="intervention.html" id="nav-intervene">Interventions</a></li>' : ''}
                ${(user.role === ROLES.CORE_TEAM || user.role === ROLES.WELFARE || user.username === 'scovia') ? '<li><a href="welfare.html" id="nav-welfare">Welfare Support</a></li>' : ''}
                ${[ROLES.CORE_TEAM, ROLES.SUPERVISOR, ROLES.FOLLOWUP].includes(user.role) ? '<li><a href="followup.html" id="nav-followup">Follow-up Tracking</a></li>' : ''}
                ${[ROLES.CORE_TEAM].includes(user.role) ? '<li><a href="referrals.html" id="nav-referrals" style="color: var(--warning-color);">External Referrals</a></li>' : ''}
                ${[ROLES.CORE_TEAM, ROLES.SUPERVISOR].includes(user.role) ? '<li><a href="reports.html" id="nav-reports">Reports & Analytics</a></li>' : ''}
                ${(['maxwel','rosemary'].includes(user.username)) ? '<li><a href="reports.html?view=track-record" id="nav-track">Track Record</a></li>' : ''}
                ${user.role === ROLES.CORE_TEAM && (user.perms?.adminUsers || user.perms?.full) ? '<li><a href="admin-users.html" id="nav-admin-users">User Admin</a></li>' : ''}
                <li><a href="training.html" id="nav-train">Staff Training</a></li>
                <li><a href="change-password.html" id="nav-change-pwd">Change Password</a></li>
                ${(user.role === ROLES.ASSESSOR || user.role === ROLES.INTERVENOR || user.role === ROLES.WELFARE || user.role === ROLES.FOLLOWUP) ? '<li><small style="color:#aaa;">My Dashboard is my module.</small></li>' : ''}
            </ul>
            <div class="user-info">
                Logged in as: <b>${user.username}</b>
                <button class="logout-btn" onclick="Auth.logout()">Logout</button>
            </div>
        `;
        document.getElementById('sidebar').innerHTML = navHTML;
        
        // Highlight active page
        const path = window.location.pathname;
        const page = path.split("/").pop();
        if(page.includes("dashboard")) document.getElementById('nav-dash')?.classList.add('active');
        if(page.includes("onboarding")) document.getElementById('nav-onboard')?.classList.add('active');
        if(page.includes("assessment")) document.getElementById('nav-assess')?.classList.add('active');
        if(page.includes("intervention")) document.getElementById('nav-intervene')?.classList.add('active');
        if(page.includes("welfare")) document.getElementById('nav-welfare')?.classList.add('active');
        if(page.includes("followup")) document.getElementById('nav-followup')?.classList.add('active');
        if(page.includes("referrals")) document.getElementById('nav-referrals')?.classList.add('active');
        if(page.includes("reports")) document.getElementById('nav-reports')?.classList.add('active');
        if(page.includes("reports")) {
            const params = new URLSearchParams(window.location.search);
            if (params.get('view') === 'track-record') {
                document.getElementById('nav-reports')?.classList.remove('active');
                document.getElementById('nav-track')?.classList.add('active');
            }
        }
        if(page.includes("admin-users")) document.getElementById('nav-admin-users')?.classList.add('active');
        if(page.includes("training")) document.getElementById('nav-train')?.classList.add('active');
    },

    showAlert: (message, type = 'success') => {
        const alertBox = document.getElementById('alert-box');
        if (alertBox) {
            alertBox.textContent = message;
            alertBox.className = `alert alert-${type}`; // Simplified for demo
            alertBox.style.display = 'block';
            alertBox.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
            alertBox.style.color = type === 'success' ? '#155724' : '#721c24';
            setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
        } else {
            alert(message);
        }
    }
};

// Initialize DB on load
DB.init();
