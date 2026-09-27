// SRM IST KTR Campus Maps & Staff Locator Engine
// Monochrome Google Maps Style Navigation & Faculty Directory
// Features: Correct Campus Geometry, Staff Finder Roster, No-Image Fallback, Student Contribution System
import { SRM_KTR_DATA } from './data.js';
import { cloudSync } from './cloud-sync.js';

// Application State
const state = {
  currentMode: 'staff', // 'staff' | 'directions' | 'surroundings' | 'shuttles'
  selectedDept: 'all',
  teacherSearchQuery: '',
  selectedTeacher: null,
  selectedBuilding: null,
  selectedFloor: null,
  simulatedUserLocation: 'node-main-arch', // Default student position at Main Arch Gate
  routeStartId: 'node-main-arch',
  routeEndId: 'teacher-t-srm-01',
  activeRoute: null,
  isSpeaking: false,
  mapTransform: { x: 0, y: 0, scale: 1 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  customPhotoDataUrl: null,

  // Shuttle State
  shuttleTab: 'campus', // 'campus' | 'city' | 'stops'
  shuttleFilterQuery: '',
  isShuttleLoopVisible: false,
  shuttleAnimationId: null,
  selectedShuttleStop: null
};

// DOM Elements Cache
const elements = {
  // Global Search Hub
  globalSearch: document.getElementById('gmaps-global-search'),
  btnSearchClear: document.getElementById('btn-search-clear'),
  btnSearchSubmit: document.getElementById('btn-search-submit'),

  // Option Pills
  pillStaffRooms: document.getElementById('pill-staff-rooms'),
  pillDirections: document.getElementById('pill-directions'),
  pillSurroundings: document.getElementById('pill-surroundings'),
  pillShuttles: document.getElementById('pill-shuttles'),
  btnOpenAddModal: document.getElementById('btn-open-add-modal'),
  btnCloudStatus: document.getElementById('btn-cloud-status'),
  cloudStatusDot: document.getElementById('cloud-status-dot'),
  cloudStatusText: document.getElementById('cloud-status-text'),

  // Header Add Buttons
  btnHeaderAddFaculty: document.getElementById('btn-header-add-faculty'),
  btnHeaderAddDest: document.getElementById('btn-header-add-dest'),

  // Flyout Sheet & Panels
  sheet: document.getElementById('gmaps-sheet'),
  panelStaffRooms: document.getElementById('panel-staff-rooms'),
  panelTeacherDetail: document.getElementById('panel-teacher-detail'),
  panelDirections: document.getElementById('panel-directions'),
  panelSurroundings: document.getElementById('panel-surroundings'),
  panelShuttles: document.getElementById('panel-shuttles'),

  // Staff Room Elements
  staffFilterInput: document.getElementById('staff-filter-input'),
  deptFilterChips: document.getElementById('dept-filter-chips'),
  staffCountLabel: document.getElementById('staff-count-label'),
  teachersListContainer: document.getElementById('teachers-list-container'),
  btnCloseSheet: document.getElementById('btn-close-sheet'),

  // Directions Elements
  routeStartSelect: document.getElementById('route-start-select'),
  routeEndSelect: document.getElementById('route-end-select'),
  btnSwapRoute: document.getElementById('btn-swap-route'),
  chkAccessibleMode: document.getElementById('chk-accessible-mode'),
  btnNavigateNow: document.getElementById('btn-navigate-now'),
  routeGuidanceContainer: document.getElementById('route-guidance-container'),
  routeEtaText: document.getElementById('route-eta-text'),
  routeDistText: document.getElementById('route-dist-text'),
  routeStepsContainer: document.getElementById('route-steps-container'),
  btnVoiceDirections: document.getElementById('btn-voice-directions'),
  btnCloseDirections: document.getElementById('btn-close-directions'),

  // Surroundings Elements
  surroundingsListContainer: document.getElementById('surroundings-list-container'),
  btnCloseSurroundings: document.getElementById('btn-close-surroundings'),

  // Shuttle Bus Elements
  btnCloseShuttles: document.getElementById('btn-close-shuttles'),
  btnToggleShuttleLoop: document.getElementById('btn-toggle-shuttle-loop'),
  labelToggleShuttleLoop: document.getElementById('label-toggle-shuttle-loop'),
  tabShuttleCampus: document.getElementById('tab-shuttle-campus'),
  tabShuttleCity: document.getElementById('tab-shuttle-city'),
  tabShuttleStops: document.getElementById('tab-shuttle-stops'),
  shuttleHeroCard: document.getElementById('shuttle-hero-card'),
  shuttleFilterInput: document.getElementById('shuttle-filter-input'),
  shuttleListContainer: document.getElementById('shuttle-list-container'),

  // Floor Dock & Controls
  floorDock: document.getElementById('floor-dock'),
  floorPillsContainer: document.getElementById('floor-pills-container'),
  ctrlZoomIn: document.getElementById('ctrl-zoom-in'),
  ctrlZoomOut: document.getElementById('ctrl-zoom-out'),
  ctrlResetNorth: document.getElementById('ctrl-reset-north'),
  ctrlMyLocation: document.getElementById('ctrl-my-location'),

  // SVG Layers
  svgMap: document.getElementById('campus-map-svg'),
  layerTerrain: document.getElementById('layer-terrain'),
  layerRoads: document.getElementById('layer-roads'),
  layerPathways: document.getElementById('layer-pathways'),
  layerBuildings: document.getElementById('layer-buildings'),
  layerLandmarks: document.getElementById('layer-landmarks'),
  layerShuttles: document.getElementById('layer-shuttles'),
  layerRoutes: document.getElementById('layer-routes'),
  layerMarkers: document.getElementById('layer-markers'),
  mapTooltip: document.getElementById('map-tooltip'),

  // Student Contribution Modal
  modalAdd: document.getElementById('modal-add-faculty-dest'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  btnCancelDestModal: document.getElementById('btn-cancel-dest-modal'),
  tabAddFaculty: document.getElementById('tab-add-faculty'),
  tabAddDestination: document.getElementById('tab-add-destination'),
  formAddFaculty: document.getElementById('form-add-faculty'),
  formAddDestination: document.getElementById('form-add-destination'),
  inputFacPhotoFile: document.getElementById('input-fac-photo-file'),
  inputFacPhotoUrl: document.getElementById('input-fac-photo-url'),
  photoPreviewBox: document.getElementById('photo-preview-box'),
  photoPreviewImg: document.getElementById('photo-preview-img'),

  // Cloud Sync Modal Elements
  modalCloudSync: document.getElementById('modal-cloud-sync'),
  btnCloseCloudModal: document.getElementById('btn-close-cloud-modal'),
  cloudBannerDot: document.getElementById('cloud-banner-dot'),
  cloudBannerTitle: document.getElementById('cloud-banner-title'),
  cloudBannerDesc: document.getElementById('cloud-banner-desc'),
  inputFirebaseConfig: document.getElementById('input-firebase-config'),
  btnSaveCloudConfig: document.getElementById('btn-save-cloud-config'),
  btnDisconnectCloud: document.getElementById('btn-disconnect-cloud'),

  // Toast
  toast: document.getElementById('gmaps-toast'),
  toastText: document.getElementById('toast-text')
};

// Initialize Application
function initApp() {
  loadCustomStorageData();
  renderMonochromeMap();
  setupOptionPills();
  setupStaffDirectory();
  setupDirections();
  setupSurroundings();
  setupShuttles();
  setupFloorDock();
  setupMapControls();
  setupContributionModal();
  setupCloudSync();
  updateUserLocationMarker();

  // Show default staff list
  switchMode('staff');
}

// -----------------------------------------------------------------------------
// LOCAL STORAGE PERSISTENCE (Student additions)
// -----------------------------------------------------------------------------
function loadCustomStorageData() {
  try {
    const savedTeachers = localStorage.getItem('srm_ktr_custom_teachers');
    if (savedTeachers) {
      const parsed = JSON.parse(savedTeachers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Prepend custom teachers so they show up at the top
        SRM_KTR_DATA.teachers = [...parsed, ...SRM_KTR_DATA.teachers];
      }
    }

    // Also load any cached cloud faculty from previous sessions
    const cloudCached = localStorage.getItem('srm_ktr_cloud_cached_teachers');
    if (cloudCached) {
      const parsedCloud = JSON.parse(cloudCached);
      if (Array.isArray(parsedCloud) && parsedCloud.length > 0) {
        const existingIds = new Set(SRM_KTR_DATA.teachers.map(t => t.id));
        const toAdd = parsedCloud.filter(t => !existingIds.has(t.id));
        SRM_KTR_DATA.teachers = [...toAdd, ...SRM_KTR_DATA.teachers];
      }
    }

    const savedDests = localStorage.getItem('srm_ktr_custom_destinations');
    if (savedDests) {
      const parsedDests = JSON.parse(savedDests);
      if (Array.isArray(parsedDests) && parsedDests.length > 0) {
        SRM_KTR_DATA.surroundings = [...parsedDests, ...SRM_KTR_DATA.surroundings];
      }
    }
  } catch (err) {
    console.warn("Could not read localStorage for custom submissions:", err);
  }
}

function showToast(message) {
  if (!elements.toast || !elements.toastText) return;
  elements.toastText.textContent = message;
  elements.toast.style.display = 'flex';
  setTimeout(() => {
    elements.toast.style.display = 'none';
  }, 4000);
}

// -----------------------------------------------------------------------------
// 1. OPTION PILLS & MODE SWITCHER
// -----------------------------------------------------------------------------
function setupOptionPills() {
  elements.pillStaffRooms.addEventListener('click', () => switchMode('staff'));
  elements.pillDirections.addEventListener('click', () => switchMode('directions'));
  elements.pillSurroundings.addEventListener('click', () => switchMode('surroundings'));
  if (elements.pillShuttles) {
    elements.pillShuttles.addEventListener('click', () => switchMode('shuttles'));
  }

  if (elements.btnOpenAddModal) {
    elements.btnOpenAddModal.addEventListener('click', () => openContributionModal('faculty'));
  }
  if (elements.btnHeaderAddFaculty) {
    elements.btnHeaderAddFaculty.addEventListener('click', () => openContributionModal('faculty'));
  }
  if (elements.btnHeaderAddDest) {
    elements.btnHeaderAddDest.addEventListener('click', () => openContributionModal('destination'));
  }

  // Close buttons on sheets
  if (elements.btnCloseSheet) {
    elements.btnCloseSheet.addEventListener('click', () => {
      elements.sheet.classList.add('hidden');
    });
  }
  if (elements.btnCloseDirections) {
    elements.btnCloseDirections.addEventListener('click', () => {
      elements.sheet.classList.add('hidden');
    });
  }
  if (elements.btnCloseSurroundings) {
    elements.btnCloseSurroundings.addEventListener('click', () => {
      elements.sheet.classList.add('hidden');
    });
  }
  if (elements.btnCloseShuttles) {
    elements.btnCloseShuttles.addEventListener('click', () => {
      elements.sheet.classList.add('hidden');
    });
  }

  // Global search input
  elements.globalSearch.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    elements.btnSearchClear.style.display = val ? 'flex' : 'none';

    if (val) {
      elements.sheet.classList.remove('hidden');

      // Check if searching for shuttle / bus queries
      const isShuttleQuery = val.includes('bus') || val.includes('shuttle') || 
                             val.includes('tambaram') || val.includes('guindy') || 
                             val.includes('koyambedu') || val.includes('chengalpattu') || 
                             val.includes('velachery') || val.includes('bay');

      if (isShuttleQuery) {
        if (state.currentMode !== 'shuttles') {
          switchMode('shuttles');
        }
        if (elements.shuttleFilterInput) {
          elements.shuttleFilterInput.value = val;
          state.shuttleFilterQuery = val;
          renderShuttleList();
        }
      } else {
        if (state.currentMode !== 'staff') {
          switchMode('staff');
        }
        elements.staffFilterInput.value = val;
        state.teacherSearchQuery = val;
        renderTeachersList();
      }
    }
  });

  elements.btnSearchClear.addEventListener('click', () => {
    elements.globalSearch.value = '';
    elements.btnSearchClear.style.display = 'none';
    elements.staffFilterInput.value = '';
    state.teacherSearchQuery = '';
    if (elements.shuttleFilterInput) {
      elements.shuttleFilterInput.value = '';
      state.shuttleFilterQuery = '';
    }
    if (state.currentMode === 'staff') {
      renderTeachersList();
    } else if (state.currentMode === 'shuttles') {
      renderShuttleView();
    }
  });
}

function switchMode(mode) {
  state.currentMode = mode;
  elements.sheet.classList.remove('hidden');

  // Update pill active states
  elements.pillStaffRooms.classList.toggle('active', mode === 'staff');
  elements.pillDirections.classList.toggle('active', mode === 'directions');
  elements.pillSurroundings.classList.toggle('active', mode === 'surroundings');
  if (elements.pillShuttles) {
    elements.pillShuttles.classList.toggle('active', mode === 'shuttles');
  }

  // Update panels visibility
  elements.panelStaffRooms.style.display = mode === 'staff' ? 'flex' : 'none';
  elements.panelTeacherDetail.style.display = 'none';
  elements.panelDirections.style.display = mode === 'directions' ? 'flex' : 'none';
  elements.panelSurroundings.style.display = mode === 'surroundings' ? 'flex' : 'none';
  if (elements.panelShuttles) {
    elements.panelShuttles.style.display = mode === 'shuttles' ? 'flex' : 'none';
  }

  if (mode === 'staff') {
    renderTeachersList();
  } else if (mode === 'surroundings') {
    renderSurroundingsList();
  } else if (mode === 'shuttles') {
    renderShuttleView();
  }
}

