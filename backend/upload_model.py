"""
S3 Model Uploader for RESQ-CLOUD.
Uploads model.joblib and model_meta.json to the deployed S3 bucket using boto3 or AWS CLI.
"""

import os
import sys
import boto3

REGION = os.environ.get("AWS_REGION", "ap-south-1")

def find_model_bucket():
    """Look up the deployed ModelBucket name from the CloudFormation stack."""
    cf = boto3.client("cloudformation", region_name=REGION)
    try:
        response = cf.describe_stacks(StackName="resq-cloud-backend")
        outputs = response["Stacks"][0].get("Outputs", [])
        for out in outputs:
            if out["OutputKey"] == "ModelBucketName":
                return out["OutputValue"]
    except Exception as e:
        print(f"Could not auto-detect bucket from CloudFormation: {e}")
    return None

def upload_models(bucket_name=None):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "src", "ml", "model.joblib")
    meta_path = os.path.join(base_dir, "src", "ml", "model_meta.json")

    if not os.path.exists(model_path) or not os.path.exists(meta_path):
        print("[!] Error: model.joblib or model_meta.json not found in src/ml/!")
        return False

    if not bucket_name:
        bucket_name = find_model_bucket()

    if not bucket_name:
        print("[!] Could not detect S3 bucket automatically.")
        bucket_name = input("Enter your S3 ModelBucket name (from sam deploy output): ").strip()

    if not bucket_name:
        print("[!] No bucket name provided.")
        return False

    s3 = boto3.client("s3", region_name=REGION)
    print(f"[*] Uploading model artifacts to S3 bucket: {bucket_name}...")
    
    try:
        s3.upload_file(model_path, bucket_name, "model.joblib")
        print("   [+] Uploaded model.joblib successfully")
        s3.upload_file(meta_path, bucket_name, "model_meta.json")
        print("   [+] Uploaded model_meta.json successfully")
        print("[*] Step 6 complete! ML model is now live in S3.")
        return True
    except Exception as e:
        print(f"[!] Upload failed: {e}")
        return False

if __name__ == "__main__":
    b_name = sys.argv[1] if len(sys.argv) > 1 else None
    upload_models(b_name)
