import os
import shutil

from app.db.database import SessionLocal
from app.models.project import Project
from app.models.dataset import Dataset
from app.models.layer import Layer
from app.models.asset import Asset


def cleanup_gis_data():
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # Show current counts
        # -------------------------------------------------

        project_count = db.query(Project).count()
        dataset_count = db.query(Dataset).count()
        layer_count = db.query(Layer).count()
        asset_count = db.query(Asset).count()

        print("\n==============================================")
        print("CURRENT GIS DATA")
        print("==============================================")
        print(f"Projects : {project_count}")
        print(f"Datasets : {dataset_count}")
        print(f"Layers   : {layer_count}")
        print(f"Assets   : {asset_count}")
        print("==============================================\n")

        if (
            project_count == 0
            and dataset_count == 0
            and layer_count == 0
            and asset_count == 0
        ):
            print("Nothing to delete.")
            return

        # -------------------------------------------------
        # Collect uploaded file paths BEFORE deleting rows
        # -------------------------------------------------

        file_paths = set()

        datasets = db.query(Dataset).all()

        for dataset in datasets:
            if dataset.file_path:
                file_paths.add(dataset.file_path)

        layers = db.query(Layer).all()

        for layer in layers:
            if layer.file_path:
                file_paths.add(layer.file_path)

        # -------------------------------------------------
        # Confirm deletion
        # -------------------------------------------------

        print("The following data will be deleted:")
        print(f"  Projects : {project_count}")
        print(f"  Datasets : {dataset_count}")
        print(f"  Layers   : {layer_count}")
        print(f"  Assets   : {asset_count}")

        print("\nUploaded files associated with these datasets/layers")
        print("will also be removed from disk.")

        confirmation = input(
            "\nType DELETE to continue: "
        ).strip()

        if confirmation != "DELETE":
            print("\nCleanup cancelled.")
            return

        # -------------------------------------------------
        # Delete Assets first
        # -------------------------------------------------

        print("\nDeleting assets...")

        deleted_assets = db.query(Asset).delete(
            synchronize_session=False
        )

        print(f"Deleted assets: {deleted_assets}")

        # -------------------------------------------------
        # Delete Layers
        # -------------------------------------------------

        print("Deleting layers...")

        deleted_layers = db.query(Layer).delete(
            synchronize_session=False
        )

        print(f"Deleted layers: {deleted_layers}")

        # -------------------------------------------------
        # Delete Datasets
        # -------------------------------------------------

        print("Deleting datasets...")

        deleted_datasets = db.query(Dataset).delete(
            synchronize_session=False
        )

        print(f"Deleted datasets: {deleted_datasets}")

        # -------------------------------------------------
        # Delete Projects
        # -------------------------------------------------

        print("Deleting projects...")

        deleted_projects = db.query(Project).delete(
            synchronize_session=False
        )

        print(f"Deleted projects: {deleted_projects}")

        # -------------------------------------------------
        # Commit database changes
        # -------------------------------------------------

        db.commit()

        print("\nDatabase cleanup completed.")

        # -------------------------------------------------
        # Remove uploaded files
        # -------------------------------------------------

        print("\nCleaning uploaded files...")

        deleted_files = 0

        for file_path in file_paths:

            if not file_path:
                continue

            # Remove the actual file
            if os.path.isfile(file_path):

                try:
                    os.remove(file_path)

                    print(f"Removed file: {file_path}")

                    deleted_files += 1

                except Exception as e:

                    print(
                        f"Could not remove file: "
                        f"{file_path}"
                    )

                    print(f"Reason: {e}")

            # Remove extracted ZIP folder
            #
            # Example:
            #
            # uploads/Ayush.zip
            # uploads/Ayush/
            #
            base_path = os.path.splitext(file_path)[0]

            if os.path.isdir(base_path):

                try:

                    shutil.rmtree(base_path)

                    print(
                        f"Removed folder: {base_path}"
                    )

                except Exception as e:

                    print(
                        f"Could not remove folder: "
                        f"{base_path}"
                    )

                    print(f"Reason: {e}")

        # -------------------------------------------------
        # Final verification
        # -------------------------------------------------

        remaining_projects = db.query(Project).count()
        remaining_datasets = db.query(Dataset).count()
        remaining_layers = db.query(Layer).count()
        remaining_assets = db.query(Asset).count()

        print("\n==============================================")
        print("CLEANUP COMPLETE")
        print("==============================================")

        print(
            f"Projects remaining : {remaining_projects}"
        )

        print(
            f"Datasets remaining : {remaining_datasets}"
        )

        print(
            f"Layers remaining   : {remaining_layers}"
        )

        print(
            f"Assets remaining   : {remaining_assets}"
        )

        print(
            f"Files removed      : {deleted_files}"
        )

        print("==============================================\n")

    except Exception as e:

        db.rollback()

        print("\n==============================================")
        print("CLEANUP FAILED")
        print("==============================================")
        print(e)
        print("==============================================\n")

        raise

    finally:
        db.close()


if __name__ == "__main__":
    cleanup_gis_data()