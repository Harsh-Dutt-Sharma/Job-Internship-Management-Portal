/* ==========================================================================
   JobPortal - Central REST API Client (api.js)
   Common API communication file for the entire portal team.
   Communicates with JSON Server running on http://localhost:3000.
   Uses beginner-to-intermediate JavaScript: async/await, fetch(), try/catch.
   ========================================================================== */

const API_BASE_URL = "http://localhost:3000";

// --- HELPER FUNCTION: CHECK API SERVER STATUS ---
async function checkApiServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs?_limit=1`);
    return response.ok;
  } catch (error) {
    console.warn("JSON Server is not reachable at " + API_BASE_URL + ". Make sure 'npm run server' is running.", error);
    return false;
  }
}

// ==========================================================================
// 1. JOBS API
// ==========================================================================

// Fetch all jobs from the backend
async function getJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs. Server responded with status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getJobs():", error);
    return [];
  }
}

// Fetch a single job by its ID
async function getJobById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch job #${id}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getJobById(${id}):`, error);
    return null;
  }
}

// ==========================================================================
// 2. APPLICATIONS API (CRUD)
// ==========================================================================

// Fetch all applications
async function getApplications() {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getApplications():", error);
    return [];
  }
}

// Fetch a single application by ID
async function getApplicationById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch application #${id}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getApplicationById(${id}):`, error);
    return null;
  }
}

// Add a new application (POST)
async function addApplication(applicationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(applicationData)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit application. Status: ${response.status}`);
    }

    const createdData = await response.json();
    return createdData;
  } catch (error) {
    console.error("Error in addApplication():", error);
    throw error;
  }
}

// Update an existing application (PATCH)
async function updateApplication(id, updatedFields) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedFields)
    });

    if (!response.ok) {
      throw new Error(`Failed to update application #${id}. Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error in updateApplication(${id}):`, error);
    throw error;
  }
}

// Delete an application (DELETE)
async function deleteApplication(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Failed to delete application #${id}. Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteApplication(${id}):`, error);
    throw error;
  }
}

// ==========================================================================
// 3. SAVED JOBS API
// ==========================================================================

// Fetch all saved / bookmarked jobs
async function getSavedJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/savedJobs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch saved jobs. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getSavedJobs():", error);
    return [];
  }
}

// Save a job (POST)
async function saveJob(jobData) {
  try {
    const response = await fetch(`${API_BASE_URL}/savedJobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      throw new Error(`Failed to save job. Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in saveJob():", error);
    throw error;
  }
}

// Remove a saved job (DELETE)
async function removeSavedJob(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/savedJobs/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Failed to remove saved job #${id}. Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error in removeSavedJob(${id}):`, error);
    throw error;
  }
}

// ==========================================================================
// 4. USER PROFILE API
// ==========================================================================

// Fetch user profile details
async function getProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile. Status: ${response.status}`);
    }
    const data = await response.json();
    // JSON Server may return an object or single item
    if (Array.isArray(data)) {
      return data[0] || {};
    }
    return data;
  } catch (error) {
    console.error("Error in getProfile():", error);
    return null;
  }
}

// Update user profile (PATCH)
async function updateProfile(profileData) {
  try {
    // If profile is an object endpoint in db.json:
    let url = `${API_BASE_URL}/profile`;
    if (profileData.id) {
      // In case json-server expects /profile or /profile/1
      url = `${API_BASE_URL}/profile`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      // Try fallback to /profile/1 if /profile returns 404
      const fallbackResponse = await fetch(`${API_BASE_URL}/profile/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (!fallbackResponse.ok) {
        throw new Error(`Failed to update profile. Status: ${response.status}`);
      }
      return await fallbackResponse.json();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in updateProfile():", error);
    throw error;
  }
}

// ==========================================================================
// 5. NOTIFICATIONS API
// ==========================================================================

// Fetch all notifications
async function getNotifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getNotifications():", error);
    return [];
  }
}

// Mark a single notification as read (PATCH)
async function markNotificationAsRead(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ read: true })
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification #${id} as read.`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in markNotificationAsRead(${id}):`, error);
    return null;
  }
}

// ==========================================================================
// 6. SETTINGS API
// ==========================================================================

// Fetch user settings
async function getSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch settings. Status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data[0] || {};
    }
    return data;
  } catch (error) {
    console.error("Error in getSettings():", error);
    return null;
  }
}

// Update settings (PATCH)
async function updateSettings(settingsData) {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(settingsData)
    });

    if (!response.ok) {
      const fallback = await fetch(`${API_BASE_URL}/settings/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData)
      });
      if (!fallback.ok) {
        throw new Error(`Failed to update settings. Status: ${response.status}`);
      }
      return await fallback.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateSettings():", error);
    throw error;
  }
}

// Attach all methods to a global API object as well for clean team usage
window.API = {
  checkApiServer,
  getJobs,
  getJobById,
  getApplications,
  getApplicationById,
  addApplication,
  updateApplication,
  deleteApplication,
  getSavedJobs,
  saveJob,
  removeSavedJob,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationAsRead,
  getSettings,
  updateSettings
};

