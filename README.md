# 🧭 SRM IST KTR - Monochrome Google Maps Campus Navigator & Staff Locator

A high-contrast, minimalist **Monochrome Google Maps** style web application designed specifically for **SRM Institute of Science and Technology (SRM IST), Kattankulathur (KTR) Main Campus**, Chennai.

Grounded directly in the official **[SRM 360 Virtual Tour](https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm)** and the **[SRMIST Faculty Directory](https://www.srmist.edu.in/faculty)** / **[Staff Finder](https://www.srmist.edu.in/staff-finder/)**.

Built for students, faculty, and visitors to locate teacher staff rooms, find the exact building and floor level, explore campus landmarks, and get turn-by-turn indoor and outdoor navigation.

---

## 🖤 Design & User Interface

- **Monochrome Google Maps Theme**: Fullscreen interactive map canvas with dark charcoal (`#09090b`), silver architectural linework, stark white (`#ffffff`) markers, and animated glowing dashed route paths.
- **Top-Left Floating Google Maps Search Hub**: Features quick global search and four primary category pills:
  1. **👨‍🏫 Staff Rooms**: Search teachers by name, department, room, cabin, subjects taught, or floor level. View verified badges, office hours, and consultation availability.
  2. **🧭 Directions**: Turn-by-turn Dijkstra shortest-path wayfinding with walking distance in meters, estimated walk time in minutes, floor elevation steps (elevators/stairs), and Web Speech voice navigation.
  3. **🏛️ Campus Surroundings**: Landmark directory covering food courts, ATMs, libraries, transit hubs, sports complex, and spiritual centers.
  4. **🚌 Shuttle & Buses**: Real-time campus electric buggy schedules and city commuter college bus timings. Features:
     - **⚡ Live Next Shuttle Countdown**: Dynamic real-time countdown to the next campus buggy (e.g. `~4 mins • 04:15 PM`).
     - **🔄 Campus Shuttles (Free)**: Covers the **Campus Ring Line (SH-01)**, **Hostel <-> Tech Park Express (SH-02)**, and **Medical Hospital Connector (SH-03)**.
     - **🚌 City College Bus Fleet**: Detailed route directory for Routes 1A to 8 connecting KTR Bus Bay to Tambaram, Guindy, Koyambedu (CMBT), Velachery, Anna Nagar, Central, Chengalpattu, and Avadi with bus numbers, bays, and departure shifts (4:30 PM, 5:15 PM, 6:15 PM, 7:30 PM).
     - **🚏 7 Campus Stops**: Interactive pins on the map for Main Arch Bay, UB/Clock Tower, Library, Tech Park Bay, Auditorium, Hostels Depot, and Hospital.
     - **🗺️ Animated Map Route**: 1-click toggle that renders the glowing circular loop with an animated moving shuttle bus on the map!
     - **🧭 1-Click Directions**: Instant turn-by-turn walking navigation to any shuttle stop or bus bay.
- **Google Maps Left Place Sheet**: Slides open on teacher or landmark selection, featuring high-resolution faculty portraits (or clean **"No Image"** badge when unavailable), verified badges, rating, office hours, and instant 1-click **Directions**.
- **Floating Controls**: Bottom-right zoom buttons (`+` / `-`), reset north compass (`🧭`), and my location centering (`🎯`).
- **Floor Switcher Dock**: Quick access to multi-story high-rise levels (Floors Ground through 15th Floor for Tech Park and University Building).
- **Student Contribution System (`+ Add Faculty / Spot`)**: Allows students to add any missing faculty or custom campus destination with photo upload, room number, cabin notes, and office hours.
- **🌐 Real-Time Cloud Synchronization (`Cloud Sync`)**:
  - Powered by **Google Firebase Firestore** with zero-server client architecture.
  - When Student A submits a new faculty member or room change, it broadcasts instantly across the internet to every other student's phone and laptop in real-time.
  - Features real-time `onSnapshot` listeners, offline fallback caching, in-app Firebase credentials setup, and visual **Live Cloud** status badges on student-contributed cards.

---

## 🏛️ SRM IST Kattankulathur Campus Layout & Virtual Tour Road Network

Accurately modeled on SRM IST KTR geometry and named avenues from the **SRM 360 Virtual Tour**:
- **Mahatma Gandhi Road**: Central arterial avenue passing Main Arch Gate, Campus Temple, Chola's Statue, Clock Tower, Java Canteen, and Gazebo.
- **Swami Vivekananda Road**: Eastern avenue connecting TP Ganesan Auditorium, UB, Central Library, and University Main Entry.
- **Sir C.V. Raman Road**: Western avenue past Tech Park, BEL Block, and Sir C.V. Raman Research Park.
- **Mahakavi Bharathiyar Road**: Cross avenue connecting School of Bio-Engineering, TP Ganesan, Law, and Architecture.
- **Hostel Road**: Northern avenue leading to student residential blocks (Paari, Kaari, Oori, Adhiyaman, etc.).
- **GST Road (NH 45)**: South arterial highway connecting campus to Chennai and suburban rail.
- **Chola's Statue**: Landmark monument situated in the center of the iconic X-cross landscaped walkways in front of TP Ganesan Auditorium.
- **Tech Park (TP)**: 15-story computing skyscraper housing CTECH, CINTEL, NWC, DSBS, Turing Hall (8F), and Ramanujan Hall (1F).
- **University Building (UB)**: 15-story administrative high-rise housing Chancellor, VC, Registrar, Mechanical Eng, Civil Eng, and ECE.
- **Dr. T. P. Ganesan Auditorium**: 3,000-capacity grand convention facility.
- **Potheri Railway Station & Skybridge**: Direct suburban train connection to Tambaram and Chennai Beach.

---

## 👨‍🏫 Verified SRM IST KTR Faculty Directory (40+ Members)

Imported directly from the SRM Faculty Directory across 10 departments:
- **Executive Leadership**: Dr. C. Muthamizhchelvan (VC), Dr. S. Ponnusamy (Registrar), Dr. T. V. Gopal (Dean Academics)
- **School of Computing & CTECH**: Dr. Revathi Venkataraman (Chairperson), Dr. Niranjana G. (HOD), Dr. B. Amutha, Dr. C. Malathy, Dr. E. Poovammal
- **Computational Intelligence (CINTEL)**: Dr. M. Murali (HOD), Dr. R. Annie Uthra, Dr. D. Malathi
- **Networking & Communications (NWC)**: Dr. Annapurani Panaiyappan (HOD), Dr. Kayalvizhi S., Dr. B. Baranidharan
- **Data Science & Business Systems (DSBS)**: Dr. S. Prabakaran, Dr. G. Vadivu, Dr. M. Balamurugan
- **Mechanical Engineering**: Dr. D. Kingsly Jeba Singh (Dean), Dr. M. Cheralathan (HOD), Dr. Shubhabrata Datta
- **Electronics & Communication (ECE)**: Dr. Shanthi Prince (HOD), Dr. P. Aruna Priya, Dr. B. Ramachandran
- **Electrical & Electronics (EEE)**: Dr. K. Vijayakumar (HOD), Dr. C. Subramani
- **Civil Engineering**: Dr. K. S. Satyanarayanan (HOD), Dr. P. T. Ravichandran
- **Bioengineering**: Dr. M. Vairamani (Dean), Dr. S. Meenakshisundaram

*Clean "No Image" Fallback: For faculty whose images are not on the directory, a clean monochrome "No Image" placeholder is displayed with zero broken image icons.*

---

## 🌐 Live Website & Deployment

The application is deployed live on **GitHub Pages**:
👉 **[https://abelbjohn.github.io/University-Navigator/](https://abelbjohn.github.io/University-Navigator/)**

### Local Development:
```bash
python -m http.server 8080
# Open http://localhost:8080/ in your browser
```

---

## ☁️ How to Enable Cloud Synchronization Across All Students

1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a free project (e.g. `srm-navigator`).
2. Click **Build > Firestore Database** > **Create database** (choose *Start in Test mode*).
3. In **Project settings > General**, register a web app (`</>`) to get your `firebaseConfig` object.
4. Click the **Cloud Sync** button in the web app navigation bar, paste your config, and click **Save & Connect Cloud**!
   *(Or paste it directly into `firebase-config.js` and push to GitHub).*