// -----------------------------------------------------------------------------
// 2. STAFF ROOMS & TEACHER SEARCH DIRECTORY (WITH NO-IMAGE SUPPORT)
// -----------------------------------------------------------------------------
function setupStaffDirectory() {
  // Text search input
  elements.staffFilterInput.addEventListener('input', (e) => {
    state.teacherSearchQuery = e.target.value.trim().toLowerCase();
    renderTeachersList();
  });

  // Department Filter Chips
  elements.deptFilterChips.querySelectorAll('.dept-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      elements.deptFilterChips.querySelectorAll('.dept-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedDept = chip.getAttribute('data-dept');
      renderTeachersList();
    });
  });

  renderTeachersList();
}

function renderTeachersList() {
  const query = state.teacherSearchQuery;
  const dept = state.selectedDept;
  const floor = state.selectedFloor;

  const filtered = SRM_KTR_DATA.teachers.filter(teacher => {
    // Dept filter
    if (dept !== 'all') {
      if (dept === 'ADMIN' && teacher.deptCode !== 'ADMIN') return false;
      if (dept !== 'ADMIN' && teacher.deptCode !== dept) return false;
    }

    // Floor filter (if active from floor dock)
    if (floor !== null && teacher.floor !== floor) {
      return false;
    }

    // Query filter
    if (query) {
      const matchName = teacher.name.toLowerCase().includes(query);
      const matchDept = teacher.dept.toLowerCase().includes(query);
      const matchCabin = teacher.cabinDetails.toLowerCase().includes(query);
      const matchRoom = teacher.roomNumber.toLowerCase().includes(query);
      const matchBldg = teacher.buildingName.toLowerCase().includes(query);
      const matchSub = (teacher.subjects || []).some(s => s.toLowerCase().includes(query));
      return matchName || matchDept || matchCabin || matchRoom || matchBldg || matchSub;
    }
    return true;
  });

  elements.staffCountLabel.textContent = `${filtered.length} Faculty Members`;

  if (filtered.length === 0) {
    elements.teachersListContainer.innerHTML = `
      <div style="text-align: center; padding: 36px 12px; color: var(--mono-400);">
        <i class="fa-solid fa-user-slash" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
        <div style="font-weight: 700; color: var(--mono-200);">No faculty found</div>
        <div style="font-size: 0.75rem; margin-top: 4px; margin-bottom: 12px;">Don't see your teacher? You can add them!</div>
        <button class="btn-gmaps-primary" id="btn-quick-add-missing" style="font-size: 0.78rem; padding: 6px 16px; margin: 0 auto;">
          <i class="fa-solid fa-user-plus"></i>
          <span>Add Missing Faculty</span>
        </button>
      </div>
    `;
    const quickAddBtn = document.getElementById('btn-quick-add-missing');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => openContributionModal('faculty'));
    }
    return;
  }

  elements.teachersListContainer.innerHTML = filtered.map(t => {
    const statusText = {
      'available': '● In Cabin',
      'in-class': '● In Class',
      'meeting': '● Meeting',
      'busy': '● Busy'
    }[t.status] || 'Available';

    // "NO IMAGE" FALLBACK CHECK
    let photoMarkup = '';
    if (t.photo && t.photo.trim() !== '') {
      photoMarkup = `
        <img src="${t.photo}" alt="${t.name}" class="teacher-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="teacher-thumb no-image-thumb" style="display: none;">
          <i class="fa-regular fa-image"></i>
          <span>No Image</span>
        </div>
      `;
    } else {
      photoMarkup = `
        <div class="teacher-thumb no-image-thumb">
          <i class="fa-regular fa-image"></i>
          <span>No Image</span>
        </div>
      `;
    }

    return `
      <div class="teacher-item-card" data-teacher-id="${t.id}">
        ${photoMarkup}
        <div class="teacher-info">
          <div class="teacher-name-row">
            <span class="teacher-name">${t.name}</span>
            <span style="font-size: 0.68rem; color: var(--mono-300); font-weight: 600;">${statusText}</span>
          </div>
          <div class="teacher-designation">${t.title}</div>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 2px;">
            <div class="teacher-dept-tag">${t.dept}</div>
            ${t.isCommunity ? `<span class="badge-community"><i class="fa-solid fa-cloud-arrow-up"></i> Live Cloud</span>` : ''}
          </div>
          
          <div class="teacher-loc-pill">
            <i class="fa-solid fa-building"></i>
            <span>${t.buildingName} • <strong>${t.floorLabel}</strong> (${t.roomNumber})</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach click listener to each card
  elements.teachersListContainer.querySelectorAll('.teacher-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const teacherId = card.getAttribute('data-teacher-id');
      const teacher = SRM_KTR_DATA.teachers.find(t => t.id === teacherId);
      if (teacher) {
        showTeacherPlaceCard(teacher);
      }
    });
  });
}

// Show Google Maps Place Detail Card for a Teacher
function showTeacherPlaceCard(teacher) {
  state.selectedTeacher = teacher;

  elements.panelStaffRooms.style.display = 'none';
  elements.panelTeacherDetail.style.display = 'flex';

  const statusLabel = {
    'available': 'Available in Cabin Now',
    'in-class': 'Currently in Lecture / Lab',
    'meeting': 'In Department Meeting',
    'busy': 'Conducting Research'
  }[teacher.status] || 'Available';

  // "NO IMAGE" HERO COVER CHECK
  let heroMarkup = '';
  if (teacher.photo && teacher.photo.trim() !== '') {
    heroMarkup = `
      <div class="place-hero-image-wrapper">
        <img src="${teacher.photo}" alt="${teacher.name}" class="place-hero-image" onerror="this.parentElement.classList.add('no-image-hero'); this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="no-image-hero-content" style="display: none;">
          <i class="fa-solid fa-camera-slash"></i>
          <div class="no-image-title">No Image Available</div>
          <div class="no-image-sub">Official photo not provided</div>
        </div>
        <div class="place-hero-overlay"></div>
        <button class="btn-back-to-list" id="btn-back-to-teachers">
          <i class="fa-solid fa-arrow-left"></i>
          <span>All Faculty</span>
        </button>
      </div>
    `;
  } else {
    heroMarkup = `
      <div class="place-hero-image-wrapper no-image-hero">
        <div class="no-image-hero-content">
          <i class="fa-solid fa-camera-slash"></i>
          <div class="no-image-title">No Image Available</div>
          <div class="no-image-sub">Official portrait not provided on staff directory</div>
        </div>
        <button class="btn-back-to-list" id="btn-back-to-teachers">
          <i class="fa-solid fa-arrow-left"></i>
          <span>All Faculty</span>
        </button>
      </div>
    `;
  }

  elements.panelTeacherDetail.innerHTML = `
    <div class="teacher-place-detail-sheet">
      ${heroMarkup}

      <!-- Details Body -->
      <div class="place-details-body">
        
        <div class="place-header-section">
          <h2>${teacher.name}</h2>
          <div class="place-submeta">${teacher.title}</div>
          <div style="font-size: 0.8rem; color: var(--mono-200); font-weight: 600; margin-top: 2px;">
            ${teacher.dept}
          </div>

          <div class="place-badges-row">
            ${teacher.isCommunity ? `
              <span class="badge-community"><i class="fa-solid fa-cloud-arrow-up"></i> Live Cloud Sync (Student Added)</span>
            ` : `
              <span class="verified-badge">
                <i class="fa-solid fa-certificate"></i> Verified SRM Faculty
              </span>
            `}
            <span class="rating-badge">${teacher.rating || '4.8 ★'}</span>
            <span style="color: var(--mono-300); font-size: 0.75rem;">${statusLabel}</span>
          </div>
        </div>

        <!-- Google Maps Primary Action Buttons -->
        <div class="place-actions-row">
          <button class="btn-gmaps-primary" id="btn-direct-to-teacher">
            <i class="fa-solid fa-diamond-turn-right"></i>
            <span>Directions</span>
          </button>
          <button class="btn-gmaps-secondary" id="btn-email-teacher" title="Send Email">
            <i class="fa-solid fa-envelope"></i>
          </button>
          <button class="btn-gmaps-secondary" id="btn-pin-teacher" title="Focus on Map">
            <i class="fa-solid fa-map-pin"></i>
          </button>
        </div>

        <!-- Exact Location Breakdown Box -->
        <div class="location-details-card">
          <div class="loc-detail-row">
            <i class="fa-solid fa-building"></i>
            <div class="loc-detail-content">
              <div class="loc-detail-title">Building</div>
              <div class="loc-detail-val">${teacher.buildingName}</div>
            </div>
          </div>

          <div class="loc-detail-row">
            <i class="fa-solid fa-stairs"></i>
            <div class="loc-detail-content">
              <div class="loc-detail-title">Floor Level</div>
              <div class="loc-detail-val">${teacher.floorLabel} (Elevator accessible)</div>
            </div>
          </div>

          <div class="loc-detail-row">
            <i class="fa-solid fa-door-open"></i>
            <div class="loc-detail-content">
              <div class="loc-detail-title">Room & Cabin Details</div>
              <div class="loc-detail-val">Room ${teacher.roomNumber} • ${teacher.cabinDetails}</div>
            </div>
          </div>

          <div class="loc-detail-row">
            <i class="fa-solid fa-clock"></i>
            <div class="loc-detail-content">
              <div class="loc-detail-title">Office Hours</div>
              <div class="loc-detail-val" style="font-size: 0.78rem;">${teacher.officeHours || 'Consult department for hours'}</div>
            </div>
          </div>
        </div>

        <!-- Current Status Note -->
        <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid var(--mono-white); padding: 8px 12px; font-size: 0.78rem; color: var(--mono-200); border-radius: 4px;">
          <i class="fa-solid fa-circle-info"></i> ${teacher.statusNote || 'In Office'}
        </div>

        <!-- Subjects Taught -->
        ${teacher.subjects && teacher.subjects.length > 0 ? `
          <div>
            <div style="font-size: 0.72rem; color: var(--mono-400); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
              Courses & Specialization
            </div>
            <div class="tag-cloud-mono">
              ${teacher.subjects.map(s => `<span class="tag-mono">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Direct Contact Details -->
        <div>
          <div style="font-size: 0.72rem; color: var(--mono-400); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
            Contact Details
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--mono-200);">
            <div><i class="fa-solid fa-envelope" style="width: 20px;"></i> ${teacher.email || 'N/A'}</div>
            <div><i class="fa-solid fa-phone" style="width: 20px;"></i> ${teacher.phone || '+91 44 2741 7000'}</div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach buttons inside place card
  document.getElementById('btn-back-to-teachers').addEventListener('click', () => {
    elements.panelTeacherDetail.style.display = 'none';
    elements.panelStaffRooms.style.display = 'flex';
  });

  document.getElementById('btn-direct-to-teacher').addEventListener('click', () => {
    switchMode('directions');
    elements.routeEndSelect.value = `teacher-${teacher.id}`;
    calculateAndDrawRoute();
  });

  document.getElementById('btn-pin-teacher').addEventListener('click', () => {
    focusOnBuilding(teacher.buildingId);
  });

  document.getElementById('btn-email-teacher').addEventListener('click', () => {
    if (teacher.email) {
      window.location.href = `mailto:${teacher.email}?subject=Student Inquiry - SRM IST KTR`;
    }
  });

  // Focus building on map
  focusOnBuilding(teacher.buildingId);
}

// -----------------------------------------------------------------------------
// 3. DIRECTIONS & REAL-TIME CAMPUS WAYFINDING (DIJKSTRA ALGORITHM)
// -----------------------------------------------------------------------------
function setupDirections() {
  populateDirectionsDropdowns();

  elements.btnNavigateNow.addEventListener('click', () => {
    calculateAndDrawRoute();
  });

  elements.btnSwapRoute.addEventListener('click', () => {
    const startVal = elements.routeStartSelect.value;
    const endVal = elements.routeEndSelect.value;

    // Check if endVal can map to a starting node
    const mappedStartNode = mapSelectionToNode(endVal);
    if (mappedStartNode) {
      elements.routeStartSelect.value = mappedStartNode;
      elements.routeEndSelect.value = startVal;
      calculateAndDrawRoute();
    }
  });

  elements.routeStartSelect.addEventListener('change', () => {
    if (elements.routeGuidanceContainer.style.display !== 'none') {
      calculateAndDrawRoute();
    }
  });

  elements.routeEndSelect.addEventListener('change', () => {
    if (elements.routeGuidanceContainer.style.display !== 'none') {
      calculateAndDrawRoute();
    }
  });

  elements.btnVoiceDirections.addEventListener('click', () => {
    toggleVoiceGuidance();
  });
}

function mapSelectionToNode(val) {
  if (val.startsWith('node-')) return val;
  if (val.startsWith('stop-')) {
    const stop = SRM_KTR_DATA.shuttleSystem && SRM_KTR_DATA.shuttleSystem.stops.find(s => s.id === val);
    if (stop) return stop.nodeId;
  }
  if (val.startsWith('bldg-')) {
    const bldgMap = {
      'bldg-tp': 'node-tp-entrance',
      'bldg-main': 'node-main-bldg-entrance',
      'bldg-ub': 'node-ub-entrance',
      'bldg-tpg': 'node-tpg-front',
      'bldg-bio': 'node-bio-entrance',
      'bldg-lib': 'node-lib-entrance',
      'bldg-bel': 'node-bel-entrance',
      'bldg-med': 'node-med-entrance',
      'bldg-hostels-north': 'node-hostels-entrance'
    };
    return bldgMap[val] || 'node-central-quad';
  }
  if (val.startsWith('teacher-')) {
    const tid = val.replace('teacher-', '');
    const t = SRM_KTR_DATA.teachers.find(item => item.id === tid);
    if (t) return mapSelectionToNode(t.buildingId);
  }
  if (val.startsWith('surr-')) {
    const sid = val.replace(/^surr-+/, '');
    const s = SRM_KTR_DATA.surroundings.find(item => item.id === sid || item.id === `surr-${sid}` || item.id === val);
    if (s && s.buildingRef) return mapSelectionToNode(s.buildingRef);
    if (sid === 'java') return 'node-java-canteen';
    if (sid === 'gazebo') return 'node-gazebo';
    if (sid === 'clock') return 'node-central-quad';
    if (sid === 'chola') return 'node-chola-statue';
    if (sid === 'arch-gate') return 'node-main-arch';
    if (sid === 'potheri') return 'node-potheri';
    if (sid === 'sports') return 'node-sports-arena';
    if (sid === 'temple') return 'node-temple';
    if (sid === 'library') return 'node-lib-entrance';
    if (sid === 'hospital') return 'node-med-entrance';
    if (sid === 'cub-bank') return 'node-tp-entrance';
    if (sid === 'indian-bank') return 'node-ub-entrance';

    // Fallback: If s exists with coordinates, find closest nav node
    if (s && s.x !== undefined && s.y !== undefined) {
      let closest = 'node-central-quad';
      let minDist = Infinity;
      SRM_KTR_DATA.navGraph.nodes.forEach(n => {
        const d = Math.hypot(n.x - s.x, n.y - s.y);
        if (d < minDist) {
          minDist = d;
          closest = n.id;
        }
      });
      return closest;
    }
  }
  return 'node-main-arch';
}

function populateDirectionsDropdowns() {
  // Start Locations (Outdoor Gates, transit, entrances)
  const startOptions = SRM_KTR_DATA.navGraph.nodes.map(n => `
    <option value="${n.id}">${n.name}</option>
  `).join('');
  elements.routeStartSelect.innerHTML = startOptions;
  elements.routeStartSelect.value = state.routeStartId;

  // Destination Options: Grouped by Teachers, Buildings, Surroundings, Shuttle Stops
  const teacherGroup = SRM_KTR_DATA.teachers.map(t => `
    <option value="teacher-${t.id}">👨‍🏫 ${t.name} (${t.roomNumber} - ${t.buildingName})</option>
  `).join('');

  const buildingGroup = SRM_KTR_DATA.buildings.map(b => `
    <option value="${b.id}">🏛️ ${b.name} (${b.code})</option>
  `).join('');

  const surroundGroup = SRM_KTR_DATA.surroundings.map(s => `
    <option value="surr-${s.id}">📍 ${s.name} (${s.category})</option>
  `).join('');

  const shuttleGroup = (SRM_KTR_DATA.shuttleSystem && SRM_KTR_DATA.shuttleSystem.stops) ? SRM_KTR_DATA.shuttleSystem.stops.map(st => `
    <option value="${st.id}">🚏 ${st.name} (${st.road})</option>
  `).join('') : '';

  elements.routeEndSelect.innerHTML = `
    <optgroup label="Faculty & Staff Cabins">
      ${teacherGroup}
    </optgroup>
    <optgroup label="Academic & Administrative Buildings">
      ${buildingGroup}
    </optgroup>
    <optgroup label="Campus Surroundings & Hangouts">
      ${surroundGroup}
    </optgroup>
    <optgroup label="Campus Shuttle & Bus Stops">
      ${shuttleGroup}
    </optgroup>
  `;

  elements.routeEndSelect.value = state.routeEndId;
}

// Dijkstra Shortest Path Implementation
function findShortestSrmPath(startId, endId) {
  const nodes = SRM_KTR_DATA.navGraph.nodes;
  const edges = SRM_KTR_DATA.navGraph.edges;

  const dist = {};
  const prev = {};
  const unvisited = new Set();

  nodes.forEach(n => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    unvisited.add(n.id);
  });

  dist[startId] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    unvisited.forEach(id => {
      if (curr === null || dist[id] < dist[curr]) {
        curr = id;
      }
    });

    if (dist[curr] === Infinity || curr === endId) break;
    unvisited.delete(curr);

    edges.forEach(e => {
      let nbr = null;
      if (e.from === curr) nbr = e.to;
      else if (e.to === curr) nbr = e.from;

      if (nbr && unvisited.has(nbr)) {
        const alt = dist[curr] + e.dist;
        if (alt < dist[nbr]) {
          dist[nbr] = alt;
          prev[nbr] = { node: curr, dist: e.dist, desc: e.desc };
        }
      }
    });
  }

  const path = [];
  let u = endId;
  let totalMeters = 0;

  if (dist[endId] === Infinity && startId !== endId) return null;

  while (u) {
    path.unshift(u);
    const p = prev[u];
    if (p) {
      totalMeters += p.dist;
      u = p.node;
    } else break;
  }

  return { path, totalMeters };
}

