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

# MongoDB connection string
MONGODB_URI = "mongodb+srv://jayasurya:suryajsm@employeehub.1sv1y.mongodb.net/farm2bag-recommendation?retryWrites=true&w=majority"

# Connect to MongoDB
client = MongoClient(MONGODB_URI)

# Retrieve data from MongoDB
db = client.get_database()
users = pd.DataFrame(list(db.users.find()))
products = pd.DataFrame(list(db.products.find()))
events = pd.DataFrame(list(db.events.find()))

# Clean and preprocess data
users = users.drop(columns=["_id"])  # Drop _id from users
products = products.rename(columns={"_id": "productId"})  # Rename _id to productId in products
events = events.drop(columns=["_id"])  # Drop _id from events

# Ensure correct columns for processing
user_id_column_users = "userid"
user_id_column_events = "userId"
if user_id_column_users not in users.columns:
    raise ValueError(f"The 'users' DataFrame is missing the '{user_id_column_users}' column.")
if user_id_column_events not in events.columns:
    raise ValueError(f"The 'events' DataFrame is missing the '{user_id_column_events}' column.")

# Handle missing user feature values (e.g., age, weight, height)
user_features = users[["age", "weight", "height"]]
user_features = user_features.fillna(user_features.mean())

# Collaborative Filtering: User-Product Interaction Matrix
interaction_matrix = events.pivot_table(index=user_id_column_events, columns="productId", values="weight", fill_value=0)

# Collaborative Filtering Model (KNN)
reader = Reader(rating_scale=(0, 10))
data = Dataset.load_from_df(events[[user_id_column_events, "productId", "weight"]], reader)
trainset, testset = train_test_split(data, test_size=0.2)

# Train KNN model
model = KNNBasic(sim_options={"name": "cosine", "user_based": True})
model.fit(trainset)

# Function to get collaborative filtering recommendations
def get_collaborative_recommendations(user_id, n=5):
    if user_id not in interaction_matrix.index:
        return []  # Return empty list if user_id is not found
    user_interactions = interaction_matrix.loc[user_id]
    user_unseen_products = user_interactions[user_interactions == 0].index
    predictions = [model.predict(user_id, product_id) for product_id in user_unseen_products]
    top_n = sorted(predictions, key=lambda x: x.est, reverse=True)[:n]
    return [str(pred.iid) for pred in top_n]  # Ensure the product ID is returned as a string

# Demographic-Based Recommendations (Clustering)
kmeans = KMeans(n_clusters=3)
user_features = users[["age", "weight", "height"]].fillna(0)  # Fill NaN values with zeros
users["cluster"] = kmeans.fit_predict(user_features)

def get_demographic_recommendations(user_id, n=5):
    if user_id not in users[user_id_column_users].values:
        return []  # Return empty list if user_id is not found
    user_cluster = users.loc[users[user_id_column_users] == user_id, "cluster"].values[0]
    cluster_users = users[users["cluster"] == user_cluster][user_id_column_users]
    cluster_interactions = events[events[user_id_column_events].isin(cluster_users)]
    popular_products = cluster_interactions.groupby("productId")["weight"].sum().nlargest(n).index.tolist()
    return [str(product) for product in popular_products]  # Ensure product IDs are strings

# Content-Based Recommendations (Health Conditions)
def get_health_based_recommendations(user_id, n=5):
    if user_id not in users[user_id_column_users].values:
        return []  # Return empty list if user_id is not found
    user_health_conditions = users.loc[users[user_id_column_users] == user_id, "medicalConditions"].values[0]
    if isinstance(user_health_conditions, list) and len(user_health_conditions) > 0:
        recommended_products = products[products["healthConditions"].apply(lambda x: any(condition in x for condition in user_health_conditions))]
        return recommended_products["productId"].head(n).tolist()
    return []

# Product Pairing Suggestions (Association Rule Mining)
def get_product_pairing_recommendations(product_id, n=5):
    frequent_itemsets = apriori(events[[user_id_column_events, "productId"]], min_support=0.01, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
    pairing_products = rules[rules["antecedents"].apply(lambda x: product_id in x)]["consequents"].head(n).tolist()
    return [str(product) for product in pairing_products]  # Ensure product IDs are strings

# Seasonal Recommendations
def get_seasonal_recommendations(n=5):
    current_month = datetime.now().month
    
    # Map the current month to a season
    season_mapping = {
        12: "winter", 1: "winter", 2: "winter",  # Winter
        3: "spring", 4: "spring", 5: "spring",   # Spring
        6: "summer", 7: "summer", 8: "summer",   # Summer
        9: "autumn", 10: "autumn", 11: "autumn"   # Autumn
    }
    
    current_season = season_mapping.get(current_month, "all")
    
    # Filter products based on the seasonal column (Corrected column name from 'season' to 'seasonal')
    seasonal_products = products[products["seasonal"].apply(
        lambda x: current_season in x or "all" in x if isinstance(x, list) else x == current_season or x == "all"
    )]
    
    return seasonal_products["productId"].head(n).tolist()

# Profession-Based Recommendations
def get_profession_based_recommendations(user_id, n=5):
    if user_id not in users[user_id_column_users].values:
        return []  # Return empty list if user_id is not found
    
    user_profession = users.loc[users[user_id_column_users] == user_id, "occupation"].values[0]
    
    # Ensure 'occupationTags' is a list for each product and check if the user's profession is included
    profession_recs = products[products["occupationTags"].apply(
        lambda x: user_profession in x if isinstance(x, list) else x == user_profession
    )]
    
    return profession_recs["productId"].head(n).tolist()


# Hybrid Recommendation System
def get_hybrid_recommendations(user_id, n=5):
    collab_recs = get_collaborative_recommendations(user_id, n)
    demo_recs = get_demographic_recommendations(user_id, n)
    health_recs = get_health_based_recommendations(user_id, n)
    seasonal_recs = get_seasonal_recommendations(n)
    profession_recs = get_profession_based_recommendations(user_id, n)
    
    # Combine and deduplicate recommendations
    hybrid_recs = list(set(collab_recs + demo_recs + health_recs + seasonal_recs + profession_recs ))[:n]
    
    # Convert ObjectId to string if necessary
    hybrid_recs = [str(item) if isinstance(item, ObjectId) else item for item in hybrid_recs]
    
    return hybrid_recs

# Flask route for recommendations
app = Flask(__name__)

@app.route('/get_recommendations', methods=['GET'])
def get_recommendations():
    user_id = request.args.get('userId')  # Get userId from query params
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    # Fetch the recommendations
    recommendations = get_hybrid_recommendations(user_id, n=5)
    
    # Fetch the product details based on recommended product IDs
    recommended_products = products[products['productId'].isin(recommendations)]
    
    return jsonify(recommended_products.to_dict(orient="records"))

if __name__ == '__main__':
    app.run(debug=True)
