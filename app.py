from flask import Flask, render_template, request, jsonify
from faq_data import FAQS
from nlp_engine import find_best_answer

app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "index.html",
        faq_count=len(FAQS)
    )


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()

    if not data or "question" not in data:
        return jsonify({
            "success": False,
            "message": "Please enter a question."
        }), 400

    question = data["question"].strip()

    if not question:
        return jsonify({
            "success": False,
            "message": "Please enter a question."
        }), 400

    result = find_best_answer(question)

    return jsonify({
        "success": True,
        "answer": result["answer"],
        "matched_question": result["matched_question"],
        "confidence": result["confidence"],
        "status": result["status"]
    })


@app.route("/suggestions")
def suggestions():
    questions = [
        faq["question"]
        for faq in FAQS[:6]
    ]

    return jsonify(questions)


if __name__ == "__main__":
    app.run(debug=True)