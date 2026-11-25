const API_BASE_URL = "http://localhost:3000";

const API = {

    // Get all jobs
    async getJobs() {
        const response = await fetch(`${API_BASE_URL}/jobs`);

        if (!response.ok) {
            throw new Error("Unable to fetch jobs");
        }

        return await response.json();
    },

    // Get job by ID
    async getJobById(id) {
        const response = await fetch(
            `${API_BASE_URL}/jobs/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
            throw new Error("Job not found");
        }

        return await response.json();
    },

    // Get all applications
    async getApplications() {
        const response = await fetch(`${API_BASE_URL}/applications`);

        if (!response.ok) {
            throw new Error("Unable to fetch applications");
        }

        return await response.json();
    },

    // Get application by ID
    async getApplicationById(id) {
        const response = await fetch(
            `${API_BASE_URL}/applications/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
            throw new Error("Application not found");
        }

        return await response.json();
    },

    // Add new application
    async addApplication(application) {
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(application)
        });

        if (!response.ok) {
            throw new Error("Application submission failed");
        }

        return await response.json();
    },

    // Update application
    async updateApplication(id, data) {
        const response = await fetch(
            `${API_BASE_URL}/applications/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error("Application update failed");
        }

        return await response.json();
    },

    // Delete application
    async deleteApplication(id) {
        const response = await fetch(
            `${API_BASE_URL}/applications/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Application deletion failed");
        }

        return true;
    },

    // Get profile
    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/profile`);

        if (!response.ok) {
            throw new Error("Unable to fetch profile");
        }

        return await response.json();
    },

    // Update profile
    async updateProfile(data) {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Profile update failed");
        }

        return await response.json();
    },

    // Get saved jobs
    async getSavedJobs() {
        const response = await fetch(`${API_BASE_URL}/savedJobs`);

        if (!response.ok) {
            throw new Error("Unable to fetch saved jobs");
        }

        return await response.json();
    },

    // Save job
    async saveJob(data) {
        const response = await fetch(`${API_BASE_URL}/savedJobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Unable to save job");
        }

        return await response.json();
    },

    // Remove saved job
    async removeSavedJob(id) {
        const response = await fetch(
            `${API_BASE_URL}/savedJobs/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to remove saved job");
        }

        return true;
    },

    // Get notifications
    async getNotifications() {
        const response = await fetch(`${API_BASE_URL}/notifications`);

        if (!response.ok) {
            throw new Error("Unable to fetch notifications");
        }

        return await response.json();
    },

    // Mark notification as read
    async markNotificationAsRead(id) {
        const response = await fetch(
            `${API_BASE_URL}/notifications/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    read: true
                })
            }
        );

        if (!response.ok) {
            throw new Error("Unable to update notification");
        }

        return await response.json();
    },

    // Get settings
    async getSettings() {
        const response = await fetch(`${API_BASE_URL}/settings`);

        if (!response.ok) {
            throw new Error("Unable to fetch settings");
        }

        return await response.json();
    },

    // Update settings
    async updateSettings(data) {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Unable to update settings");
        }

        return await response.json();
    }

};

window.API = API;