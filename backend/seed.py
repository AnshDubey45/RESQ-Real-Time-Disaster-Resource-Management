"""
DynamoDB Seeder Script for RESQ-CLOUD.
Seeds disasters, affected areas, warehouses, inventory, and requests into DynamoDB tables.
Can be run against local or real AWS environment.
"""

import os
import sys
from datetime import datetime
from src.db import (
    put_disaster, put_area, put_warehouse, put_request, put_allocation,
    log_audit, add_timeline_event,
    _FALLBACK_DISASTERS, _FALLBACK_AREAS, _FALLBACK_WAREHOUSES,
    _FALLBACK_REQUESTS, _FALLBACK_ALLOCATIONS, _FALLBACK_TIMELINE
)

def run_seed():
    print("[*] Starting RESQ-CLOUD DynamoDB Data Seeding...")
    
    # 1. Seed Disasters
    disasters_to_seed = list(_FALLBACK_DISASTERS)
    print(f"-> Seeding {len(disasters_to_seed)} Disasters...")
    for d in disasters_to_seed:
        put_disaster(d)
        print(f"   [+] Disaster: {d['name']} ({d['id']})")

    # 2. Seed Areas
    areas_to_seed = list(_FALLBACK_AREAS)
    print(f"-> Seeding {len(areas_to_seed)} Affected Areas...")
    for a in areas_to_seed:
        put_area(a)
        print(f"   [+] Area: {a['name']} ({a['id']})")

    # 3. Seed Warehouses
    warehouses_to_seed = list(_FALLBACK_WAREHOUSES)
    print(f"-> Seeding {len(warehouses_to_seed)} Warehouses...")
    for w in warehouses_to_seed:
        put_warehouse(w)
        print(f"   [+] Warehouse: {w['name']} ({w['id']})")

    # 3. Seed Requests
    requests_to_seed = list(_FALLBACK_REQUESTS)
    print(f"-> Seeding {len(requests_to_seed)} Resource Requests...")
    for r in requests_to_seed:
        put_request(r)
        print(f"   [+] Request: {r['id']} ({r['resourceType']} for {r['areaName']})")

    # 4. Seed Allocations
    allocations_to_seed = list(_FALLBACK_ALLOCATIONS)
    print(f"-> Seeding {len(allocations_to_seed)} Initial Allocations...")
    for alc in allocations_to_seed:
        put_allocation(alc)
        print(f"   [+] Allocation: {alc['id']} ({alc['resourceType']} -> {alc['destinationArea']})")

    # 5. Seed Timeline
    timeline_to_seed = list(_FALLBACK_TIMELINE)
    print(f"-> Seeding {len(timeline_to_seed)} Timeline Events...")
    for ev in timeline_to_seed:
        add_timeline_event(ev)
        print(f"   [+] Event: {ev['title']}")

    # 6. Seed Audit Log
    log_audit(
        user="SYSTEM",
        user_role="System",
        action="DATABASE_SEEDED",
        object_type="System",
        object_id="INIT",
        result="success",
        details="Initial synthetic disaster operations seed completed.",
    )

    print("[+] Seeding completed successfully!")

if __name__ == "__main__":
    run_seed()
