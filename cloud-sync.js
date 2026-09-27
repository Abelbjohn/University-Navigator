// SRM IST KTR Campus Maps & Staff Locator - Cloud Sync Engine (Firebase Firestore)
// Enables real-time student crowd-sourced updates across all devices on the internet.

import { FIREBASE_CONFIG } from './firebase-config.js';

class CloudSyncEngine {
  constructor() {
    this.status = 'uninitialized'; // 'uninitialized' | 'needs-config' | 'connecting' | 'connected' | 'error' | 'offline'
    this.statusMessage = '';
    this.db = null;
    this.app = null;
    this.unsubscribeFaculty = null;
    this.unsubscribeDest = null;
    this.listeners = {
      faculty: [],
      destinations: [],
      status: []
    };
    this.isInitialFacultyLoad = true;
    this.lastKnownDocIds = new Set();
  }

  // Retrieve current active config (either from code or user-provided in localStorage)
  getActiveConfig() {
    try {
      const stored = localStorage.getItem('srm_ktr_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.projectId && parsed.apiKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read local Firebase config:", e);
    }

    if (FIREBASE_CONFIG && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey) {
      return FIREBASE_CONFIG;
    }

    return null;
  }

  // Check if configuration is present
  hasConfig() {
    const cfg = this.getActiveConfig();
    return !!(cfg && cfg.projectId && cfg.apiKey);
  }

  // Register callbacks
  onFacultyUpdate(callback) {
    this.listeners.faculty.push(callback);
  }

  onDestinationUpdate(callback) {
    this.listeners.destinations.push(callback);
  }

  onStatusChange(callback) {
    this.listeners.status.push(callback);
    // Immediately notify with current status
    callback(this.status, this.statusMessage);
  }

  updateStatus(status, message) {
    this.status = status;
    this.statusMessage = message;
    this.listeners.status.forEach(cb => {
      try { cb(status, message); } catch (err) { console.error(err); }
    });
  }

  // Initialize Firebase Firestore connection
  async init() {
    const config = this.getActiveConfig();

    if (!config) {
      this.updateStatus('needs-config', 'Cloud sync not configured yet. Running in local browser mode.');
      return false;
    }

    this.updateStatus('connecting', 'Connecting to Firebase Firestore...');

    try {
      // Dynamic import official Firebase v10 CDN
      const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { 
        getFirestore, 
        collection, 
        addDoc, 
        onSnapshot, 
        serverTimestamp, 
        query, 
        orderBy 
      } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      this.app = getApps().length > 0 ? getApp() : initializeApp(config);
      this.db = getFirestore(this.app);

      this.setupFacultyListener(collection, onSnapshot, query, orderBy);
      this.setupDestinationsListener(collection, onSnapshot, query, orderBy);

      this.updateStatus('connected', 'Live Cloud Sync active. All faculty updates sync in real time!');
      return true;
    } catch (err) {
      console.error("Firebase connection error:", err);
      this.updateStatus('error', `Cloud connection failed: ${err.message || 'Check API keys & network'}`);
      return false;
    }
  }

  // Listen to real-time additions/modifications to faculty
  setupFacultyListener(collection, onSnapshot, query, orderBy) {
    if (!this.db) return;

    if (this.unsubscribeFaculty) {
      this.unsubscribeFaculty();
    }

    const colRef = collection(this.db, 'srm_faculty');
    // Query ordered by timestamp desc if available, fallback to basic collection
    const q = query(colRef);

    this.unsubscribeFaculty = onSnapshot(q, (snapshot) => {
      const communityFaculty = [];
      let newArrival = null;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const item = {
          ...data,
          cloudId: docSnap.id,
          id: data.id || `cloud-${docSnap.id}`,
          isCommunity: true
        };
        communityFaculty.push(item);

        // Check if this is a newly arrived document during the current session
        if (!this.isInitialFacultyLoad && !this.lastKnownDocIds.has(docSnap.id)) {
          newArrival = item;
        }
        this.lastKnownDocIds.add(docSnap.id);
      });

      // Save a local cache of cloud faculty so offline reloads still have them
      try {
        localStorage.setItem('srm_ktr_cloud_cached_teachers', JSON.stringify(communityFaculty));
      } catch (e) {
        // quota ignore
      }

      // Notify listeners
      this.listeners.faculty.forEach(cb => {
        try {
          cb(communityFaculty, this.isInitialFacultyLoad, newArrival);
        } catch (err) {
          console.error("Error in faculty listener callback:", err);
        }
      });

      this.isInitialFacultyLoad = false;
      this.updateStatus('connected', `Live Cloud Sync active (${communityFaculty.length} community faculty loaded)`);
    }, (error) => {
      console.error("Faculty snapshot error:", error);
      this.updateStatus('error', `Firestore read error: ${error.message}`);
    });
  }

  // Listen to real-time additions to custom spots/destinations
  setupDestinationsListener(collection, onSnapshot, query, orderBy) {
    if (!this.db) return;

    if (this.unsubscribeDest) {
      this.unsubscribeDest();
    }

    const colRef = collection(this.db, 'srm_destinations');
    this.unsubscribeDest = onSnapshot(colRef, (snapshot) => {
      const communityDests = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        communityDests.push({
          ...data,
          cloudId: docSnap.id,
          id: data.id || `cloud-dest-${docSnap.id}`,
          isCommunity: true
        });
      });

      try {
        localStorage.setItem('srm_ktr_cloud_cached_destinations', JSON.stringify(communityDests));
      } catch (e) {
        // quota ignore
      }

      this.listeners.destinations.forEach(cb => {
        try {
          cb(communityDests);
        } catch (err) {
          console.error("Error in destination listener callback:", err);
        }
      });
    }, (error) => {
      console.warn("Destination snapshot error:", error);
    });
  }

  // Add Faculty to Cloud Firestore
  async addFaculty(facultyData) {
    if (!this.db || this.status !== 'connected') {
      console.warn("Cloud not connected. Falling back to local storage only.");
      return { success: false, mode: 'local' };
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const docRef = await addDoc(collection(this.db, 'srm_faculty'), {
        ...facultyData,
        createdAt: serverTimestamp(),
        clientTimestamp: Date.now(),
        isCommunity: true
      });

      return { success: true, id: docRef.id, mode: 'cloud' };
    } catch (err) {
      console.error("Failed to add faculty to Firestore:", err);
      return { success: false, error: err.message, mode: 'local' };
    }
  }

  // Add Destination to Cloud Firestore
  async addDestination(destData) {
    if (!this.db || this.status !== 'connected') {
      return { success: false, mode: 'local' };
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const docRef = await addDoc(collection(this.db, 'srm_destinations'), {
        ...destData,
        createdAt: serverTimestamp(),
        clientTimestamp: Date.now(),
        isCommunity: true
      });

      return { success: true, id: docRef.id, mode: 'cloud' };
    } catch (err) {
      console.error("Failed to add destination to Firestore:", err);
      return { success: false, error: err.message, mode: 'local' };
    }
  }

  // Save new Firebase credentials from in-app settings modal
  async saveConfig(configObject) {
    try {
      localStorage.setItem('srm_ktr_firebase_config', JSON.stringify(configObject));
      this.isInitialFacultyLoad = true;
      this.lastKnownDocIds.clear();
      return await this.init();
    } catch (err) {
      console.error("Could not save config:", err);
      return false;
    }
  }

  // Disconnect & reset to local mode
  disconnect() {
    if (this.unsubscribeFaculty) this.unsubscribeFaculty();
    if (this.unsubscribeDest) this.unsubscribeDest();
    localStorage.removeItem('srm_ktr_firebase_config');
    this.db = null;
    this.app = null;
    this.updateStatus('needs-config', 'Disconnected. Running in local browser mode.');
  }
}

export const cloudSync = new CloudSyncEngine();
