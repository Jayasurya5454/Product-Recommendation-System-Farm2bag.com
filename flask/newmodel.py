from pymongo import MongoClient
import pandas as pd
from sklearn.cluster import KMeans
from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split
from mlxtend.frequent_patterns import apriori, association_rules

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["farm2bag"]

# Retrieve data from MongoDB
users = pd.DataFrame(list(db.users.find()))
products = pd.DataFrame(list(db.products.find()))
events = pd.DataFrame(list(db.events.find()))

# Clean and preprocess data
users = users.drop(columns=["_id"])
products = products.drop(columns=["_id"])
events = events.drop(columns=["_id"])

# Collaborative Filtering: User-Product Interaction Matrix
interaction_matrix = events.pivot_table(index="userId", columns="productId", values="weight", fill_value=0)

# Collaborative Filtering Model (KNN)
reader = Reader(rating_scale=(0, 10))
data = Dataset.load_from_df(events[["userId", "productId", "weight"]], reader)
trainset, testset = train_test_split(data, test_size=0.2)

# Train KNN model
model = KNNBasic(sim_options={"name": "cosine", "user_based": True})
model.fit(trainset)

# Function to get collaborative filtering recommendations
def get_collaborative_recommendations(user_id, n=5):
    user_interactions = interaction_matrix.loc[user_id]
    user_unseen_products = user_interactions[user_interactions == 0].index
    predictions = [model.predict(user_id, product_id) for product_id in user_unseen_products]
    top_n = sorted(predictions, key=lambda x: x.est, reverse=True)[:n]
    return [pred.iid for pred in top_n]

# Demographic-Based Recommendations (Clustering)
user_features = users[["age", "weight", "height"]]
kmeans = KMeans(n_clusters=3)
users["cluster"] = kmeans.fit_predict(user_features)

def get_demographic_recommendations(user_id, n=5):
    user_cluster = users.loc[users["userId"] == user_id, "cluster"].values[0]
    cluster_users = users[users["cluster"] == user_cluster]["userId"]
    cluster_interactions = events[events["userId"].isin(cluster_users)]
    popular_products = cluster_interactions.groupby("productId")["weight"].sum().nlargest(n).index.tolist()
    return popular_products

# Content-Based Recommendations (Health Conditions)
def get_health_based_recommendations(user_id, n=5):
    user_health_conditions = users.loc[users["userId"] == user_id, "healthConditions"].values[0]
    if isinstance(user_health_conditions, list) and len(user_health_conditions) > 0:
        recommended_products = products[products["healthConditions"].apply(lambda x: any(condition in x for condition in user_health_conditions))]
        return recommended_products["productId"].head(n).tolist()
    return []

# Product Pairing Suggestions (Association Rule Mining)
def get_product_pairing_recommendations(product_id, n=5):
    frequent_itemsets = apriori(events[["userId", "productId"]], min_support=0.01, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
    pairing_products = rules[rules["antecedents"].apply(lambda x: product_id in x)]["consequents"].head(n).tolist()
    return pairing_products

# Hybrid Recommendation System
def get_hybrid_recommendations(user_id, n=5):
    collab_recs = get_collaborative_recommendations(user_id, n)
    demo_recs = get_demographic_recommendations(user_id, n)
    health_recs = get_health_based_recommendations(user_id, n)
    
    # Combine and deduplicate recommendations
    hybrid_recs = list(set(collab_recs + demo_recs + health_recs))[:n]
    return hybrid_recs

# Example Usage
user_id = "user1"
recommendations = get_hybrid_recommendations(user_id, n=9)
print(f"Recommended products for user {user_id}: {recommendations}")