function calculateAndDrawRoute() {
  const startId = elements.routeStartSelect.value;
  const rawEnd = elements.routeEndSelect.value;
  const isAccessible = elements.chkAccessibleMode.checked;

  let targetBuildingId = null;
  let targetTeacher = null;
  let targetSurround = null;
  let targetShuttleStop = null;
  let campusTargetNodeId = null;

  if (rawEnd.startsWith('teacher-')) {
    const tid = rawEnd.replace('teacher-', '');
    targetTeacher = SRM_KTR_DATA.teachers.find(t => t.id === tid);
    if (targetTeacher) {
      targetBuildingId = targetTeacher.buildingId;
    }
  } else if (rawEnd.startsWith('bldg-')) {
    targetBuildingId = rawEnd;
  } else if (rawEnd.startsWith('stop-')) {
    targetShuttleStop = SRM_KTR_DATA.shuttleSystem && SRM_KTR_DATA.shuttleSystem.stops.find(s => s.id === rawEnd);
    if (targetShuttleStop) {
      campusTargetNodeId = targetShuttleStop.nodeId;
    }
  } else if (rawEnd.startsWith('surr-')) {
    const sid = rawEnd.replace(/^surr-+/, '');
    targetSurround = SRM_KTR_DATA.surroundings.find(s => s.id === sid || s.id === `surr-${sid}` || s.id === rawEnd);
    if (targetSurround && targetSurround.buildingRef) {
      targetBuildingId = targetSurround.buildingRef;
    }
  }

  // Map building to outdoor node
  const bldgNodeMap = {
    'bldg-tp': 'node-tp-entrance',
    'bldg-main': 'node-main-bldg-entrance',
    'bldg-ub': 'node-ub-entrance',
    'bldg-tpg': 'node-tpg-front',
    'bldg-bio': 'node-bio-entrance',
    'bldg-lib': 'node-lib-entrance',
    'bldg-bel': 'node-bel-entrance',
    'bldg-med': 'node-med-entrance',
    'bldg-hostels-north': 'node-hostels-entrance'
  };

  if (targetBuildingId) {
    campusTargetNodeId = bldgNodeMap[targetBuildingId] || 'node-central-quad';
  } else if (targetSurround) {
    const sid = targetSurround.id.replace(/^surr-+/, '');
    if (sid === 'java') campusTargetNodeId = 'node-java-canteen';
    else if (sid === 'gazebo') campusTargetNodeId = 'node-gazebo';
    else if (sid === 'clock') campusTargetNodeId = 'node-central-quad';
    else if (sid === 'chola') campusTargetNodeId = 'node-chola-statue';
    else if (sid === 'arch-gate') campusTargetNodeId = 'node-main-arch';
    else if (sid === 'potheri') campusTargetNodeId = 'node-potheri';
    else if (sid === 'sports') campusTargetNodeId = 'node-sports-arena';
    else if (sid === 'temple') campusTargetNodeId = 'node-temple';
    else if (sid === 'library') campusTargetNodeId = 'node-lib-entrance';
    else if (sid === 'hospital') campusTargetNodeId = 'node-med-entrance';
    else if (sid === 'cub-bank') campusTargetNodeId = 'node-tp-entrance';
    else if (sid === 'indian-bank') campusTargetNodeId = 'node-ub-entrance';
    else {
      // Find closest nav node by Euclidean distance
      let closestNode = 'node-central-quad';
      let minDist = Infinity;
      SRM_KTR_DATA.navGraph.nodes.forEach(n => {
        const d = Math.hypot(n.x - targetSurround.x, n.y - targetSurround.y);
        if (d < minDist) {
          minDist = d;
          closestNode = n.id;
        }
      });
      campusTargetNodeId = closestNode;
    }
  }

  const routeResult = findShortestSrmPath(startId, campusTargetNodeId);
  if (!routeResult) {
    alert("Could not compute route between chosen spots.");
    return;
  }

  // Turn-by-turn steps
  const steps = [];
  const startNode = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === startId);

  steps.push({
    icon: 'fa-solid fa-play',
    text: `Start at ${startNode ? startNode.name : 'Origin'}`,
    sub: 'Begin walking along the illuminated campus walkway'
  });

  for (let i = 0; i < routeResult.path.length - 1; i++) {
    const fromId = routeResult.path[i];
    const toId = routeResult.path[i + 1];
    const edge = SRM_KTR_DATA.navGraph.edges.find(e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId));
    const nextNode = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === toId);

    if (edge) {
      steps.push({
        icon: 'fa-solid fa-person-walking',
        text: edge.desc,
        sub: `Walk for ${edge.dist} meters towards ${nextNode ? nextNode.name : 'waypoint'}`
      });
    }
  }

  // If destination is a teacher in a high-rise
  let totalDistance = routeResult.totalMeters;
  const targetBldg = SRM_KTR_DATA.buildings.find(b => b.id === targetBuildingId);
  const indoorInfo = targetBuildingId ? SRM_KTR_DATA.indoorNavigation[targetBuildingId] : null;

  if (targetTeacher && targetBldg && indoorInfo) {
    steps.push({
      icon: 'fa-solid fa-door-open',
      text: `Enter ${targetBldg.name}`,
      sub: 'Step inside the ground floor reception lobby.'
    });

    if (targetTeacher.floor > 0) {
      const mode = isAccessible ? 'Elevator (Step-Free Priority)' : 'High-Speed Elevator Bank';
      steps.push({
        icon: 'fa-solid fa-elevator',
        text: `Take ${mode} to ${targetTeacher.floorLabel}`,
        sub: `${indoorInfo.elevatorName}. Direct lift to Floor ${targetTeacher.floor}.`
      });
      totalDistance += 40; // vertical transit
    }

    const floorGuide = indoorInfo.floorGuide[targetTeacher.floor] || 'Follow corridor signs to the faculty office.';
    steps.push({
      icon: 'fa-solid fa-signs-post',
      text: `Floor Guidance (${targetTeacher.floorLabel})`,
      sub: floorGuide
    });

    steps.push({
      icon: 'fa-solid fa-location-dot',
      text: `Arrived at ${teacherCabinHeader(targetTeacher)}`,
      sub: `Room ${targetTeacher.roomNumber} (${targetTeacher.cabinDetails}) in ${targetBldg.shortName}.`
    });
  } else if (targetBldg) {
    steps.push({
      icon: 'fa-solid fa-location-dot',
      text: `Arrived at ${targetBldg.name}`,
      sub: `Main entrance of ${targetBldg.name} (${targetBldg.code}).`
    });
  } else if (targetSurround) {
    steps.push({
      icon: 'fa-solid fa-flag-checkered',
      text: `Arrived at ${targetSurround.name}`,
      sub: targetSurround.desc
    });
  } else if (targetShuttleStop) {
    steps.push({
      icon: 'fa-solid fa-bus',
      text: `Arrived at ${targetShuttleStop.name}`,
      sub: `${targetShuttleStop.road} • Internal Electric Shuttle & Bus Stop.`
    });
  }

  const walkMinutes = Math.max(1, Math.ceil(totalDistance / 75) + (targetTeacher && targetTeacher.floor > 3 ? 1 : 0));

  state.activeRoute = {
    pathNodeIds: routeResult.path,
    steps,
    totalDistance,
    walkMinutes,
    targetBuildingId
  };

  // Render UI
  elements.routeEtaText.textContent = `${walkMinutes} min`;
  elements.routeDistText.textContent = `${totalDistance} m • Google Maps Walking Route`;

  elements.routeStepsContainer.innerHTML = steps.map((s, idx) => `
    <div class="route-step-card">
      <div class="route-step-icon">
        <i class="${s.icon}"></i>
      </div>
      <div>
        <div style="font-weight: 700; color: var(--mono-white);">${s.text}</div>
        <div style="color: var(--mono-300); font-size: 0.72rem; margin-top: 1px;">${s.sub}</div>
      </div>
    </div>
  `).join('');

  elements.routeGuidanceContainer.style.display = 'flex';

  // Draw monochrome route on SVG
  drawMonochromeRoute();

  if (targetBuildingId) {
    highlightBuilding(targetBuildingId);
  }
}

