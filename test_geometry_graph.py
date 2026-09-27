# Test script to verify the new campus geometry and build Dijkstra graph
# We will define the nodes and buildings, then test reachability

buildings = {
    'bldg-ub': {'name': 'University Building (UB)', 'x': 270, 'y': 320, 'w': 110, 'h': 90},
    'bldg-lib': {'name': 'SRM Central Library', 'x': 390, 'y': 320, 'w': 90, 'h': 75},
    'bldg-bel': {'name': 'Basic Engineering Lab (BEL)', 'x': 390, 'y': 220, 'w': 100, 'h': 65},
    'bldg-mba': {'name': 'School of Management (MBA)', 'x': 500, 'y': 220, 'w': 85, 'h': 60},
    'bldg-bio': {'name': 'School of Bio-Engineering', 'x': 490, 'y': 130, 'w': 90, 'h': 60},
    'bldg-cvr': {'name': 'Sir C.V. Raman Block', 'x': 390, 'y': 130, 'w': 90, 'h': 60},
    'bldg-tp': {'name': 'Tech Park (TP)', 'x': 620, 'y': 170, 'w': 120, 'h': 100},
    'bldg-tpg': {'name': 'Dr. T.P. Ganesan Auditorium', 'x': 760, 'y': 170, 'w': 130, 'h': 95},
    'bldg-main': {'name': 'Main Academic Block (CRC)', 'x': 120, 'y': 530, 'w': 110, 'h': 65},
    'bldg-mech': {'name': 'Mechanical Engineering Block', 'x': 140, 'y': 450, 'w': 120, 'h': 65},
    'bldg-hitech': {'name': 'Hi-Tech Block', 'x': 60, 'y': 450, 'w': 65, 'h': 60},
    'bldg-electrical': {'name': 'Electrical Sciences Block', 'x': 110, 'y': 610, 'w': 100, 'h': 50},
    'bldg-hostels-mens': {'name': "Men's Hostels (Paari/Kaari/Oori)", 'x': 440, 'y': 480, 'w': 80, 'h': 170},
    'bldg-hostels-womens': {'name': "Women's Hostels (M-Block/Kalpana Chawla)", 'x': 540, 'y': 490, 'w': 110, 'h': 150},
    'bldg-med': {'name': 'SRM Medical College & Hospital', 'x': 750, 'y': 450, 'w': 180, 'h': 140}
}

nodes = {
    'node-potheri': {'name': 'Potheri Railway Station & Skybridge', 'x': 80, 'y': 560},
    'node-main-arch': {'name': 'SRM Main Arch Gate (GST Road)', 'x': 190, 'y': 420},
    'node-main-bldg-entrance': {'name': 'Main Academic Block Entrance', 'x': 175, 'y': 530},
    'node-mech-block': {'name': 'Mechanical Block & Hangars', 'x': 200, 'y': 450},
    'node-hitech-block': {'name': 'Hi-Tech Block Entrance', 'x': 90, 'y': 450},
    'node-ub-entrance': {'name': 'University Building Main Entrance', 'x': 325, 'y': 415},
    'node-lib-entrance': {'name': 'Central Library Entrance', 'x': 435, 'y': 395},
    'node-central-quad': {'name': 'Central Clock Tower Quad', 'x': 360, 'y': 430},
    'node-chola-statue': {'name': 'Chola Statue Plaza', 'x': 430, 'y': 430},
    'node-bel-entrance': {'name': 'BEL Block Entrance', 'x': 440, 'y': 285},
    'node-mba-entrance': {'name': 'School of Management Entrance', 'x': 540, 'y': 280},
    'node-bio-entrance': {'name': 'Bio-Engineering Block Entrance', 'x': 535, 'y': 190},
    'node-cvr-entrance': {'name': 'Sir C.V. Raman Block Entrance', 'x': 435, 'y': 190},
    'node-java-canteen': {'name': 'Java Canteen & Food Street', 'x': 530, 'y': 350},
    'node-tp-entrance': {'name': 'Tech Park Main Entrance', 'x': 680, 'y': 270},
    'node-tpg-front': {'name': 'Dr. TP Ganesan Auditorium Plaza', 'x': 825, 'y': 265},
    'node-sports-arena': {'name': 'SRM Cricket Oval & Sports Arena', 'x': 700, 'y': 80},
    'node-hostels-mens': {'name': "Men's Hostels Complex Entrance", 'x': 480, 'y': 480},
    'node-hostels-womens': {'name': "Women's Hostels Complex Entrance", 'x': 590, 'y': 490},
    'node-med-entrance': {'name': 'SRM Hospital Casualty & OPD Entrance', 'x': 750, 'y': 450},
    'node-temple': {'name': 'Campus Sai Temple', 'x': 270, 'y': 270}
}

