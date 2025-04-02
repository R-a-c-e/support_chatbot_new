import spacy
from faker import Faker
import random
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

nlp = spacy.load("en_core_web_sm")

fake = Faker()
app = Flask(__name__)
CORS(app)

def pseudonymize_text(text):
    doc = nlp(text)
    anonymized_text = text
    
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            fake_name = fake.name()
            anonymized_text = anonymized_text.replace(ent.text, fake_name)
        elif ent.label_ in ['GPE', 'LOC', 'FAC']: 
            anonymized_text = anonymized_text.replace(ent.text, '[LOCATION]')
    
    return anonymized_text

def generalize_dates(text):

    text = re.sub(r'\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}(st|nd|rd|th)?\s+\w+\s+\d{4})\b', '[DATE]', text)

    return text

def mask_sensitive_numbers(text):
    text = re.sub(r'\b\d{9,11}\b', 'XXX-XXX-XXXX', text)
    text = re.sub(r'\b\d{12,19}\b', '[REDACTED]', text)
    return text

def randomize_email(text):
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', lambda match: fake.email(), text)
    return text

def anonymize_advanced(text):
    text = pseudonymize_text(text)
    text = generalize_dates(text)
    text = mask_sensitive_numbers(text)
    text = randomize_email(text)
    
    return text

@app.route("/anonymize", methods=["POST"])
def anonymize():
    """
    Flask endpoint to handle anonymization requests.
    """
    data = request.json
    text = data.get("text", "")
    anonymized_text = anonymize_advanced(text)
    return anonymized_text

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