function teacherCabinHeader(t) {
  return `${t.name}'s Cabin`;
}

function drawMonochromeRoute() {
  if (!state.activeRoute) return;

  const points = state.activeRoute.pathNodeIds.map(id => {
    const node = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === id);
    return node ? `${node.x},${node.y}` : null;
  }).filter(Boolean);

  const polylineStr = points.join(' ');

  const startNode = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === state.activeRoute.pathNodeIds[0]);
  const endNode = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === state.activeRoute.pathNodeIds[state.activeRoute.pathNodeIds.length - 1]);

  elements.layerRoutes.innerHTML = `
    <!-- High-Contrast Monochrome Dashed Route -->
    <polyline 
      points="${polylineStr}" 
      fill="none" 
      stroke="#ffffff" 
      stroke-width="5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      class="svg-monochrome-route"
      filter="url(#white-glow)"
    />

    <!-- Start Marker (White ring with inner dot) -->
    ${startNode ? `
      <g transform="translate(${startNode.x}, ${startNode.y})">
        <circle cx="0" cy="0" r="10" fill="#000000" stroke="#ffffff" stroke-width="2.5" />
        <circle cx="0" cy="0" r="4" fill="#ffffff" />
        <text x="0" y="-14" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="700">START</text>
      </g>
    ` : ''}

    <!-- End Marker (Target Pin) -->
    ${endNode ? `
      <g transform="translate(${endNode.x}, ${endNode.y})" class="svg-pulsing-marker">
        <path d="M 0 -24 C -8 -24 -14 -18 -14 -10 C -14 0 0 12 0 12 C 0 12 14 0 14 -10 C 14 -18 8 -24 0 -24 Z" fill="#ffffff" stroke="#000000" stroke-width="2" />
        <circle cx="0" cy="-10" r="5" fill="#000000" />
        <circle cx="0" cy="-10" r="2" fill="#ffffff" />
        <text x="0" y="26" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="800">DESTINATION</text>
      </g>
    ` : ''}
  `;
}

function toggleVoiceGuidance() {
  if (!('speechSynthesis' in window)) {
    alert("Audio voice navigation is not supported in this browser.");
    return;
  }

  if (state.isSpeaking) {
    window.speechSynthesis.cancel();
    state.isSpeaking = false;
    elements.btnVoiceDirections.innerHTML = `<i class="fa-solid fa-volume-high"></i><span>Audio</span>`;
    return;
  }

  if (!state.activeRoute || !state.activeRoute.steps) {
    alert("Please calculate a route first.");
    return;
  }

  const narration = state.activeRoute.steps.map(s => `${s.text}. ${s.sub}`).join(' ');
  const utterance = new SpeechSynthesisUtterance(narration);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    state.isSpeaking = false;
    elements.btnVoiceDirections.innerHTML = `<i class="fa-solid fa-volume-high"></i><span>Audio</span>`;
  };

  state.isSpeaking = true;
  elements.btnVoiceDirections.innerHTML = `<i class="fa-solid fa-stop"></i><span>Stop</span>`;
  window.speechSynthesis.speak(utterance);
}

// -----------------------------------------------------------------------------
// 4. CAMPUS SURROUNDINGS & HANGOUTS VIEW
// -----------------------------------------------------------------------------
function setupSurroundings() {
  renderSurroundingsList();
}

function renderSurroundingsList() {
  elements.surroundingsListContainer.innerHTML = SRM_KTR_DATA.surroundings.map(s => `
    <div class="surround-card" data-surround-id="${s.id}">
      <div class="surround-card-top">
        <div class="surround-card-title">${s.name}</div>
        <span class="surround-badge">${s.category}</span>
      </div>
      <div class="surround-desc">${s.desc}</div>
      <div class="surround-footer">
        <div><i class="${s.icon}"></i> ${s.hours}</div>
        <button class="btn-gmaps-primary btn-nav-surround" data-surround-id="${s.id}" style="padding: 4px 12px; font-size: 0.72rem;">
          Directions
        </button>
      </div>
    </div>
  `).join('');

  elements.surroundingsListContainer.querySelectorAll('.surround-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const sid = card.getAttribute('data-surround-id');
      const item = SRM_KTR_DATA.surroundings.find(s => s.id === sid);
      if (item) {
        showSurroundDetail(item);
      }
    });
  });

  elements.surroundingsListContainer.querySelectorAll('.btn-nav-surround').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sid = btn.getAttribute('data-surround-id');
      switchMode('directions');
      elements.routeEndSelect.value = `surr-${sid}`;
      calculateAndDrawRoute();
    });
  });
}

function showSurroundDetail(item) {
  const targetX = item.x;
  const targetY = item.y;

  elements.layerMarkers.innerHTML = `
    <g transform="translate(${targetX}, ${targetY})" class="svg-pulsing-marker">
      <path d="M 0 -22 C -7 -22 -12 -16 -12 -9 C -12 1 0 10 0 10 C 0 10 12 1 12 -9 C 12 -16 7 -22 0 -22 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
      <circle cx="0" cy="-9" r="4.5" fill="#000000" />
      <text x="0" y="24" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="700">${item.name}</text>
    </g>
  `;

  // Pan to landmark
  state.mapTransform = { x: (500 - targetX) * 1.2, y: (350 - targetY) * 1.2, scale: 1.4 };
  applyTransform();
}

// -----------------------------------------------------------------------------
// 4.5 CAMPUS SHUTTLE & BUS TIMINGS ENGINE
// -----------------------------------------------------------------------------
function setupShuttles() {
  if (elements.tabShuttleCampus) {
    elements.tabShuttleCampus.addEventListener('click', () => switchShuttleTab('campus'));
  }
  if (elements.tabShuttleCity) {
    elements.tabShuttleCity.addEventListener('click', () => switchShuttleTab('city'));
  }
  if (elements.tabShuttleStops) {
    elements.tabShuttleStops.addEventListener('click', () => switchShuttleTab('stops'));
  }

  if (elements.btnToggleShuttleLoop) {
    elements.btnToggleShuttleLoop.addEventListener('click', () => toggleShuttleLoopOnMap());
  }

  if (elements.shuttleFilterInput) {
    elements.shuttleFilterInput.addEventListener('input', (e) => {
      state.shuttleFilterQuery = e.target.value.toLowerCase().trim();
      renderShuttleList();
    });
  }

  // Real-time ticking updater for live countdown (every 10 seconds)
  setInterval(() => {
    if (state.currentMode === 'shuttles') {
      renderShuttleHeroCard();
      if (state.shuttleTab === 'campus' || state.shuttleTab === 'stops') {
        renderShuttleList();
      }
    }
  }, 10000);
}

function switchShuttleTab(tab) {
  state.shuttleTab = tab;
  if (elements.tabShuttleCampus) elements.tabShuttleCampus.classList.toggle('active', tab === 'campus');
  if (elements.tabShuttleCity) elements.tabShuttleCity.classList.toggle('active', tab === 'city');
  if (elements.tabShuttleStops) elements.tabShuttleStops.classList.toggle('active', tab === 'stops');

  renderShuttleList();
}

function calculateNextDeparture(intervalMin = 10, startHr = 7, endHr = 22.5) {
  const now = new Date();
  const currentHr = now.getHours() + now.getMinutes() / 60;

  if (currentHr < startHr) {
    const minsAway = Math.round((startHr - currentHr) * 60);
    return {
      minsAway,
      timeStr: "07:00 AM",
      status: "First shuttle departs at 07:00 AM",
      isActive: false
    };
  }

  if (currentHr >= endHr) {
    return {
      minsAway: null,
      timeStr: "07:00 AM Tomorrow",
      status: "Night Service Closed (On-call hospital buggies available)",
      isActive: false
    };
  }

  const currentTotalMin = now.getHours() * 60 + now.getMinutes();
  const mod = currentTotalMin % intervalMin;
  let minsRemaining = intervalMin - mod;
  if (minsRemaining <= 0) minsRemaining = intervalMin;

  const depDate = new Date(Date.now() + minsRemaining * 60000);
  const timeStr = depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return {
    minsAway: minsRemaining,
    timeStr,
    status: minsRemaining <= 3 ? "Arriving Now" : "On Schedule",
    isActive: true
  };
}

function renderShuttleHeroCard() {
  if (!elements.shuttleHeroCard || !SRM_KTR_DATA.shuttleSystem) return;

  const dep = calculateNextDeparture(10, 7, 22.5);
  const countdownText = dep.minsAway !== null ? `~${dep.minsAway} min${dep.minsAway === 1 ? '' : 's'}` : "Tomorrow";

  elements.shuttleHeroCard.innerHTML = `
    <div class="shuttle-hero-header">
      <span class="shuttle-hero-tag">
        <i class="fa-solid fa-bolt"></i>
        <span>Live Campus Shuttle</span>
      </span>
      <span class="live-pulse-badge">
        <span class="live-dot"></span>
        <span>${dep.status}</span>
      </span>
    </div>

    <div class="shuttle-hero-countdown">
      <div class="shuttle-countdown-big">${countdownText}</div>
      <div class="shuttle-countdown-sub">Expected departure at ${dep.timeStr}</div>
    </div>

    <div class="shuttle-hero-details">
      <span><i class="fa-solid fa-route"></i> Ring Line (SH-01)</span>
      <span><i class="fa-solid fa-clock"></i> Every 8-10 mins</span>
      <span><i class="fa-solid fa-circle-check"></i> 100% Free Service</span>
    </div>

    <button class="btn-gmaps-primary" style="width: 100%; padding: 8px 12px; font-size: 0.78rem; border-radius: var(--radius-xs);" id="btn-hero-nearest-stop">
      <i class="fa-solid fa-location-arrow"></i>
      <span>Walk to Main Arch Shuttle Bay</span>
    </button>
  `;

  const heroBtn = elements.shuttleHeroCard.querySelector('#btn-hero-nearest-stop');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      switchMode('directions');
      elements.routeEndSelect.value = 'stop-arch-gate';
      calculateAndDrawRoute();
    });
  }
}

function renderShuttleView() {
  renderShuttleHeroCard();
  renderShuttleList();
}

function renderShuttleList() {
  if (!elements.shuttleListContainer || !SRM_KTR_DATA.shuttleSystem) return;
  const query = state.shuttleFilterQuery;

  if (state.shuttleTab === 'campus') {
    renderCampusShuttlesList(query);
  } else if (state.shuttleTab === 'city') {
    renderCityBusesList(query);
  } else if (state.shuttleTab === 'stops') {
    renderBusStopsList(query);
  }
}

function renderCampusShuttlesList(query) {
  let routes = SRM_KTR_DATA.shuttleSystem.internalRoutes || [];
  if (query) {
    routes = routes.filter(r => 
      r.name.toLowerCase().includes(query) || 
      r.code.toLowerCase().includes(query) || 
      r.description.toLowerCase().includes(query)
    );
  }

  if (routes.length === 0) {
    elements.shuttleListContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 12px; color: var(--mono-400); font-size: 0.8rem;">
        No campus shuttle routes found matching "${query}".
      </div>
    `;
    return;
  }

  elements.shuttleListContainer.innerHTML = routes.map(r => {
    const dep = calculateNextDeparture(r.intervalMinutes, r.startHour, r.endHour);
    const stopsList = r.stopsOrder.map(sid => {
      const stopObj = SRM_KTR_DATA.shuttleSystem.stops.find(s => s.id === sid);
      return stopObj ? stopObj.shortName : sid;
    });

    return `
      <div class="shuttle-route-card" data-route-id="${r.id}">
        <div class="shuttle-card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="shuttle-route-badge">${r.code}</span>
              <span style="font-size: 0.72rem; color: var(--mono-300); font-weight: 700;">${r.badge}</span>
            </div>
            <div class="shuttle-route-title">${r.name}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.82rem; font-weight: 800; color: #4ade80;">${dep.minsAway ? `~${dep.minsAway}m` : 'Closed'}</div>
            <div style="font-size: 0.65rem; color: var(--mono-400);">${dep.timeStr}</div>
          </div>
        </div>

        <p class="shuttle-route-desc">${r.description}</p>

        <div class="shuttle-meta-grid">
          <div class="shuttle-meta-item">
            <span class="shuttle-meta-label">Hours</span>
            <span class="shuttle-meta-val">${r.operatingHours}</span>
          </div>
          <div class="shuttle-meta-item">
            <span class="shuttle-meta-label">Peak Frequency</span>
            <span class="shuttle-meta-val">${r.frequencyPeak}</span>
          </div>
          <div class="shuttle-meta-item">
            <span class="shuttle-meta-label">Normal Frequency</span>
            <span class="shuttle-meta-val">${r.frequencyNormal}</span>
          </div>
          <div class="shuttle-meta-item">
            <span class="shuttle-meta-label">Fare</span>
            <span class="shuttle-meta-val" style="color: #4ade80;">${r.fare}</span>
          </div>
        </div>

        <div>
          <div style="font-size: 0.68rem; font-weight: 700; color: var(--mono-400); margin-bottom: 5px; text-transform: uppercase;">
            Stops Along Route (${stopsList.length})
          </div>
          <div class="shuttle-stops-chips-row">
            ${stopsList.map((sName, idx) => `
              <span class="shuttle-stop-chip">
                <span style="color: var(--mono-400); font-size: 0.6rem; margin-right: 3px;">${idx + 1}.</span>${sName}
              </span>
            `).join('')}
          </div>
        </div>

        <div class="shuttle-card-actions">
          <button class="btn-gmaps-primary btn-highlight-route" style="flex: 1; padding: 7px 10px; font-size: 0.74rem;" data-route-id="${r.id}">
            <i class="fa-solid fa-map-location-dot"></i>
            <span>Highlight on Map</span>
          </button>
          <button class="btn-gmaps-secondary btn-nearest-stop-nav" style="padding: 7px 10px; font-size: 0.74rem;" data-first-stop="${r.stopsOrder[0]}">
            <i class="fa-solid fa-person-walking"></i>
            <span>Board Here</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Event listeners on cards
  elements.shuttleListContainer.querySelectorAll('.btn-highlight-route').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state.isShuttleLoopVisible) {
        toggleShuttleLoopOnMap();
      }
      showToast("Displaying SRM Campus Shuttle Loop on Map");
    });
  });

  elements.shuttleListContainer.querySelectorAll('.btn-nearest-stop-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopId = btn.getAttribute('data-first-stop') || 'stop-arch-gate';
      switchMode('directions');
      elements.routeEndSelect.value = stopId;
      calculateAndDrawRoute();
    });
  });
}

