from pymongo import MongoClient
import pandas as pd
from sklearn.cluster import KMeans
from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split
from mlxtend.frequent_patterns import apriori, association_rules
import numpy as np
from datetime import datetime
from bson import ObjectId
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()
MONGODB_URI = os.getenv("MONGO_DB_URL")
client = MongoClient(MONGODB_URI)

db = client.get_database()

def refresh_data():
    users = pd.DataFrame(list(db.users.find()))
    products = pd.DataFrame(list(db.products.find()))
    events = pd.DataFrame(list(db.events.find()))
    users = users.drop(columns=["_id"])  
    products = products.rename(columns={"_id": "productId"})  
    events = events.drop(columns=["_id"])
    return users, products, events

app = Flask(__name__)

CORS(app)

CORS(app, origins=["http://localhost:5173"])
# Collaborative Filtering: KNN Model Training
def train_knn_model(events):
    reader = Reader(rating_scale=(0, 10))
    data = Dataset.load_from_df(events[["userId", "productId", "weight"]], reader)
    trainset, _ = train_test_split(data, test_size=0.2)
    model = KNNBasic(sim_options={"name": "cosine", "user_based": True})
    model.fit(trainset)
    return model

# Function to get collaborative filtering recommendations
def get_collaborative_recommendations(user_id, interaction_matrix, model, n=8):
    if user_id not in interaction_matrix.index:
        return []  
    user_interactions = interaction_matrix.loc[user_id]
    user_unseen_products = user_interactions[user_interactions == 0].index
    predictions = [model.predict(user_id, product_id) for product_id in user_unseen_products]
    top_n = sorted(predictions, key=lambda x: x.est, reverse=True)[:n]
    return [str(pred.iid) for pred in top_n]

# Demographic-Based Recommendations (Clustering)
def train_user_clusters(users):
    user_features = users[["age", "weight", "height"]].fillna(users[["age", "weight", "height"]].mean())
    kmeans = KMeans(n_clusters=3)
    users["cluster"] = kmeans.fit_predict(user_features)
    return users

def get_demographic_recommendations(user_id, users, events, n=5):
    if user_id not in users["userid"].values:
        return []
    user_cluster = users.loc[users["userid"] == user_id, "cluster"].values[0]
    cluster_users = users[users["cluster"] == user_cluster]["userid"]
    cluster_interactions = events[events["userId"].isin(cluster_users)]
    popular_products = cluster_interactions.groupby("productId")["weight"].sum().nlargest(n).index.tolist()
    return [str(product) for product in popular_products]

# Content-Based Recommendations (Health Conditions)
def get_health_based_recommendations(user_id, users, products, n=7):
    if user_id not in users["userid"].values:
        return []
    user_health_conditions = users.loc[users["userid"] == user_id, "medicalConditions"].values[0]
    if isinstance(user_health_conditions, list) and len(user_health_conditions) > 0:
        recommended_products = products[products["healthConditions"].apply(lambda x: any(condition in x for condition in user_health_conditions))]
        return recommended_products["productId"].head(n).tolist()
    return []

# Product Pairing Suggestions (Association Rule Mining)
def get_product_pairing_recommendations(product_id, events, n=5):
    frequent_itemsets = apriori(events[["userId", "productId"]], min_support=0.01, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
    pairing_products = rules[rules["antecedents"].apply(lambda x: product_id in x)]["consequents"].head(n).tolist()
    return [str(product) for product in pairing_products]

# Seasonal Recommendations
def get_seasonal_recommendations(products, n=5):
    current_month = datetime.now().month
    season_mapping = {
    3: "summer", 4: "summer", 5: "summer", 6: "summer",
    7: "monsoon", 8: "monsoon", 9: "monsoon", 10: "monsoon", 11: "monsoon",
    12: "winter", 1: "winter", 2: "winter"
}

    current_season = season_mapping.get(current_month, "all")
    seasonal_products = products[products["seasonal"].apply(
        lambda x: current_season in x or "all" in x if isinstance(x, list) else x == current_season or x == "all"
    )]
    return seasonal_products["productId"].head(n).tolist()

# Profession-Based Recommendations
def get_profession_based_recommendations(user_id, users, products, n=5):
    if user_id not in users["userid"].values:
        return []
    user_profession = users.loc[users["userid"] == user_id, "occupation"].values[0]
    profession_recs = products[products["occupationTags"].apply(
        lambda x: user_profession in x if isinstance(x, list) else x == user_profession
    )]
    return profession_recs["productId"].head(n).tolist()

# Hybrid Recommendation System
def get_hybrid_recommendations(user_id, users, products, events, model, interaction_matrix, n=8):
    collab_recs = get_collaborative_recommendations(user_id, interaction_matrix, model, n)
    demo_recs = get_demographic_recommendations(user_id, users, events, n)
    health_recs = get_health_based_recommendations(user_id, users, products, n)
    seasonal_recs = get_seasonal_recommendations(products, n)
    profession_recs = get_profession_based_recommendations(user_id, users, products, n)
    hybrid_recs = list(set(collab_recs + demo_recs + health_recs + seasonal_recs + profession_recs))[:n]
    return hybrid_recs

# Fetch product details
def get_product_details(product_ids):
    products = []
    for product_id in product_ids:
        product = db.products.find_one({"_id": ObjectId(product_id)})
        if product:
            product["_id"] = str(product["_id"])
            products.append(product)
    return products

@app.route('/get_recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    users, products, events = refresh_data()
    users = train_user_clusters(users)
    model = train_knn_model(events)
    interaction_matrix = events.pivot_table(index="userId", columns="productId", values="weight", fill_value=0)
    recommended_ids = get_hybrid_recommendations(user_id, users, products, events, model, interaction_matrix, n=12)
    recommendations = get_product_details(recommended_ids)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, port=50001)
