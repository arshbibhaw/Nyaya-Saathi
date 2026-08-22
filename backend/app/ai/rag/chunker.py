"""
Hierarchical legal text chunker for Nyaya Saathi.

Parses statutory Acts and legal rules, preserving full hierarchical context:
Act -> Chapter -> Section -> Statutory Provision + Metadata.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class LegalChunk:
    """Represents a discrete semantic chunk of an authoritative legal source."""

    title: str
    act_name: str
    short_name: str
    chapter: str
    section_number: str
    section_title: str
    chunk_text: str
    domain: str
    jurisdiction: str
    authority: str
    source_url: Optional[str] = None
    extra_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_metadata_dict(self) -> Dict[str, Any]:
        """Convert chunk attributes to a structured JSON dictionary for database storage."""
        return {
            "act_name": self.act_name,
            "short_name": self.short_name,
            "chapter": self.chapter,
            "section_number": self.section_number,
            "section_title": self.section_title,
            "domain": self.domain,
            "jurisdiction": self.jurisdiction,
            "authority": self.authority,
            **self.extra_metadata,
        }


def format_chunk_content(
    act_name: str,
    chapter: str,
    section_number: str,
    section_title: str,
    text: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Format statutory text with an authoritative citation header.

    This ensures embedding representations capture both the high-level legal
    concept and the specific statutory provision.
    """
    header = f"[{act_name}] {section_number}: {section_title}"
    lines = [
        header,
        f"Hierarchy: {chapter}",
    ]

    if metadata:
        meta_items = [f"{k.replace('_', ' ').title()}: {v}" for k, v in metadata.items() if isinstance(v, str)]
        if meta_items:
            lines.append("Key Legal Parameters: " + " | ".join(meta_items))

    lines.append("")
    lines.append("Statutory Text:")
    lines.append(text.strip())

    return "\n".join(lines)


def chunk_legal_source_dict(data: Dict[str, Any], source_url: Optional[str] = None) -> List[LegalChunk]:
    """Parse a structured legal source dictionary into hierarchical LegalChunks."""
    act_name = data.get("act_name", "Unknown Act")
    short_name = data.get("short_name", act_name)
    jurisdiction = data.get("jurisdiction", "India")
    domain = data.get("domain", "general_law")
    authority = data.get("authority", "Appropriate Judicial Authority")
    sections = data.get("sections", [])

    chunks: List[LegalChunk] = []

    for sec in sections:
        chapter = sec.get("chapter", "General Provisions")
        section_number = sec.get("section_number", "Section")
        section_title = sec.get("title", "Provision")
        raw_text = sec.get("text", "")
        extra_meta = sec.get("metadata", {})

        title = f"{short_name} - {section_number}: {section_title}"
        formatted_text = format_chunk_content(
            act_name=act_name,
            chapter=chapter,
            section_number=section_number,
            section_title=section_title,
            text=raw_text,
            metadata=extra_meta,
        )

        chunk = LegalChunk(
            title=title,
            act_name=act_name,
            short_name=short_name,
            chapter=chapter,
            section_number=section_number,
            section_title=section_title,
            chunk_text=formatted_text,
            domain=domain,
            jurisdiction=jurisdiction,
            authority=authority,
            source_url=source_url,
            extra_metadata=extra_meta,
        )
        chunks.append(chunk)

    return chunks


def chunk_legal_source_file(file_path: str | Path) -> List[LegalChunk]:
    """Read a JSON legal source file and return its hierarchical chunks."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Legal source file not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return chunk_legal_source_dict(data, source_url=f"file://{path.name}")
