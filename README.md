# Farm2Bag Recommendation System

## Overview

The **Farm2Bag Recommendation System** is a comprehensive project designed to provide personalized product recommendations for users based on various factors like collaborative filtering, demographic data, health conditions, seasons, and profession. The system integrates data from MongoDB, processes it in real-time, and offers dynamic recommendations through a Flask API.

---

## Features

### Recommendation Types:

1. **Collaborative Filtering**: Uses user-product interactions to predict preferences based on similar users.
2. **Demographic-Based Recommendations**: Groups users into clusters based on their demographic data and suggests products popular within the cluster.
3. **Health-Based Recommendations**: Suggests products tailored to the user's medical conditions.
4. **Product Pairing Suggestions**: Utilizes association rule mining to identify frequently paired products.
5. **Seasonal Recommendations**: Filters products based on the current season.
6. **Profession-Based Recommendations**: Recommends products relevant to the user's profession.
7. **Hybrid Recommendations**: Combines multiple recommendation types into a unified output.

---

## Tech Stack

### Backend:
- **Programming Language**: Python (Flask) & JavaScript (Node.js with Express)
- **Database**: MongoDB (hosted on MongoDB Atlas)
- **Machine Learning**:
  - K-Means Clustering (Demographic Recommendations)
  - KNNBasic (Collaborative Filtering)
  - Apriori Algorithm (Association Rule Mining)
- **Libraries Used**:
  - `pymongo` for MongoDB integration
  - `pandas` and `numpy` for data processing
  - `sklearn` for clustering and ML algorithms
  - `mlxtend` for association rule mining
  - `surprise` for collaborative filtering

### Frontend:
- **Framework**: React.js
- **Styling**: Tailwind CSS

---

## Installation

### Backend:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Jayasurya5454/Product-Recommendation-System.git
   cd farm2bag-recommendation/Model
   ```

2. **Set Up Python Environment**:

   ```bash
   python3 -m venv env
   source venv/bin/activate 
   ```

3. **Install Python Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Node.js**:

   ```bash
   cd ..
   cd backend
   npm install
   ```

5. **Configure MongoDB Connection**:
   Update the `MONGODB_URI` in both the Python and Node.js backend configurations with your MongoDB Atlas connection string.

6. **Run the Backends**:

   - **Flask API**:
     ```bash
     python3 Model.py
     ```
   - **Node.js Server**:
     ```bash
     npm start
     ```

### Frontend:

1. **Navigate to Frontend Directory**:

   ```bash
   cd ../client
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start the Frontend**:

   ```bash
   npm run dev
   ```

---

## API Endpoints

### **GET /get\_recommendations/<user\_id>** (Flask Backend)

- **Description**: Fetches hybrid recommendations for the specified user.
- **Request Parameters**:
  - `user_id`: The ID of the user for whom recommendations are to be generated.
- **Response**:
  - A JSON array of recommended products with detailed metadata.

### **POST /clickstream** (Node.js Backend)

- **Description**: Collects clickstream data from the frontend for analytics.
- **Request Body**:

  ```json
  {
      "userId": "String",
      "productId": "String",
      "event_type": "String",
      "timestamp": "ISO8601"
  }
  ```
- **Response**:
  - Status message confirming data collection.

---

## Data Structure

### MongoDB Collections

1. **Users Collection**:

   ```json
   {
       "_id": "ObjectId",
       "userid": "String",
       "email": "String",
       "mobileNumber": "String",
       "lastVisit": "Date",
       "age": "Number",
       "gender": "String",
       "weight": "Number",
       "height": "Number",
       "bmi": "Number",
       "medicalConditions": ["String", "String"],
       "skinType": ["String", "String"],
       "occupation": ["String"],
       "dietType": "String"
   }
   ```

2. **Products Collection**:

   ```json
   {
       "_id": "ObjectId",
       "title": "String",
       "description": "String",
       "price": "Number",
       "status": "String",
       "category": "String",
       "quantity": "Number",
       "photos": "String",
       "createdAt": "Date",
       "nutritionalInfo": {
           "calories": "Number",
           "protein": "Number",
           "fiber": "Number",
           "vitamins": ["String"]
       },
       "healthConditions": ["String", "String"],
       "seasonal": ["String", "String"],
       "skinTypeCompatibility": "String",
       "complementaryProducts": ["String"],
       "occupationTags": ["String"],
       "recipePairings": ["String"],
       "discount": "Number",
       "trendingScore": "Number"
   }
   ```

3. **Events Collection**:

   ```json
   {
       "_id": "ObjectId",
       "userId": "String",
       "productId": "String",
       "eventType": "String",
       "weight": "Number",
       "timestamp": "Date",
       "context": {
           "device": "String",
           "location": "String",
           "timeOfDay": "String"
       },
       "sessionId": "String",
       "rating": "Number"
   }
   ```

4. **Clickstream Collection**:

   ```json
   {
       "_id": "ObjectId",
       "userId": "String",
       "productId": "String",
       "timestamp": "ISO8601"
   }
   ```

---

## Recommendation Logic

### Collaborative Filtering

- Uses a KNN-based approach to recommend products that similar users have liked.
- **Library**: `surprise`

### Demographic Recommendations

- Clusters users based on age, weight, and height using K-Means.
- Suggests products popular within the same cluster.

### Health-Based Recommendations

- Matches users' medical/health conditions with product health tags.

### Product Pairing

- Implements Apriori algorithm to find frequently paired products.

### Seasonal Recommendations

- Filters products based on the current season or all-season tags.

### Profession-Based Recommendations

- Suggests products based on occupation and relevant tags.

### Hybrid Recommendations

- Combines results from all the above methods to generate final recommendations.

---

## How It Works

1. **Refresh Data**: The system fetches the latest data from MongoDB at the start of every API call.
2. **Preprocessing**:
   - Cleans and formats data for ML algorithms.
   - Handles missing values in demographic data.
3. **Model Execution**:
   - Runs each recommendation model to generate results.
   - Combines outputs into a unified hybrid recommendation list.
4. **Return Recommendations**: The API returns product details for the recommended items.
5. **Clickstream Data**: Frontend collects user interactions and sends them to the Node.js backend for storage and analysis.

---

## Future Enhancements

1. Integrate with real-time event streams for dynamic data updates.
2. Add user feedback to improve recommendation accuracy.
3. Incorporate more sophisticated deep learning models for content-based filtering.
4. Extend seasonal and demographic recommendations with location-based filtering.
5. Implement advanced analytics using clickstream data.

---



## License

This project is licensed under the Apache License 2.0. See the LICENSE file for more details.
