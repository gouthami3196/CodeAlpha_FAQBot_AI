import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from faq_data import FAQS


# Download required NLTK resources
nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("omw-1.4", quiet=True)


# Initialize NLP tools
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))


# Common words and abbreviations
# This helps the chatbot understand different ways of asking
ALIASES = {
    "nlp": "natural language processing",
    "ai": "artificial intelligence",
    "faq": "frequently asked questions",
    "tfidf": "tf idf",
    "tf-idf": "tf idf",
}


def preprocess_text(text):
    """
    Clean and normalize text using NLP techniques.
    """

    text = text.lower()

    # Normalize common abbreviations
    for short_form, full_form in ALIASES.items():
        text = text.replace(short_form, full_form)

    # Remove special characters and numbers
    text = re.sub(r"[^a-zA-Z\s]", " ", text)

    # Tokenization
    words = text.split()

    # Remove stop words and lemmatize
    words = [
        lemmatizer.lemmatize(word)
        for word in words
        if word not in stop_words
    ]

    return " ".join(words)


# Prepare FAQ questions
faq_questions = [
    preprocess_text(faq["question"])
    for faq in FAQS
]


# Create TF-IDF model
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2)
)

faq_vectors = vectorizer.fit_transform(faq_questions)


def find_best_answer(user_question):
    """
    Find the FAQ with the highest cosine similarity.
    """

    cleaned_question = preprocess_text(user_question)

    user_vector = vectorizer.transform([cleaned_question])

    similarity_scores = cosine_similarity(
        user_vector,
        faq_vectors
    )[0]

    best_index = similarity_scores.argmax()
    confidence = float(similarity_scores[best_index])

    best_faq = FAQS[best_index]

    # Confidence levels
    if confidence >= 0.55:
        status = "High"
    elif confidence >= 0.30:
        status = "Medium"
    else:
        status = "Low"

    # If confidence is too low, don't give a random answer
    if confidence < 0.20:
        return {
            "answer": "I'm sorry, I couldn't find a confident answer to that question. Please try asking in a different way.",
            "matched_question": "No confident match found",
            "confidence": round(confidence * 100, 1),
            "status": "Low"
        }

    return {
        "answer": best_faq["answer"],
        "matched_question": best_faq["question"],
        "confidence": round(confidence * 100, 1),
        "status": status
    }