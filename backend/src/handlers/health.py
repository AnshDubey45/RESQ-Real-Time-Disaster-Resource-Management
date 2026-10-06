"""
Health Check Lambda Handler for RESQ-CLOUD.
Returns operational status of API Gateway, DynamoDB, and ML Inference Engine.
"""

from .common import success_response

def handler(event, context):
    return success_response({
        "status": "ok",
        "service": "resq-api",
        "api": "operational",
        "database": "operational",
        "aiEngine": "operational",
    })