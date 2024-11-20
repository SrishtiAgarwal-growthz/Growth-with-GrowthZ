import json
from app_store_scraper import AppStore

def fetch_reviews(app_id, country='in', app_name=None):
    try:
        app = AppStore(country=country, app_name=app_name, app_id=app_id)
        app.review(how_many=50)  # Fetch up to 50 reviews
        reviews = [
            {
                "id": review.get("id", ""),
                "author": review.get("userName", "Unknown User"),
                "rating": review.get("rating", 0),
                "review": review.get("review", ""),
                "title": review.get("title", ""),
                "date": review["date"].isoformat() if "date" in review else "",  # Serialize datetime
            }
            for review in app.reviews
        ]
        return reviews
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print(json.dumps({"error": "App ID, Country, and App Name are required as arguments."}))
        sys.exit(1)
    app_id = sys.argv[1]
    country = sys.argv[2]
    app_name = sys.argv[3]
    reviews = fetch_reviews(app_id, country, app_name)
    print(json.dumps(reviews))  # Ensure JSON output
