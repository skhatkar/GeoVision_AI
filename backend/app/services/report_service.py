import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.models.project import Project
from app.models.dataset import Dataset
from app.models.report import Report


def generate_project_pdf_report(
    db: Session,
    project_id: int,
    report_type: str = "summary",
    output_dir: str = "reports_output",
) -> Report:
    """
    Generate a branded executive PDF project report using ReportLab
    and persist the Report metadata record in PostgreSQL.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"project_{project_id}_report_{timestamp_str}.pdf"
    file_path = os.path.join(output_dir, filename)

    # Query datasets and count statistics
    datasets = db.query(Dataset).filter(Dataset.project_id == project_id).all()
    total_datasets = len(datasets)
    total_layers = sum(len(d.layers) for d in datasets)
    total_features = sum(d.feature_count or 0 for d in datasets)

    # Build ReportLab Document
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()

    # Custom Color Palette
    primary_color = colors.HexColor("#0284c7")  # Sky 600
    dark_text = colors.HexColor("#0f172a")  # Slate 900
    muted_text = colors.HexColor("#64748b")  # Slate 500
    table_header_bg = colors.HexColor("#0f172a")

    # Custom Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=muted_text,
    )

    section_style = ParagraphStyle(
        "DocSection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=dark_text,
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=dark_text,
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("GeoVision AI — Executive Spatial Report", title_style))
    elements.append(
        Paragraph(
            f"Generated on {datetime.now(timezone.utc).strftime('%B %d, %Y at %H:%M UTC')} | Spatial Engine",
            subtitle_style,
        )
    )
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=12))

    # 2. Project Summary Table
    elements.append(Paragraph("1. Project Executive Overview", section_style))

    owner_name = project.owner.full_name or project.owner.username if project.owner else "N/A"
    summary_data = [
        [Paragraph("<b>Project Name:</b>", body_style), Paragraph(project.name, body_style)],
        [Paragraph("<b>Project ID:</b>", body_style), Paragraph(str(project.id), body_style)],
        [Paragraph("<b>Owner / Department:</b>", body_style), Paragraph(owner_name, body_style)],
        [Paragraph("<b>Status:</b>", body_style), Paragraph(project.status or "Active", body_style)],
        [Paragraph("<b>Description:</b>", body_style), Paragraph(project.description or "No description provided.", body_style)],
    ]

    summary_table = Table(summary_data, colWidths=[130, 410])
    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ])
    )
    elements.append(summary_table)
    elements.append(Spacer(1, 14))

    # 3. Spatial Inventory Key Metrics
    elements.append(Paragraph("2. Spatial Inventory Key Metrics", section_style))

    kpi_data = [
        [
            Paragraph("<b>Total Datasets</b>", body_style),
            Paragraph("<b>Total Vector Layers</b>", body_style),
            Paragraph("<b>Total Feature Records</b>", body_style),
        ],
        [
            Paragraph(f"<font size=14 color='#0284c7'><b>{total_datasets}</b></font>", body_style),
            Paragraph(f"<font size=14 color='#10b981'><b>{total_layers}</b></font>", body_style),
            Paragraph(f"<font size=14 color='#8b5cf6'><b>{total_features:,}</b></font>", body_style),
        ],
    ]
    kpi_table = Table(kpi_data, colWidths=[180, 180, 180])
    kpi_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ])
    )
    elements.append(kpi_table)
    elements.append(Spacer(1, 14))

    # 4. Datasets & GIS Layers Breakdown
    elements.append(Paragraph("3. Datasets & Spatial Layers Breakdown", section_style))

    if datasets:
        dataset_table_data = [
            [
                Paragraph("<font color='white'><b>Dataset Name</b></font>", body_style),
                Paragraph("<font color='white'><b>Format</b></font>", body_style),
                Paragraph("<font color='white'><b>CRS</b></font>", body_style),
                Paragraph("<font color='white'><b>Features</b></font>", body_style),
                Paragraph("<font color='white'><b>Layers</b></font>", body_style),
            ]
        ]

        for ds in datasets:
            dataset_table_data.append([
                Paragraph(ds.name, body_style),
                Paragraph(ds.file_type.upper(), body_style),
                Paragraph(ds.crs or "EPSG:4326", body_style),
                Paragraph(f"{ds.feature_count:,}", body_style),
                Paragraph(str(len(ds.layers)), body_style),
            ])

        dataset_table = Table(dataset_table_data, colWidths=[160, 70, 110, 100, 100])
        dataset_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), table_header_bg),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ])
        )
        elements.append(dataset_table)
    else:
        elements.append(Paragraph("<i>No spatial datasets associated with this project.</i>", body_style))

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=10, spaceAfter=8))
    elements.append(
        Paragraph(
            "GeoVision AI Spatial Intelligence Command Center | Official State GIS Analysis Document",
            ParagraphStyle("Footer", parent=subtitle_style, alignment=1),
        )
    )

    # Build Document
    doc.build(elements)

    # Persist Report DB entry
    report = Report(
        name=f"Executive Report — {project.name}",
        report_type=report_type,
        file_path=file_path,
        project_id=project_id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_reports_by_project(db: Session, project_id: int):
    return db.query(Report).filter(Report.project_id == project_id).order_by(Report.created_at.desc()).all()


def get_report_by_id(db: Session, report_id: int) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()


def delete_report(db: Session, report: Report):
    if report.file_path and os.path.exists(report.file_path):
        try:
            os.remove(report.file_path)
        except OSError as e:
            print(f"Warning: Failed to delete report file {report.file_path}: {e}")

    db.delete(report)
    db.commit()
