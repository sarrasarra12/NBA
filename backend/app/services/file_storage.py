from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile
import uuid
import os
import json
from dotenv import load_dotenv

load_dotenv()

MINIO_ENDPOINT  = os.getenv("MINIO_ENDPOINT",  "localhost:9000")
MINIO_ACCESS_KEY= os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY= os.getenv("MINIO_SECRET_KEY", "minioadmin")
BUCKET_NAME     = "claims-files"

MINIO_CLIENT = Minio(
    MINIO_ENDPOINT,
    access_key = MINIO_ACCESS_KEY,
    secret_key = MINIO_SECRET_KEY,
    secure     = False
)

# ── Initialiser bucket ─────────────────────────────
def init_minio():
    try:
        # 1. Créer bucket si n'existe pas
        if not MINIO_CLIENT.bucket_exists(BUCKET_NAME):
            MINIO_CLIENT.make_bucket(BUCKET_NAME)
            print(f"✅ Bucket '{BUCKET_NAME}' créé !")
        else:
            print(f"✅ Bucket '{BUCKET_NAME}' existe déjà !")

        # 2. Rendre bucket public
        policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect"   : "Allow",
                "Principal": {"AWS": ["*"]},
                "Action"   : ["s3:GetObject"],
                "Resource" : [f"arn:aws:s3:::{BUCKET_NAME}/*"]
            }]
        }
        MINIO_CLIENT.set_bucket_policy(BUCKET_NAME, json.dumps(policy))
        print(f"✅ Bucket '{BUCKET_NAME}' rendu public !")

    except S3Error as e:
        print(f"❌ Erreur MinIO : {e}")


# ── Upload fichier ─────────────────────────────────
def upload_file(file: UploadFile, folder: str) -> str:
    try:
        extension   = file.filename.split(".")[-1]
        unique_name = f"{folder}/{uuid.uuid4()}.{extension}"

        MINIO_CLIENT.put_object(
            bucket_name  = BUCKET_NAME,
            object_name  = unique_name,
            data         = file.file,
            length       = file.size,
            content_type = file.content_type
        )

        url = f"http://{MINIO_ENDPOINT}/{BUCKET_NAME}/{unique_name}"
        return url

    except S3Error as e:
        print(f"❌ Erreur upload : {e}")
        raise Exception("Erreur lors de l'upload du fichier")


# ── Upload logo ────────────────────────────────────
def upload_logo():
    try:
        logo_path = "app/templates/logo.png"

        if not os.path.exists(logo_path):
            print(f"⚠️ Logo non trouvé : {logo_path}")
            return None

        file_stat = os.stat(logo_path)

        with open(logo_path, "rb") as logo_file:
            MINIO_CLIENT.put_object(
                bucket_name  = BUCKET_NAME,
                object_name  = "assets/logo.png",
                data         = logo_file,
                length       = file_stat.st_size,
                content_type = "image/png"
            )

        logo_url = f"http://{MINIO_ENDPOINT}/{BUCKET_NAME}/assets/logo.png"
        print(f"✅ Logo uploadé : {logo_url}")
        return logo_url

    except S3Error as e:
        print(f"❌ Erreur upload logo : {e}")
        return None