edges = [
    # Main Gate to GST & Skybridge
    ('node-potheri', 'node-main-arch', 180, 'Walk along GST service road towards Main Arch Gate'),
    ('node-potheri', 'node-hitech-block', 120, 'Turn east into Southwest Engineering campus'),
    
    # Southwest cluster
    ('node-hitech-block', 'node-mech-block', 110, 'Pass High-Tech block along workshops avenue'),
    ('node-hitech-block', 'node-main-bldg-entrance', 100, 'Turn south to Main Academic Block CRC'),
    ('node-main-bldg-entrance', 'node-mech-block', 90, 'Walk north along CRC corridor to Mechanical block'),
    ('node-mech-block', 'node-main-arch', 120, 'Head northeast toward Main Gate entrance'),
    
    # Main Gate to UB & Central Spine
    ('node-main-arch', 'node-ub-entrance', 140, 'Enter through Main Arch onto Mahatma Gandhi Road to University Building'),
    ('node-main-arch', 'node-temple', 170, 'Walk north towards Campus Temple'),
    ('node-temple', 'node-ub-entrance', 150, 'Head south towards UB Main Reception'),
    
    # Central Quad & Library
    ('node-ub-entrance', 'node-central-quad', 60, 'Step down from UB portico into Clock Tower lawn'),
    ('node-central-quad', 'node-chola-statue', 70, 'Cross landscaped garden walkway to Chola Statue'),
    ('node-central-quad', 'node-lib-entrance', 80, 'Walk northeast to Central Library main entrance'),
    ('node-ub-entrance', 'node-lib-entrance', 110, 'Walk east along Swami Vivekananda Road to Central Library'),
    ('node-lib-entrance', 'node-bel-entrance', 110, 'Head north towards BEL Workshops'),
    ('node-lib-entrance', 'node-chola-statue', 60, 'Walk south towards Chola statue'),
    ('node-chola-statue', 'node-java-canteen', 110, 'Walk east towards Java Canteen'),
    ('node-java-canteen', 'node-lib-entrance', 100, 'Head northwest towards Central Library'),
    
    # BEL, MBA, Bio, CVR Block (North Spine)
    ('node-bel-entrance', 'node-cvr-entrance', 95, 'Walk north along Sir C.V. Raman Road'),
    ('node-bel-entrance', 'node-mba-entrance', 100, 'Walk east along avenue to School of Management'),
    ('node-cvr-entrance', 'node-bio-entrance', 100, 'Walk east to Bio-Engineering block'),
    ('node-mba-entrance', 'node-bio-entrance', 90, 'Head north towards Bio-Engineering entrance'),
    ('node-mba-entrance', 'node-java-canteen', 70, 'Walk south to Java Food Court'),
    
    # Towards Tech Park & TP Ganesan Auditorium (East Hub)
    ('node-java-canteen', 'node-tp-entrance', 170, 'Walk east along Swami Vivekananda Road past Java towards Tech Park'),
    ('node-mba-entrance', 'node-tp-entrance', 150, 'Walk northeast towards Tech Park Tower'),
    ('node-tp-entrance', 'node-tpg-front', 145, 'Walk east across Vendhar Square to Dr. TP Ganesan Auditorium'),
    ('node-tp-entrance', 'node-sports-arena', 190, 'Walk north towards SRM Cricket Oval'),
    ('node-tpg-front', 'node-sports-arena', 210, 'Walk northwest from Auditorium towards Sports Complex'),
    
    # Hostels & Medical Campus
    ('node-chola-statue', 'node-hostels-mens', 70, 'Walk south into Men\'s Hostels avenue (Paari/Kaari/Oori)'),
    ('node-hostels-mens', 'node-hostels-womens', 110, 'Walk east towards Women\'s Hostels (M-Block)'),
    ('node-java-canteen', 'node-hostels-womens', 150, 'Walk southeast towards Ladies Hostel gate'),
    ('node-hostels-womens', 'node-med-entrance', 160, 'Walk east along connecting road to SRM Medical College & Hospital'),
    ('node-tpg-front', 'node-med-entrance', 200, 'Walk south from Auditorium towards Medical College Hospital')
]

# Dijkstra test
import heapq

def dijkstra(start, end):
    adj = {}
    for u, v, d, desc in edges:
        adj.setdefault(u, []).append((v, d))
        adj.setdefault(v, []).append((u, d))
    
    q = [(0, start, [])]
    visited = set()
    while q:
        dist, curr, path = heapq.heappop(q)
        if curr in visited: continue
        visited.add(curr)
        new_path = path + [curr]
        if curr == end:
            return dist, new_path
        for nxt, weight in adj.get(curr, []):
            if nxt not in visited:
                heapq.heappush(q, (dist + weight, nxt, new_path))
    return float('inf'), []

all_nodes = list(nodes.keys())
disconnected = 0
for i in range(len(all_nodes)):
    for j in range(i+1, len(all_nodes)):
        d, p = dijkstra(all_nodes[i], all_nodes[j])
        if d == float('inf'):
            print(f"DISCONNECTED: {all_nodes[i]} <-> {all_nodes[j]}")
            disconnected += 1

print(f"Total node pairs tested: {len(all_nodes)*(len(all_nodes)-1)//2}")
print(f"Disconnected pairs: {disconnected}")