function renderCityBusesList(query) {
  let routes = SRM_KTR_DATA.shuttleSystem.cityRoutes || [];
  if (query) {
    routes = routes.filter(r => 
      r.destination.toLowerCase().includes(query) || 
      r.routeNumber.toLowerCase().includes(query) || 
      r.via.toLowerCase().includes(query) || 
      r.busNumbers.some(b => b.toLowerCase().includes(query))
    );
  }

  if (routes.length === 0) {
    elements.shuttleListContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 12px; color: var(--mono-400); font-size: 0.8rem;">
        No college buses found for "${query}". Try searching "Tambaram", "Guindy", "Koyambedu", etc.
      </div>
    `;
    return;
  }

  elements.shuttleListContainer.innerHTML = routes.map(r => `
    <div class="city-bus-card">
      <div class="city-bus-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="city-route-num-badge">Route ${r.routeNumber}</span>
          <span style="font-size: 0.72rem; color: #4ade80; font-weight: 700;">
            <i class="fa-solid fa-circle-check" style="font-size: 0.65rem;"></i> ${r.status}
          </span>
        </div>
        <span style="font-size: 0.7rem; color: var(--mono-300); font-weight: 600;">
          ${r.capacity}
        </span>
      </div>

      <div>
        <div class="city-bus-dest">To ${r.destination}</div>
        <div class="city-bus-numbers">Assigned: ${r.busNumbers.join(' & ')} • ${r.busBay}</div>
      </div>

      <div class="city-bus-via">
        <span style="color: var(--mono-300); font-weight: 600;">Via:</span> ${r.via}
      </div>

      <div class="city-bus-timings-box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="city-timing-label">Morning Arrival</span>
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--mono-200);">${r.morningArrival}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span class="city-timing-label">Evening Departure Shifts</span>
        </div>
        <div class="city-departure-chips">
          ${r.eveningDepartures.map(d => `<span class="city-departure-chip"><i class="fa-regular fa-clock" style="font-size: 0.6rem; margin-right: 3px;"></i>${d}</span>`).join('')}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
        <span style="font-size: 0.68rem; color: var(--mono-400);">${r.highlights}</span>
        <button class="btn-gmaps-secondary btn-walk-bay" style="padding: 5px 12px; font-size: 0.72rem;" data-bay="${r.busBay}">
          <i class="fa-solid fa-location-dot"></i>
          <span>Directions to Bay</span>
        </button>
      </div>
    </div>
  `).join('');

  elements.shuttleListContainer.querySelectorAll('.btn-walk-bay').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode('directions');
      elements.routeEndSelect.value = 'stop-arch-gate';
      calculateAndDrawRoute();
      showToast("Walking route to Main Bus Parking Bay calculated");
    });
  });
}

function renderBusStopsList(query) {
  let stops = SRM_KTR_DATA.shuttleSystem.stops || [];
  if (query) {
    stops = stops.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.road.toLowerCase().includes(query) || 
      s.badge.toLowerCase().includes(query)
    );
  }

  if (stops.length === 0) {
    elements.shuttleListContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 12px; color: var(--mono-400); font-size: 0.8rem;">
        No shuttle stops found matching "${query}".
      </div>
    `;
    return;
  }

  elements.shuttleListContainer.innerHTML = stops.map(s => {
    const dep = calculateNextDeparture(10, 7, 22.5);
    return `
      <div class="bus-stop-card" data-stop-id="${s.id}">
        <div class="bus-stop-title-row">
          <div style="display: flex; align-items: center; gap: 7px;">
            <i class="fa-solid fa-signs-post" style="color: var(--mono-white); font-size: 0.85rem;"></i>
            <span class="bus-stop-name">${s.name}</span>
          </div>
          <span class="bus-stop-badge">${s.badge}</span>
        </div>

        <div style="font-size: 0.72rem; color: var(--mono-300);">
          <i class="fa-solid fa-road" style="font-size: 0.65rem; color: var(--mono-400); margin-right: 4px;"></i>${s.road}
        </div>

        <p style="font-size: 0.72rem; color: var(--mono-400); line-height: 1.35;">${s.desc}</p>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--mono-900); padding: 6px 10px; border-radius: var(--radius-xs);">
          <span style="font-size: 0.7rem; color: var(--mono-300);">Next Shuttle:</span>
          <span style="font-size: 0.75rem; font-weight: 800; color: #4ade80;">${dep.minsAway ? `~${dep.minsAway} mins (${dep.timeStr})` : 'Morning'}</span>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-top: 4px;">
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${s.routesServing.map(r => `<span style="font-size: 0.62rem; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: var(--radius-xs); color: var(--mono-200); font-weight: 700;">${r}</span>`).join('')}
          </div>
          <button class="btn-gmaps-primary btn-directions-to-stop" style="padding: 5px 10px; font-size: 0.72rem; white-space: nowrap;" data-stop-id="${s.id}">
            <i class="fa-solid fa-diamond-turn-right"></i>
            <span>Walk Here</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  elements.shuttleListContainer.querySelectorAll('.bus-stop-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const stopId = card.getAttribute('data-stop-id');
      focusOnShuttleStop(stopId);
    });
  });

  elements.shuttleListContainer.querySelectorAll('.btn-directions-to-stop').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stopId = btn.getAttribute('data-stop-id');
      switchMode('directions');
      elements.routeEndSelect.value = stopId;
      calculateAndDrawRoute();
    });
  });
}

function focusOnShuttleStop(stopId) {
  const stop = SRM_KTR_DATA.shuttleSystem.stops.find(s => s.id === stopId);
  if (!stop) return;

  elements.layerMarkers.innerHTML = `
    <g transform="translate(${stop.x}, ${stop.y})" class="svg-pulsing-marker">
      <circle cx="0" cy="0" r="14" fill="#09090b" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="0" cy="0" r="8" fill="#ffffff" />
      <text x="0" y="26" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="900">${stop.shortName}</text>
    </g>
  `;

  // Pan to stop
  state.mapTransform = { x: (500 - stop.x) * 1.3, y: (350 - stop.y) * 1.3, scale: 1.5 };
  applyTransform();
  showToast(`Focused on ${stop.name}`);
}

function renderShuttleStopsOnMap() {
  if (!elements.layerShuttles || !SRM_KTR_DATA.shuttleSystem) return;

  const stops = SRM_KTR_DATA.shuttleSystem.stops;
  const stopsSvg = stops.map(stop => `
    <g transform="translate(${stop.x}, ${stop.y})" class="svg-bus-stop-pin" data-stop-id="${stop.id}">
      <circle cx="0" cy="0" r="11" fill="#09090b" stroke="#ffffff" stroke-width="2" />
      <circle cx="0" cy="0" r="7" fill="#18181b" />
      <!-- Minimalist Bus Glyph -->
      <rect x="-4.5" y="-4" width="9" height="7.5" rx="1.5" fill="#ffffff" />
      <rect x="-3.5" y="-2.5" width="7" height="2.5" rx="0.5" fill="#000000" />
      <circle cx="-2.2" cy="4.2" r="1" fill="#ffffff" />
      <circle cx="2.2" cy="4.2" r="1" fill="#ffffff" />
      
      <!-- Label Box -->
      <rect x="-35" y="14" width="70" height="15" rx="3" fill="#000000" stroke="#3f3f46" stroke-width="1" />
      <text x="0" y="24.5" text-anchor="middle" fill="#ffffff" font-size="6.8" font-weight="800">${stop.shortName}</text>
    </g>
  `).join('');

  // If shuttle loop is active, prepend loop polyline
  let loopSvg = '';
  if (state.isShuttleLoopVisible) {
    loopSvg = generateShuttleLoopPolylineSvg();
  }

  elements.layerShuttles.innerHTML = loopSvg + stopsSvg;

  // Attach hover & click listeners to stop pins
  elements.layerShuttles.querySelectorAll('.svg-bus-stop-pin').forEach(el => {
    const sid = el.getAttribute('data-stop-id');
    const stop = stops.find(s => s.id === sid);
    if (!stop) return;

    el.addEventListener('mouseenter', (e) => {
      const dep = calculateNextDeparture(10, 7, 22.5);
      showTooltip(e, `<strong>${stop.name}</strong><br><span style="color:#a1a1aa;">${stop.road}</span><br>Serving: ${stop.routesServing.join(', ')}<br><span style="color:#4ade80; font-weight:700;">Next shuttle in ~${dep.minsAway || 10} mins</span>`);
    });
    el.addEventListener('mousemove', (e) => moveTooltip(e));
    el.addEventListener('mouseleave', () => hideTooltip());
    el.addEventListener('click', () => {
      switchMode('shuttles');
      switchShuttleTab('stops');
      focusOnShuttleStop(stop.id);
    });
  });
}

function generateShuttleLoopPolylineSvg() {
  const loopCoords = [
    { x: 190, y: 420 }, // Main Arch
    { x: 325, y: 405 }, // UB Entrance
    { x: 435, y: 395 }, // Library
    { x: 680, y: 270 }, // Tech Park
    { x: 825, y: 265 }, // TP Ganesan Auditorium
    { x: 700, y: 80 },  // Sports Oval
    { x: 535, y: 480 }, // North Hostels
    { x: 750, y: 450 }, // Hospital Casualty
    { x: 190, y: 420 }  // Back to Main Arch
  ];

  const pointsStr = loopCoords.map(pt => `${pt.x},${pt.y}`).join(' ');

  return `
    <!-- Glowing Animated SRM Campus Shuttle Loop -->
    <polyline 
      points="${pointsStr}" 
      class="svg-shuttle-loop"
    />
    <g id="animated-campus-shuttle-bus" class="svg-animated-shuttle-bus" transform="translate(190, 420)">
      <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <text x="0" y="3.5" text-anchor="middle" font-size="8.5">🚌</text>
    </g>
  `;
}

function toggleShuttleLoopOnMap() {
  state.isShuttleLoopVisible = !state.isShuttleLoopVisible;

  if (elements.btnToggleShuttleLoop && elements.labelToggleShuttleLoop) {
    if (state.isShuttleLoopVisible) {
      elements.btnToggleShuttleLoop.classList.add('active');
      elements.labelToggleShuttleLoop.textContent = "Hide Shuttle Loop on Map";
      showToast("Campus Shuttle Loop active on map");
      startShuttleBusAnimation();
    } else {
      elements.btnToggleShuttleLoop.classList.remove('active');
      elements.labelToggleShuttleLoop.textContent = "Show Shuttle Loop on Map";
      stopShuttleBusAnimation();
      showToast("Campus Shuttle Loop hidden");
    }
  }

  renderShuttleStopsOnMap();
}

const shuttleLoopWaypoints = [
  { x: 190, y: 420 },
  { x: 325, y: 405 },
  { x: 435, y: 395 },
  { x: 680, y: 270 },
  { x: 825, y: 265 },
  { x: 700, y: 80 },
  { x: 535, y: 480 },
  { x: 750, y: 450 },
  { x: 190, y: 420 }
];

let shuttleAnimStartTime = null;

function startShuttleBusAnimation() {
  if (state.shuttleAnimationId) cancelAnimationFrame(state.shuttleAnimationId);
  shuttleAnimStartTime = performance.now();

  function animateLoop(now) {
    if (!state.isShuttleLoopVisible) return;

    const busEl = document.getElementById('animated-campus-shuttle-bus');
    if (busEl) {
      const duration = 24000; // 24 seconds for full circuit
      const elapsed = (now - shuttleAnimStartTime) % duration;
      const progress = elapsed / duration;

      const totalSegments = shuttleLoopWaypoints.length - 1;
      const segProgress = progress * totalSegments;
      const segIndex = Math.floor(segProgress);
      const subT = segProgress - segIndex;

      const p1 = shuttleLoopWaypoints[segIndex];
      const p2 = shuttleLoopWaypoints[Math.min(segIndex + 1, totalSegments)];

      if (p1 && p2) {
        const curX = p1.x + (p2.x - p1.x) * subT;
        const curY = p1.y + (p2.y - p1.y) * subT;
        busEl.setAttribute('transform', `translate(${curX.toFixed(1)}, ${curY.toFixed(1)})`);
      }
    }

    state.shuttleAnimationId = requestAnimationFrame(animateLoop);
  }

  state.shuttleAnimationId = requestAnimationFrame(animateLoop);
}

function stopShuttleBusAnimation() {
  if (state.shuttleAnimationId) {
    cancelAnimationFrame(state.shuttleAnimationId);
    state.shuttleAnimationId = null;
  }
}

// -----------------------------------------------------------------------------
// 5. MONOCHROME MAP VECTOR ENGINE (ACCURATE SRM KTR GEOMETRY FROM IMAGES)
// -----------------------------------------------------------------------------
function renderMonochromeMap() {
  // 1. Terrain & Boundaries & Accurate Geometry
  elements.layerTerrain.innerHTML = `
    <!-- Deep Monochrome Canvas Base -->
    <rect width="1000" height="700" fill="#09090b" />
    <rect width="1000" height="700" fill="url(#mono-grid)" />

    <!-- Potheri Lake (Water body at top-left, visible in drone photo & panorama) -->
    <path d="M 0 0 L 140 0 C 130 50, 110 80, 50 110 C 20 120, 0 115, 0 115 Z" fill="#0c1015" stroke="#27272a" stroke-width="1.5" />
    <text x="40" y="55" fill="#52525b" font-size="8.5" font-weight="700" letter-spacing="1">POTHERI LAKE</text>

    <!-- Southern Railway Line (Parallel to GST Road, diagonal along west border) -->
    <g id="railway-tracks">
      <path d="M 0 690 L 220 10" stroke="#1c1c20" stroke-width="24" />
      <path d="M 0 690 L 220 10" stroke="#3f3f46" stroke-width="3" stroke-dasharray="8 6" />
      <text x="75" y="440" transform="rotate(-72, 75, 440)" fill="#52525b" font-size="8" font-weight="700" letter-spacing="2">SOUTHERN RAILWAY (EMU LINE TO CHENNAI BEACH)</text>
    </g>

    <!-- GST Road (NH 45 / Grand Southern Trunk Road) - Diagonal along west boundary -->
    <g id="gst-highway">
      <path d="M 30 700 L 255 10" stroke="#141416" stroke-width="48" />
      <path d="M 30 700 L 255 10" stroke="#3f3f46" stroke-width="2" stroke-dasharray="16 12" />
      <text x="145" y="360" transform="rotate(-72, 145, 360)" fill="#71717a" font-size="9" font-weight="800" letter-spacing="3">GST ROAD (NH 45 - CHENNAI TO TRICHY HIGHWAY)</text>
    </g>

    <!-- Potheri Railway Station & Skybridge -->
    <rect x="45" y="548" width="75" height="24" rx="3" fill="#202024" stroke="#ffffff" stroke-width="1" />
    <text x="82" y="563" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="800">POTHERI STN</text>

    <!-- Pedestrian Foot Overbridge across GST Road -->
    <line x1="80" y1="560" x2="190" y2="480" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
    <line x1="80" y1="560" x2="190" y2="480" stroke="#000000" stroke-width="1.5" stroke-dasharray="3 3" />
    <text x="135" y="510" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="700">SKYBRIDGE</text>

    <!-- Central Clock Tower Lawn & Landscaped Quad in front of University Building -->
    <rect x="330" y="405" width="60" height="50" rx="8" fill="#121413" stroke="#27272a" stroke-width="1.5" />
    <circle cx="360" cy="430" r="12" fill="#18181b" stroke="#ffffff" stroke-width="1.5" />
    <text x="360" y="433" text-anchor="middle" fill="#ffffff" font-size="6" font-weight="700">CLOCK</text>
    
    <!-- THE ICONIC X-SHAPED CROSS PATHWAY (From Drone Image 1 and Campus Layout Plan) -->
    <g id="x-quad-garden">
      <!-- Landscaped lawn polygon -->
      <polygon points="390,395 470,395 490,465 370,465" fill="#101412" stroke="#27272a" stroke-width="1.5" />
      <!-- X-Cross Intersecting Walkways -->
      <line x1="390" y1="395" x2="490" y2="465" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <line x1="470" y1="395" x2="370" y2="465" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="430" cy="430" r="6" fill="#18181b" stroke="#ffffff" stroke-width="1.5" />
      <text x="430" y="433" text-anchor="middle" fill="#ffffff" font-size="6" font-weight="800">X</text>
    </g>

    <!-- Vendhar Square / Auditorium Plaza -->
    <rect x="680" y="240" width="130" height="50" rx="6" fill="#121316" stroke="#27272a" stroke-width="1" />
    <text x="745" y="268" text-anchor="middle" fill="#52525b" font-size="8" font-weight="700">VENDHAR SQUARE</text>

    <!-- SRM Sports Complex & Oval Athletic Ground (Northeast Campus) -->
    <ellipse cx="700" cy="80" rx="85" ry="50" fill="#121413" stroke="#27272a" stroke-width="1.5" />
    <ellipse cx="700" cy="80" rx="65" ry="35" fill="none" stroke="#3f3f46" stroke-width="1" stroke-dasharray="5 5" />
    <text x="700" y="84" text-anchor="middle" fill="#71717a" font-size="8" font-weight="700">SRM CRICKET OVAL</text>
  `;

  // 2. Named Roads from SRM 360 Virtual Tour (Exact Geometry)
  elements.layerRoads.innerHTML = `
    <!-- Mahatma Gandhi Road (Main Entrance Avenue connecting Main Gate, Central Quad, and BEL) -->
    <path 
      d="M 190 420 L 360 430 L 360 220 L 380 120" 
      stroke="#141416" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 190 420 L 360 430 L 360 220 L 380 120" 
      stroke="#1f1f23" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 190 420 L 360 430 L 360 220 L 380 120" 
      stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6 6" fill="none" 
    />
    <text x="260" y="415" class="svg-road-label" font-size="7.5">MAHATMA GANDHI ROAD</text>

    <!-- Swami Vivekananda Road (East-West Avenue connecting UB, Library, Java Canteen, and Tech Park) -->
    <path 
      d="M 270 380 L 440 380 L 530 350 L 680 270 L 760 270" 
      stroke="#141416" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 270 380 L 440 380 L 530 350 L 680 270 L 760 270" 
      stroke="#1f1f23" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 270 380 L 440 380 L 530 350 L 680 270 L 760 270" 
      stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6 6" fill="none" 
    />
    <text x="540" y="340" class="svg-road-label" font-size="7.5">SWAMI VIVEKANANDA ROAD</text>

    <!-- Sir C.V. Raman Road (North Avenue connecting BEL, Bio Block, and Tech Park) -->
    <path 
      d="M 380 220 L 490 220 L 620 220 L 680 270" 
      stroke="#141416" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 380 220 L 490 220 L 620 220 L 680 270" 
      stroke="#1f1f23" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 380 220 L 490 220 L 620 220 L 680 270" 
      stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6 6" fill="none" 
    />
    <text x="500" y="214" class="svg-road-label" font-size="7.5">SIR C.V. RAMAN ROAD</text>

    <!-- Mahakavi Bharathiyar Road (Southwest Avenue towards Main Block CRC & Temple) -->
    <path 
      d="M 175 530 L 190 420 L 270 270" 
      stroke="#141416" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 175 530 L 190 420 L 270 270" 
      stroke="#1f1f23" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 175 530 L 190 420 L 270 270" 
      stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6 6" fill="none" 
    />
    <text x="210" y="490" transform="rotate(-82, 210, 490)" class="svg-road-label" font-size="7.5">MAHAKAVI BHARATHIYAR ROAD</text>

    <!-- Hostel Road (Connecting Hostels and Medical College) -->
    <path 
      d="M 440 470 L 540 470 L 750 470" 
      stroke="#141416" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 440 470 L 540 470 L 750 470" 
      stroke="#1f1f23" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" 
    />
    <path 
      d="M 440 470 L 540 470 L 750 470" 
      stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6 6" fill="none" 
    />
    <text x="600" y="464" class="svg-road-label" font-size="7.5">HOSTEL ROAD</text>
  `;

  // 3. Pathways & Avenues (Monochrome Walkways)
  elements.layerPathways.innerHTML = SRM_KTR_DATA.navGraph.edges.map(e => {
    const u = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === e.from);
    const v = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === e.to);
    if (!u || !v) return '';

    return `
      <line 
        x1="${u.x}" y1="${u.y}" 
        x2="${v.x}" y2="${v.y}" 
        stroke="#27272a" 
        stroke-width="11" 
        stroke-linecap="round"
      />
      <line 
        x1="${u.x}" y1="${u.y}" 
        x2="${v.x}" y2="${v.y}" 
        stroke="#18181b" 
        stroke-width="8" 
        stroke-linecap="round"
      />
    `;
  }).join('');

  // 4. Buildings (University Building, Central Library, Tech Park, TP Ganesan, BEL, Bio, Main Block, Hospital, Hostels)
  elements.layerBuildings.innerHTML = SRM_KTR_DATA.buildings.map(bldg => {
    const isTP = bldg.id === 'bldg-tp';
    const isUB = bldg.id === 'bldg-ub';
    const isAud = bldg.id === 'bldg-tpg';

    const teachersInBldg = SRM_KTR_DATA.teachers.filter(t => t.buildingId === bldg.id).length;

    // Special curved geometry for Dr. TP Ganesan Auditorium (as seen in drone aerial & layout plan)
    if (isAud) {
      return `
        <g 
          class="svg-bldg-group" 
          id="bldg-group-${bldg.id}" 
          data-bldg-id="${bldg.id}"
        >
          <!-- Curved Shadow -->
          <ellipse cx="827" cy="225" rx="85" ry="55" fill="#000000" opacity="0.6" />
          
          <!-- TP Ganesan Auditorium Body with Curved Front -->
          <path 
            d="M 760 170 Q 827 140 895 170 L 895 235 Q 827 275 760 235 Z" 
            class="svg-bldg-rect" 
          />
          
          <!-- Flanking Side Wings -->
          <rect x="750" y="175" width="18" height="42" rx="3" fill="#202024" stroke="#3f3f46" stroke-width="1" />
          <rect x="887" y="175" width="18" height="42" rx="3" fill="#202024" stroke="#3f3f46" stroke-width="1" />

          <!-- Building Code Badge -->
          <rect x="812" y="160" width="30" height="15" rx="3" fill="#ffffff" />
          <text x="827" y="171" text-anchor="middle" fill="#000000" font-size="8" font-weight="900">${bldg.code}</text>

          <!-- Building Title -->
          <text 
            x="827" y="196" 
            text-anchor="middle" fill="#ffffff" 
            font-size="10.5" font-weight="800"
          >${bldg.shortName}</text>

          <text 
            x="827" y="213" 
            text-anchor="middle" fill="#a1a1aa" 
            font-size="7.5" font-weight="600"
          >3,000 Capacity Grand Auditorium</text>

          <!-- Amphitheater Curved Seating Lines -->
          <path d="M 785 198 Q 827 180 870 198" fill="none" stroke="#3f3f46" stroke-width="1" />
          <path d="M 775 214 Q 827 190 880 214" fill="none" stroke="#3f3f46" stroke-width="1" />
        </g>
      `;
    }

    // Standard high-rise building vector
    return `
      <g 
        class="svg-bldg-group" 
        id="bldg-group-${bldg.id}" 
        data-bldg-id="${bldg.id}"
      >
        <!-- Building Shadow -->
        <rect 
          x="${bldg.x + 4}" y="${bldg.y + 6}" 
          width="${bldg.width}" height="${bldg.height}" 
          rx="12" fill="#000000" opacity="0.6" 
        />

        <!-- Building Main Vector Body -->
        <rect 
          x="${bldg.x}" y="${bldg.y}" 
          width="${bldg.width}" height="${bldg.height}" 
          rx="12" 
          class="svg-bldg-rect" 
        />

        <!-- 15-Story Architectural Floor Lines for Tech Park and UB -->
        ${(isTP || isUB) ? `
          <line x1="${bldg.x + 8}" y1="${bldg.y + 26}" x2="${bldg.x + bldg.width - 8}" y2="${bldg.y + 26}" stroke="#3f3f46" stroke-width="1" />
          <line x1="${bldg.x + 8}" y1="${bldg.y + 48}" x2="${bldg.x + bldg.width - 8}" y2="${bldg.y + 48}" stroke="#3f3f46" stroke-width="1" />
          <line x1="${bldg.x + 8}" y1="${bldg.y + 70}" x2="${bldg.x + bldg.width - 8}" y2="${bldg.y + 70}" stroke="#3f3f46" stroke-width="1" />
        ` : ''}

        <!-- Building Code Badge -->
        <rect x="${bldg.x + 8}" y="${bldg.y + 6}" width="32" height="15" rx="3" fill="#ffffff" />
        <text x="${bldg.x + 24}" y="${bldg.y + 17}" text-anchor="middle" fill="#000000" font-size="8" font-weight="900">${bldg.code}</text>

        <!-- Floor Count Badge -->
        <text x="${bldg.x + bldg.width - 10}" y="${bldg.y + 17}" text-anchor="end" fill="#a1a1aa" font-size="7.5" font-weight="600">${bldg.floorsCount} Floors</text>

        <!-- Building Title -->
        <text 
          x="${bldg.x + bldg.width / 2}" y="${bldg.y + 42}" 
          text-anchor="middle" fill="#ffffff" 
          font-size="10.5" font-weight="700"
        >${bldg.name}</text>

        <!-- Short Description -->
        <text 
          x="${bldg.x + bldg.width / 2}" y="${bldg.y + 58}" 
          text-anchor="middle" fill="#a1a1aa" 
          font-size="7.5" font-weight="500"
        >${bldg.shortName}</text>

        <!-- Faculty Count Pill inside building -->
        ${teachersInBldg > 0 ? `
          <rect 
            x="${bldg.x + bldg.width / 2 - 50}" y="${bldg.y + bldg.height - 24}" 
            width="100" height="16" rx="8" 
            fill="#09090b" stroke="#ffffff" stroke-width="1" 
          />
          <text 
            x="${bldg.x + bldg.width / 2}" y="${bldg.y + bldg.height - 13}" 
            text-anchor="middle" fill="#ffffff" 
            font-size="7" font-weight="700"
          >👨‍🏫 ${teachersInBldg} Staff Cabins</text>
        ` : ''}
      </g>
    `;
  }).join('');

  // 5. Landmarks (Interactive Google Maps Pins)
  elements.layerLandmarks.innerHTML = `
    <!-- Main Arch Gate on GST Road -->
    <g transform="translate(190, 420)" class="svg-clickable-landmark" data-surround-id="surr-arch-gate">
      <rect x="-60" y="-12" width="120" height="24" rx="4" fill="#ffffff" />
      <text x="0" y="4" text-anchor="middle" fill="#000000" font-size="8.5" font-weight="900">MAIN ARCH GATE</text>
    </g>

    <!-- Chola's Statue (In center of X-quad in front of University Building & Library) -->
    <g transform="translate(430, 430)" class="svg-clickable-landmark" data-surround-id="surr-chola">
      <circle cx="0" cy="0" r="13" fill="#09090b" stroke="#ffffff" stroke-width="2" />
      <circle cx="0" cy="0" r="8" fill="#18181b" />
      <path d="M -3 3 L 3 3 L 2 -3 L 0 -6 L -2 -3 Z" fill="#ffffff" />
      <rect x="-42" y="16" width="84" height="15" rx="3" fill="#000000" stroke="#3f3f46" stroke-width="1" />
      <text x="0" y="27" text-anchor="middle" fill="#ffffff" font-size="7" font-weight="800">CHOLA'S STATUE</text>
    </g>

    <!-- Campus Temple & Spiritual Centre -->
    <g transform="translate(270, 270)" class="svg-clickable-landmark" data-surround-id="surr-temple">
      <circle cx="0" cy="0" r="13" fill="#09090b" stroke="#a1a1aa" stroke-width="1.5" />
      <text x="0" y="3.5" text-anchor="middle" fill="#ffffff" font-size="7.5" font-weight="800">TEMPLE</text>
      <text x="0" y="22" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="600">Spiritual Centre</text>
    </g>

    <!-- SRM Central Library Spot -->
    <g transform="translate(435, 350)" class="svg-clickable-landmark" data-surround-id="surr-library">
      <circle cx="0" cy="0" r="13" fill="#09090b" stroke="#a1a1aa" stroke-width="1.5" />
      <text x="0" y="3.5" text-anchor="middle" fill="#ffffff" font-size="7.5" font-weight="800">LIBRARY</text>
      <text x="0" y="22" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="600">Learning Area</text>
    </g>

    <!-- SRM Hospital & Emergency -->
    <g transform="translate(840, 520)" class="svg-clickable-landmark" data-surround-id="surr-hospital">
      <circle cx="0" cy="0" r="13" fill="#09090b" stroke="#ffffff" stroke-width="1.5" />
      <text x="0" y="3.5" text-anchor="middle" fill="#ffffff" font-size="7.5" font-weight="800">CASUALTY</text>
      <text x="0" y="22" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="600">24/7 Hospital</text>
    </g>

    <!-- Java Canteen Spot Marker -->
    <g transform="translate(530, 350)" class="svg-clickable-landmark" data-surround-id="surr-java">
      <circle cx="0" cy="0" r="14" fill="#09090b" stroke="#ffffff" stroke-width="1.5" />
      <text x="0" y="3" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="800">JAVA</text>
      <text x="0" y="24" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="600">Java Food Court</text>
    </g>

    <!-- Gazebo Spot Marker -->
    <g transform="translate(490, 280)" class="svg-clickable-landmark" data-surround-id="surr-gazebo">
      <circle cx="0" cy="0" r="13" fill="#09090b" stroke="#71717a" stroke-width="1.5" />
      <text x="0" y="3" text-anchor="middle" fill="#ffffff" font-size="7" font-weight="700">GAZEBO</text>
      <text x="0" y="23" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="600">Food Street</text>
    </g>

    <!-- Sports Arena Marker -->
    <g transform="translate(700, 80)" class="svg-clickable-landmark" data-surround-id="surr-sports">
      <circle cx="0" cy="0" r="13" fill="#09090b" stroke="#a1a1aa" stroke-width="1.5" />
      <text x="0" y="3" text-anchor="middle" fill="#ffffff" font-size="7" font-weight="700">SPORTS</text>
      <text x="0" y="23" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="600">Cricket Oval</text>
    </g>
  `;

  // Attach Landmark Click & Hover Listeners
  elements.layerLandmarks.querySelectorAll('.svg-clickable-landmark').forEach(el => {
    const sid = el.getAttribute('data-surround-id');
    const item = SRM_KTR_DATA.surroundings.find(s => s.id === sid);
    if (!item) return;

    el.addEventListener('mouseenter', (e) => {
      showTooltip(e, `<strong>${item.name}</strong><br><span style="color:#a1a1aa;">${item.category} • ${item.road}</span><br>${item.desc}`);
    });
    el.addEventListener('mousemove', (e) => moveTooltip(e));
    el.addEventListener('mouseleave', () => hideTooltip());
    el.addEventListener('click', () => {
      showSurroundDetail(item);
    });
  });

  // Attach Building Hover & Click Listeners
  elements.layerBuildings.querySelectorAll('.svg-bldg-group').forEach(el => {
    const bid = el.getAttribute('data-bldg-id');
    const bldg = SRM_KTR_DATA.buildings.find(b => b.id === bid);

    el.addEventListener('mouseenter', (e) => {
      const teachers = SRM_KTR_DATA.teachers.filter(t => t.buildingId === bid);
      const teachStr = teachers.length > 0 ? `<br><span style="color:#ffffff;">Staff: ${teachers.map(t => t.name.split(' ')[1] || t.name).slice(0, 4).join(', ')}${teachers.length > 4 ? '...' : ''}</span>` : '';
      showTooltip(e, `<strong>${bldg.name}</strong> (${bldg.floorsCount} Floors)<br>${bldg.description}${teachStr}`);
    });

    el.addEventListener('mousemove', (e) => moveTooltip(e));
    el.addEventListener('mouseleave', () => hideTooltip());

    el.addEventListener('click', () => {
      focusOnBuilding(bid);
    });
  });

  // Render Shuttle Bus Stops and Route on Layer
  renderShuttleStopsOnMap();
}

function focusOnBuilding(buildingId) {
  const bldg = SRM_KTR_DATA.buildings.find(b => b.id === buildingId);
  if (!bldg) return;

  // Highlight building
  elements.layerBuildings.querySelectorAll('.svg-bldg-rect').forEach(r => r.classList.remove('focused'));
  const bGroup = document.getElementById(`bldg-group-${buildingId}`);
  if (bGroup) {
    const rect = bGroup.querySelector('.svg-bldg-rect');
    if (rect) rect.classList.add('focused');
  }

  // Smoothly center the map view on the building
  const centerX = bldg.x + bldg.width / 2;
  const centerY = bldg.y + bldg.height / 2;
  state.mapTransform = {
    x: (500 - centerX) * 1.3,
    y: (350 - centerY) * 1.3,
    scale: 1.3
  };
  applyTransform();
}

function highlightBuilding(buildingId) {
  elements.layerBuildings.querySelectorAll('.svg-bldg-rect').forEach(r => r.classList.remove('focused'));
  const bGroup = document.getElementById(`bldg-group-${buildingId}`);
  if (bGroup) {
    const rect = bGroup.querySelector('.svg-bldg-rect');
    if (rect) rect.classList.add('focused');
  }
}

// -----------------------------------------------------------------------------
// 6. FLOOR DOCK (FILTER & ELEVATION INSPECTOR)
// -----------------------------------------------------------------------------
function setupFloorDock() {
  elements.floorPillsContainer.querySelectorAll('.floor-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const flr = parseInt(pill.getAttribute('data-floor'), 10);
      if (state.selectedFloor === flr) {
        state.selectedFloor = null;
        pill.classList.remove('active');
      } else {
        elements.floorPillsContainer.querySelectorAll('.floor-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.selectedFloor = flr;
      }
      renderTeachersList();
    });
  });
}

// -----------------------------------------------------------------------------
// 7. MAP PAN, ZOOM & LOCATION CONTROLS
// -----------------------------------------------------------------------------
function setupMapControls() {
  elements.ctrlZoomIn.addEventListener('click', () => {
    state.mapTransform.scale = Math.min(3.5, state.mapTransform.scale * 1.25);
    applyTransform();
  });

  elements.ctrlZoomOut.addEventListener('click', () => {
    state.mapTransform.scale = Math.max(0.7, state.mapTransform.scale / 1.25);
    applyTransform();
  });

  elements.ctrlResetNorth.addEventListener('click', () => {
    state.mapTransform = { x: 0, y: 0, scale: 1 };
    applyTransform();
  });

  elements.ctrlMyLocation.addEventListener('click', () => {
    const node = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === state.simulatedUserLocation);
    if (node) {
      state.mapTransform = { x: (500 - node.x) * 1.4, y: (350 - node.y) * 1.4, scale: 1.4 };
      applyTransform();
      showToast("Centered on Main Arch Gate (Your Location)");
    }
  });

  // Drag Panning
  elements.svgMap.addEventListener('mousedown', (e) => {
    state.isDragging = true;
    state.dragStart = { x: e.clientX - state.mapTransform.x, y: e.clientY - state.mapTransform.y };
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    state.mapTransform.x = e.clientX - state.dragStart.x;
    state.mapTransform.y = e.clientY - state.dragStart.y;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    state.isDragging = false;
  });

  // Wheel Zooming
  elements.svgMap.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    state.mapTransform.scale = Math.max(0.7, Math.min(4.0, state.mapTransform.scale * zoomFactor));
    applyTransform();
  }, { passive: false });
}

function applyTransform() {
  elements.svgMap.style.transform = `translate(${state.mapTransform.x}px, ${state.mapTransform.y}px) scale(${state.mapTransform.scale})`;
}

function updateUserLocationMarker() {
  const node = SRM_KTR_DATA.navGraph.nodes.find(n => n.id === state.simulatedUserLocation);
  if (!node) return;

  elements.layerMarkers.innerHTML = `
    <!-- User Current Position Marker (Blue Google Maps dot with white ring) -->
    <g transform="translate(${node.x}, ${node.y})" class="svg-pulsing-marker">
      <circle cx="0" cy="0" r="16" fill="rgba(255, 255, 255, 0.2)" />
      <circle cx="0" cy="0" r="9" fill="#000000" stroke="#ffffff" stroke-width="2" />
      <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
      <text x="0" y="24" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="700">YOU ARE HERE</text>
    </g>
  `;
}

function showTooltip(e, html) {
  elements.mapTooltip.innerHTML = html;
  elements.mapTooltip.style.display = 'block';
  moveTooltip(e);
}

function moveTooltip(e) {
  elements.mapTooltip.style.left = `${e.clientX}px`;
  elements.mapTooltip.style.top = `${e.clientY}px`;
}

function hideTooltip() {
  elements.mapTooltip.style.display = 'none';
}

// -----------------------------------------------------------------------------
// 8. STUDENT CONTRIBUTION MODAL (ADD EXCLUDED FACULTY & CUSTOM DESTINATIONS)
// -----------------------------------------------------------------------------
function setupContributionModal() {
  // Close triggers
  if (elements.btnCloseModal) {
    elements.btnCloseModal.addEventListener('click', closeContributionModal);
  }
  if (elements.btnCancelModal) {
    elements.btnCancelModal.addEventListener('click', closeContributionModal);
  }
  if (elements.btnCancelDestModal) {
    elements.btnCancelDestModal.addEventListener('click', closeContributionModal);
  }

  elements.modalAdd.addEventListener('click', (e) => {
    if (e.target === elements.modalAdd) {
      closeContributionModal();
    }
  });

  // Tab switching
  elements.tabAddFaculty.addEventListener('click', () => {
    elements.tabAddFaculty.classList.add('active');
    elements.tabAddDestination.classList.remove('active');
    elements.formAddFaculty.style.display = 'flex';
    elements.formAddDestination.style.display = 'none';
  });

  elements.tabAddDestination.addEventListener('click', () => {
    elements.tabAddDestination.classList.add('active');
    elements.tabAddFaculty.classList.remove('active');
    elements.formAddFaculty.style.display = 'none';
    elements.formAddDestination.style.display = 'flex';
  });

  // Photo file upload handler (converts to base64 DataURL)
  if (elements.inputFacPhotoFile) {
    elements.inputFacPhotoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          state.customPhotoDataUrl = uploadEvent.target.result;
          elements.photoPreviewImg.src = state.customPhotoDataUrl;
          elements.photoPreviewBox.style.display = 'flex';
          elements.inputFacPhotoUrl.value = ''; // clear url input
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Add Faculty Form Submission
  elements.formAddFaculty.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('input-fac-name').value.trim();
    const title = document.getElementById('input-fac-title').value.trim();
    const deptCode = document.getElementById('select-fac-dept').value;
    const buildingId = document.getElementById('select-fac-bldg').value;
    const floor = parseInt(document.getElementById('input-fac-floor').value, 10) || 0;
    const roomNumber = document.getElementById('input-fac-room').value.trim();
    const cabinDetails = document.getElementById('input-fac-cabin-desc').value.trim() || `Cabin ${roomNumber}`;
    const officeHours = document.getElementById('input-fac-hours').value.trim() || 'Mon-Fri: 11:00 AM - 1:00 PM';
    const status = document.getElementById('select-fac-status').value;
    const urlPhoto = elements.inputFacPhotoUrl.value.trim();

    // Department name lookup
    const deptMap = {
      'CTECH': 'Computing Technologies (CTECH)',
      'CINTEL': 'Computational Intelligence (CINTEL)',
      'NWC': 'Networking and Communications (NWC)',
      'DSBS': 'Data Science and Business Systems (DSBS)',
      'MECH': 'Department of Mechanical Engineering',
      'ECE': 'Electronics & Communication Eng (ECE)',
      'EEE': 'Electrical and Electronics Engineering (EEE)',
      'CIVIL': 'Department of Civil Engineering',
      'BIO': 'Biotechnology & Bioengineering',
      'ADMIN': 'University Administration'
    };

    const targetBldg = SRM_KTR_DATA.buildings.find(b => b.id === buildingId);
    const buildingName = targetBldg ? targetBldg.name : 'SRM KTR Campus';

    // Photo selection: uploaded file DataURL, or URL, or null
    let photo = null;
    if (state.customPhotoDataUrl) {
      photo = state.customPhotoDataUrl;
    } else if (urlPhoto) {
      photo = urlPhoto;
    }

    const newFaculty = {
      id: `t-custom-${Date.now()}`,
      name,
      title,
      dept: deptMap[deptCode] || deptCode,
      deptCode,
      buildingId,
      buildingName,
      floor,
      floorLabel: floor === 0 ? 'Ground Floor' : `${floor}th Floor`,
      roomNumber,
      cabinDetails,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@srmist.edu.in`,
      phone: "+91 44 2741 7000",
      officeHours,
      subjects: ["Academic Consultation", "Research Guidance"],
      status,
      statusNote: `In Room ${roomNumber} (${buildingName})`,
      photo, // can be null to demonstrate "No Image"
      rating: "5.0 ★"
    };

    // Prepend to faculty directory
    newFaculty.isCommunity = true;
    SRM_KTR_DATA.teachers.unshift(newFaculty);

    // Save to localStorage as local backup
    try {
      const existingSaved = JSON.parse(localStorage.getItem('srm_ktr_custom_teachers') || '[]');
      existingSaved.unshift(newFaculty);
      localStorage.setItem('srm_ktr_custom_teachers', JSON.stringify(existingSaved));
    } catch (err) {
      console.warn("Storage save error:", err);
    }

    // Refresh views
    populateDirectionsDropdowns();
    renderMonochromeMap();
    renderTeachersList();

    closeContributionModal();

    // Broadcast to Cloud Firestore in real time
    cloudSync.addFaculty(newFaculty).then(res => {
      if (res.success) {
        showToast(`🌐 Live Synced! ${name} is now visible to all students across campus.`);
      } else {
        showToast(`Saved locally! Connect Cloud Sync in top menu to broadcast to all students.`);
      }
    });

    // Switch to staff view and open the newly added faculty card
    switchMode('staff');
    showTeacherPlaceCard(newFaculty);
  });

  // Add Custom Destination Form Submission
  elements.formAddDestination.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('input-dest-name').value.trim();
    const category = document.getElementById('select-dest-category').value;
    const buildingRef = document.getElementById('select-dest-bldg').value;
    const floor = parseInt(document.getElementById('input-dest-floor').value, 10) || 0;
    const hours = document.getElementById('input-dest-hours').value.trim() || '8:00 AM - 8:00 PM';
    const desc = document.getElementById('input-dest-desc').value.trim();

    const targetBldg = SRM_KTR_DATA.buildings.find(b => b.id === buildingRef);
    const destX = targetBldg ? targetBldg.x + targetBldg.width / 2 : 460;
    const destY = targetBldg ? targetBldg.y + targetBldg.height / 2 : 270;

    const newDest = {
      id: `surr-custom-${Date.now()}`,
      name,
      category,
      buildingRef: buildingRef !== 'open-quad' ? buildingRef : null,
      x: destX,
      y: destY,
      icon: "fa-solid fa-location-dot",
      desc: `${desc} • Floor ${floor} (${targetBldg ? targetBldg.shortName : 'Campus Quad'})`,
      hours,
      popular: "Student Recommended Spot"
    };

    SRM_KTR_DATA.surroundings.unshift(newDest);

    // Save to localStorage
    try {
      const existingSaved = JSON.parse(localStorage.getItem('srm_ktr_custom_destinations') || '[]');
      existingSaved.unshift(newDest);
      localStorage.setItem('srm_ktr_custom_destinations', JSON.stringify(existingSaved));
    } catch (err) {
      console.warn("Storage save error:", err);
    }

    // Refresh UI
    populateDirectionsDropdowns();
    renderSurroundingsList();

    closeContributionModal();
    showToast(`Added "${name}" destination! Calculating directions...`);

    // Broadcast to cloud
    cloudSync.addDestination(newDest).then(res => {
      if (res.success) {
        showToast(`🌐 Live Synced "${name}" to all students!`);
      }
    });

    // Switch to directions and calculate route to this spot
    switchMode('directions');
    elements.routeEndSelect.value = `surr-${newDest.id}`;
    calculateAndDrawRoute();
  });
}

