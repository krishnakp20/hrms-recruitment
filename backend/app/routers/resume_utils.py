import spacy
import os
import re
from typing import Dict
from docx import Document
import pdfplumber

nlp = spacy.load("en_core_web_sm")

def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text(file_path: str) -> str:
    if file_path.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file type. Only .pdf and .docx are supported.")

def extract_email(text: str) -> str:
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    match = re.search(r'(\+91[-\s]?)?\d{10}', text)
    return match.group(0) if match else ""

def parse_resume_spacy(file_path: str) -> Dict:
    if not os.path.exists(file_path):
        return {}

    text = extract_text(file_path)
    doc = nlp(text)

    name = ""
    experience_sentences = []
    experience_keywords = ["experience", "worked", "employed", "responsibilities", "internship"]

    for ent in doc.ents:
        if ent.label_ == "PERSON" and not name:
            name = ent.text

    for sent in doc.sents:
        if any(kw in sent.text.lower() for kw in experience_keywords):
            experience_sentences.append(sent.text.strip())

    return {
        "name": name,
        "email": extract_email(text),
        "phone": extract_phone(text),
        "experience_summary": "\n".join(experience_sentences[:5])
    }
