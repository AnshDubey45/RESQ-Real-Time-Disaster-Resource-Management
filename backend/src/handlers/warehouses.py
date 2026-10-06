"""
Warehouses & Inventory Lambda Handler for RESQ-CLOUD.
Manages depot operational states, route blockages, and stock levels.
"""

from .common import success_response, error_response, parse_body, get_path_param
from .. import db
from ..engines.reallocation import trigger_reallocation

def handler(event, context):
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")
    raw_path = event.get("rawPath") or event.get("path", "")
    
    # Handle /inventory endpoint
    if "/inventory" in raw_path:
        warehouses = db.get_warehouses()
        inventory_items = []
        for wh in warehouses:
            for r in wh.get("resources", []):
                total = r.get("available", 0) + r.get("reserved", 0)
                coverage = round((r.get("available", 0) / total * 100), 1) if total > 0 else 0
                inventory_items.append({
                    "warehouseId": wh["id"],
                    "warehouseName": wh["name"],
                    "resourceType": r.get("resourceType"),
                    "available": r.get("available", 0),
                    "reserved": r.get("reserved", 0),
                    "total": total,
                    "unit": r.get("unit", "units"),
                    "coverage": coverage,
                    "stockStatus": r.get("stockStatus", "healthy"),
                })
        return success_response(inventory_items)

    wh_id = get_path_param(event, "id") or (raw_path.split("/")[-1] if len(raw_path.split("/")) > 2 and raw_path.split("/")[-1] != "warehouses" else None)

    if wh_id:
        wh = db.get_warehouse(wh_id)
        if not wh:
            return error_response(f"Warehouse {wh_id} not found", 404)

        if http_method == "GET":
            return success_response(wh)
        elif http_method in ["PATCH", "PUT"]:
            updates = parse_body(event)
            updated = db.update_warehouse(wh_id, updates)
            db.log_audit("Warehouse Manager", "Warehouse Manager", "WAREHOUSE_UPDATED", "Warehouse", wh_id, "warning", f"Updated {wh.get('name')} status to {updates}")

            # If warehouse blocked or degraded, trigger reallocation!
            status_changed = "operationalStatus" in updates or "routeStatus" in updates
            if status_changed:
                all_areas = db.get_areas()
                all_warehouses = db.get_warehouses()
                all_requests = db.get_requests()
                all_allocations = db.get_allocations()

                realloc_res = trigger_reallocation(
                    trigger_type="warehouse_blocked",
                    details=f"Warehouse {wh.get('name')} status changed: {updates}",
                    areas=all_areas,
                    warehouses=all_warehouses,
                    existing_requests=all_requests,
                    existing_allocations=all_allocations,
                )
                db.add_timeline_event(realloc_res["timeline_event"])
                return success_response({
                    "warehouse": updated,
                    "reallocation": realloc_res,
                })

            return success_response(updated)

    if http_method == "GET":
        warehouses = db.get_warehouses()
        return success_response(warehouses)

    return error_response("Method not allowed", 405)