function openContributionModal(tab = 'faculty') {
  elements.modalAdd.style.display = 'flex';
  state.customPhotoDataUrl = null;
  if (elements.photoPreviewBox) elements.photoPreviewBox.style.display = 'none';
  elements.formAddFaculty.reset();
  elements.formAddDestination.reset();

  if (tab === 'faculty') {
    elements.tabAddFaculty.click();
  } else {
    elements.tabAddDestination.click();
  }
}

function closeContributionModal() {
  elements.modalAdd.style.display = 'none';
}

// -----------------------------------------------------------------------------
// CLOUD SYNCHRONIZATION SETUP (Firebase Firestore)
// -----------------------------------------------------------------------------
function setupCloudSync() {
  if (!elements.btnCloudStatus || !elements.modalCloudSync) return;

  // Open modal on click
  elements.btnCloudStatus.addEventListener('click', () => {
    openCloudSyncModal();
  });

  if (elements.btnCloseCloudModal) {
    elements.btnCloseCloudModal.addEventListener('click', () => {
      elements.modalCloudSync.style.display = 'none';
    });
  }

  // Pre-fill textarea if config exists
  const activeCfg = cloudSync.getActiveConfig();
  if (activeCfg && elements.inputFirebaseConfig) {
    elements.inputFirebaseConfig.value = JSON.stringify(activeCfg, null, 2);
  }

  // Save config button
  if (elements.btnSaveCloudConfig) {
    elements.btnSaveCloudConfig.addEventListener('click', async () => {
      const val = elements.inputFirebaseConfig.value.trim();
      if (!val) {
        showToast("Please paste your Firebase configuration first.");
        return;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(val);
      } catch (err) {
        try {
          const cleaned = val.replace(/(const|let|var)\s+\w+\s*=\s*/, '').replace(/;$/, '');
          parsed = Function(`"use strict"; return (${cleaned})`)();
        } catch (e2) {
          showToast("Invalid JSON or object format. Please check syntax.");
          return;
        }
      }

      if (!parsed || !parsed.projectId || !parsed.apiKey) {
        showToast("Config must include at least 'projectId' and 'apiKey'.");
        return;
      }

      elements.btnSaveCloudConfig.disabled = true;
      elements.btnSaveCloudConfig.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

      const ok = await cloudSync.saveConfig(parsed);
      elements.btnSaveCloudConfig.disabled = false;
      elements.btnSaveCloudConfig.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save & Connect Cloud';

      if (ok) {
        showToast("🎉 Firebase Connected! Real-time cloud sync active across all devices.");
        elements.modalCloudSync.style.display = 'none';
      } else {
        showToast("Could not connect to Firebase. Check API keys and network.");
      }
    });
  }

  // Disconnect button
  if (elements.btnDisconnectCloud) {
    elements.btnDisconnectCloud.addEventListener('click', () => {
      cloudSync.disconnect();
      if (elements.inputFirebaseConfig) elements.inputFirebaseConfig.value = '';
      showToast("Disconnected. Running in local browser mode.");
    });
  }

  // Listen for Cloud Status changes
  cloudSync.onStatusChange((status, message) => {
    updateCloudStatusUI(status, message);
  });

  // Listen for Real-Time Faculty Updates from Cloud
  cloudSync.onFacultyUpdate((communityFaculty, isInitialLoad, newArrival) => {
    if (!communityFaculty || communityFaculty.length === 0) return;

    // Merge community faculty into SRM_KTR_DATA.teachers (community on top, non-community preserved)
    const nonCommunity = SRM_KTR_DATA.teachers.filter(t => !t.isCommunity);
    SRM_KTR_DATA.teachers = [...communityFaculty, ...nonCommunity];

    populateDirectionsDropdowns();
    renderMonochromeMap();
    renderTeachersList();

    if (newArrival && !isInitialLoad) {
      showToast(`⚡ New faculty added by classmate: Dr. ${newArrival.name} (${newArrival.roomNumber || 'Room'})`);
    }
  });

  // Listen for Real-Time Destination Updates
  cloudSync.onDestinationUpdate((communityDests) => {
    if (!communityDests || communityDests.length === 0) return;

    const nonCommunity = SRM_KTR_DATA.surroundings.filter(d => !d.isCommunity);
    SRM_KTR_DATA.surroundings = [...communityDests, ...nonCommunity];

    populateDirectionsDropdowns();
    renderSurroundingsList();
  });

  // Kickoff cloud initialization
  cloudSync.init();
}

