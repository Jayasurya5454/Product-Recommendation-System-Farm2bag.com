import requests

response = requests.post("http://127.0.0.1:5000/recommend", json={"user_id": "67b04f3cdc12c6e7d07cff48"})
print(response.json())
