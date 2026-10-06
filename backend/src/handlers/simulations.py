"""
What-If Simulator Lambda Handler for RESQ-CLOUD.
Executes scenario strain modeling in memory without altering live operational data.
"""

from .common import success_response, error_response, parse_body
from .. import db
from ..engines.simulation import run_simulation

def handler(event, context):
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")

    if http_method == "POST":
        input_data = parse_body(event)
        if not input_data:
            return error_response("Simulation parameters required", 400)

        result = run_simulation(simulation_input=input_data)
        
        # Save run record
        saved_run = db.save_simulation({
            "input": input_data,
            "result": result,
        })

        db.log_audit(
            user="Administrator",
            user_role="Administrator",
            action="SIMULATION_EXECUTED",
            object_type="Simulation",
            object_id=saved_run["id"],
            result="info",
            details=f"Ran {input_data.get('disasterType', 'flood')} simulation: pop={input_data.get('population')}, sev={input_data.get('severity')}",
        )

        return success_response(result, 201)

    elif http_method == "GET":
        # In a full app, return past simulation runs
        return success_response({
            "status": "ready",
            "mode": "in-memory-simulation",
            "activeSimulations": 0,
        })

    return error_response("Method not allowed", 405)