function openCloudSyncModal() {
  if (!elements.modalCloudSync) return;
  elements.modalCloudSync.style.display = 'flex';
  const activeCfg = cloudSync.getActiveConfig();
  if (activeCfg && elements.inputFirebaseConfig && !elements.inputFirebaseConfig.value) {
    elements.inputFirebaseConfig.value = JSON.stringify(activeCfg, null, 2);
  }
}

function updateCloudStatusUI(status, message) {
  if (!elements.cloudStatusDot || !elements.cloudStatusText) return;

  elements.cloudStatusDot.className = 'cloud-status-dot';
  if (elements.cloudBannerDot) elements.cloudBannerDot.className = 'cloud-status-dot';

  if (status === 'connected') {
    elements.cloudStatusDot.classList.add('dot-green');
    elements.cloudStatusText.textContent = 'Live Sync (Active)';
    if (elements.cloudBannerDot) elements.cloudBannerDot.classList.add('dot-green');
    if (elements.cloudBannerTitle) elements.cloudBannerTitle.textContent = 'Connected (Real-Time Cloud)';
    if (elements.cloudBannerDesc) elements.cloudBannerDesc.textContent = message || 'All faculty additions sync live across all student devices!';
  } else if (status === 'connecting') {
    elements.cloudStatusDot.classList.add('dot-yellow');
    elements.cloudStatusText.textContent = 'Connecting...';
    if (elements.cloudBannerDot) elements.cloudBannerDot.classList.add('dot-yellow');
    if (elements.cloudBannerTitle) elements.cloudBannerTitle.textContent = 'Connecting to Firebase...';
    if (elements.cloudBannerDesc) elements.cloudBannerDesc.textContent = 'Contacting cloud database...';
  } else if (status === 'error') {
    elements.cloudStatusDot.classList.add('dot-red');
    elements.cloudStatusText.textContent = 'Cloud Error';
    if (elements.cloudBannerDot) elements.cloudBannerDot.classList.add('dot-red');
    if (elements.cloudBannerTitle) elements.cloudBannerTitle.textContent = 'Connection Issue';
    if (elements.cloudBannerDesc) elements.cloudBannerDesc.textContent = message || 'Check Firebase credentials or rules.';
  } else {
    // needs-config / local
    elements.cloudStatusDot.classList.add('dot-yellow');
    elements.cloudStatusText.textContent = 'Cloud Sync';
    if (elements.cloudBannerDot) elements.cloudBannerDot.classList.add('dot-yellow');
    if (elements.cloudBannerTitle) elements.cloudBannerTitle.textContent = 'Local Browser Mode';
    if (elements.cloudBannerDesc) elements.cloudBannerDesc.textContent = 'Submissions currently stay on this device. Connect Firebase below for instant campus sync.';
  }
}

// Kickoff
window.addEventListener('DOMContentLoaded', initApp);
