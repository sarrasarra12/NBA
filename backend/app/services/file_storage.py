#service de gestio  des fichiers avec minio

from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile
import uuid

#configuration de minio
MINIO_CLIENT = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False
)
BUCKET_NAME = "claims-files"

#inistialiser le bucket
def init_minio():
    try:
        if not MINIO_CLIENT.bucket_exists(BUCKET_NAME):
            #creé le bucket
            MINIO_CLIENT.make_bucket(BUCKET_NAME)
            print(f"Bucket '{BUCKET_NAME}' créé avec succès.")
        else:
            print(f"Bucket '{BUCKET_NAME}' existe déjà.")
    except S3Error as e:
        print(f"Erreur lors de l'initialisation de MinIO: {e}")
#uploader fichier
def upload_file(file:UploadFile, folder:str)->str:
    try:
        #géner un nom unique 
        file_extension=file.filename.split(".")[-1]
        unique_name=f"{folder}/{uuid.uuid4()}.{file_extension}"
        #uploader sur minio
        MINIO_CLIENT.put_object(
            bucket_name=BUCKET_NAME,
            object_name=unique_name,
            data=file.file,
            length=file.size,
            content_type=file.content_type
        )
        #construire l'url 
        url=f"http://localhost:9000/{BUCKET_NAME}/{unique_name}"
        return url
    except S3Error as e:
        print(f"Erreur lors de l'upload du fichier: {e}")
        raise Exception("Erreur lors de l'upload du fichier")