from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson import ObjectId  

from dotenv import load_dotenv
import os
load_dotenv()

mongourl = os.getenv('MONGODB_URI')
print(mongourl)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})



client = MongoClient(mongourl)
db = client["test"]

event_weights = {"view": 1, "search": 2, "Favorite" : 3, "add_to_cart": 5, "purchase": 7}

import train_model as tm
tm.retrain_model()


# Load trained models and data

try:
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

    with open("cosine_sim.pkl", "rb") as f:
        cosine_sim = pickle.load(f)

    with open("products_data.pkl", "rb") as f:
        products_data = pickle.load(f)

    if not isinstance(products_data, pd.DataFrame):
        products_data = pd.DataFrame(products_data)

except Exception as e:
    print(f"Error loading model files: {e}")
    exit(1) 


def content_based_recommendations(product_id, top_n=5):
    product_id = str(product_id)  

    if product_id not in products_data["_id"].astype(str).values:
        return []

    idx = products_data.index[products_data["_id"].astype(str) == product_id].tolist()
    if not idx:
        return []

    idx = idx[0]
    similarity_scores = list(enumerate(cosine_sim[idx]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    recommended_indices = [i[0] for i in similarity_scores[1:top_n + 1]]

    return products_data.iloc[recommended_indices]["_id"].astype(str).tolist()


def collaborative_filtering(user_id, top_n=12):
    events_cursor = db.events.find({}, {"userId": 1, "productId": 1, "eventType": 1})
    events_data = pd.DataFrame(list(events_cursor))

    if events_data.empty:
        return []  # No interactions found new module working in this place for recommendation

    events_data["weight"] = events_data["eventType"].map(event_weights)
    user_interactions = events_data.groupby(["userId", "productId"])["weight"].sum().reset_index()
    user_item_matrix = user_interactions.pivot(index="userId", columns="productId", values="weight").fillna(0)

    try:
        user_id_obj = ObjectId(user_id)
    except Exception:
        return []

    if user_id_obj not in user_item_matrix.index:
        return []

    user_vector = user_item_matrix.loc[user_id_obj].values.reshape(1, -1)
    similarity_scores = cosine_similarity(user_vector, user_item_matrix)[0]
    similar_users = list(user_item_matrix.index[np.argsort(similarity_scores)[::-1]][1:])

    recommended_products = set()
    for similar_user in similar_users:
        recommended_products.update(
            user_interactions[user_interactions["userId"] == similar_user]["productId"].astype(str).tolist()
        )
        if len(recommended_products) >= top_n:
            break

    return list(recommended_products)[:top_n]


def hybrid_filtering(user_id, top_n=10):
    collaborative_recs = set(collaborative_filtering(user_id, top_n))
    user_events_cursor = db["events"].find({"userId": ObjectId(user_id)})
    user_events = pd.DataFrame(list(user_events_cursor))

    if user_events.empty:
        return list(collaborative_recs)

    first_product_id = str(user_events["productId"].iloc[0])
    content_recs = set(content_based_recommendations(first_product_id, top_n))

    hybrid_recommendations = list(content_recs | collaborative_recs)[:top_n]
    return hybrid_recommendations


@app.route("/recommend", methods=["POST", "OPTIONS"])
def recommend():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight request success"}), 200

    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"error": "Missing user_id in request"}), 400

    user_id = str(data["user_id"])  # user_id as string for response
    print(f"Received user_id: {user_id}")
    
    if len(user_id) != 24 or not all(c in "0123456789abcdef" for c in user_id.lower()):
        return jsonify({"error": "Invalid user_id format. It must be a 24-character hex string."}), 400
    
    # Convert user_id to ObjectId for MongoDB query
    try:
        user_id_object = ObjectId(user_id) 
    except Exception as e:
        print(f"Error converting user_id to ObjectId: {str(e)}")
        return jsonify({"error": f"Invalid user_id format: {str(e)}"}), 400

    # Query MongoDB using ObjectId
    user_events_cursor = db["events"].find({"userId": user_id_object})
    print(user_events_cursor)

    user_events = pd.DataFrame(list(user_events_cursor))
    print(f"User events DataFrame: {user_events}")

    if user_events.empty:
        return jsonify({"message": f"No interactions found for user {user_id}", "recommendations": []})

    first_product_id = str(user_events["productId"].iloc[0])
    content_recs = content_based_recommendations(first_product_id)
    collaborative_recs = collaborative_filtering(user_id)
    hybrid_recs = hybrid_filtering(user_id)

    return jsonify({
        "user_id": user_id,
        "content_based": content_recs,
        "collaborative": collaborative_recs,
        "hybrid": hybrid_recs
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
