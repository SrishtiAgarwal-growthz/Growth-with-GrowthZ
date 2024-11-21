import json
from app_store_scraper import AppStore

def fetch_reviews(app_id, country='in', app_name=None):
    try:
        app = AppStore(country=country, app_name=app_name, app_id=app_id)
        app.review(how_many=100)  # Fetch up to 100 reviews
        
        if not app.reviews:
            return {"status": "error", "message": f"No reviews found for App ID {app_id}"}
        
        # Filter 5-star reviews and extract only the 'review' field
        five_star_reviews = [review.get("review", "") for review in app.reviews if review.get("rating") == 5]
        return {"status": "success", "reviews": five_star_reviews}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print(json.dumps({"status": "error", "message": "App ID, Country, and App Name are required as arguments."}))
        sys.exit(1)
    
    app_id = sys.argv[1]
    country = sys.argv[2]
    app_name = sys.argv[3]

    result = fetch_reviews(app_id, country, app_name)
    print(json.dumps(result, ensure_ascii=False))

