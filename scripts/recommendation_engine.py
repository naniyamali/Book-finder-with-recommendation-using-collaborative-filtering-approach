"""
Netflix-style Collaborative Filtering Recommendation Engine
This script can be run periodically to generate recommendations for all users
"""

import os
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Tuple
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_all_users() -> List[str]:
    """Get all user IDs from the database"""
    response = supabase.table("profiles").select("id").execute()
    return [user["id"] for user in response.data]


def get_user_reading_history(user_id: str) -> List[Dict]:
    """Get reading history for a specific user"""
    response = (
        supabase.table("reading_history")
        .select("*")
        .eq("user_id", user_id)
        .eq("action_type", "viewed")
        .order("created_at", desc=False)
        .execute()
    )
    return response.data


def find_book_sequences(
    user_history: List[Dict],
) -> List[Tuple[str, str]]:
    """Find sequences of books (book A followed by book B)"""
    sequences = []
    for i in range(len(user_history) - 1):
        current_book = user_history[i]["book_id"]
        next_book = user_history[i + 1]["book_id"]
        sequences.append((current_book, next_book))
    return sequences


def generate_recommendations_for_user(user_id: str) -> List[Dict]:
    """
    Generate recommendations for a user based on collaborative filtering
    
    Algorithm:
    1. Get user's reading history
    2. Find other users who read the same books
    3. Find what books those users read next
    4. Recommend books with highest frequency
    """
    # Get user's reading history
    user_history = get_user_reading_history(user_id)
    
    if not user_history:
        return []
    
    user_book_ids = [book["book_id"] for book in user_history]
    
    # Find similar users (users who read the same books)
    response = (
        supabase.table("reading_history")
        .select("user_id, book_id, book_title, book_author, book_cover_url, created_at")
        .in_("book_id", user_book_ids)
        .neq("user_id", user_id)
        .eq("action_type", "viewed")
        .order("created_at", desc=False)
        .execute()
    )
    
    similar_users_data = response.data
    
    if not similar_users_data:
        return []
    
    # Group by user
    user_sequences = defaultdict(list)
    for record in similar_users_data:
        user_sequences[record["user_id"]].append(record)
    
    # Find book sequences and count occurrences
    book_recommendations = defaultdict(lambda: {"count": 0, "details": None})
    
    for other_user_id, history in user_sequences.items():
        sequences = find_book_sequences(history)
        
        for current_book, next_book in sequences:
            # Only recommend if current book is in user's history
            # and next book is NOT in user's history
            if current_book in user_book_ids and next_book not in user_book_ids:
                book_recommendations[next_book]["count"] += 1
                
                # Store book details
                if book_recommendations[next_book]["details"] is None:
                    book_detail = next(
                        (b for b in history if b["book_id"] == next_book), None
                    )
                    if book_detail:
                        book_recommendations[next_book]["details"] = {
                            "book_id": book_detail["book_id"],
                            "book_title": book_detail["book_title"],
                            "book_author": book_detail.get("book_author"),
                            "book_cover_url": book_detail.get("book_cover_url"),
                        }
    
    # Convert to list and sort by count
    recommendations = []
    for book_id, data in book_recommendations.items():
        if data["details"]:
            recommendations.append(
                {
                    "user_id": user_id,
                    "recommended_book_id": book_id,
                    "recommended_book_title": data["details"]["book_title"],
                    "recommended_book_author": data["details"].get("book_author"),
                    "recommended_book_cover_url": data["details"].get("book_cover_url"),
                    "score": float(data["count"]),
                    "reason": f"{data['count']} users with similar reading patterns viewed this book",
                }
            )
    
    # Sort by score and take top 10
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:10]


def update_recommendations_for_all_users():
    """Generate and update recommendations for all users"""
    users = get_all_users()
    total_recommendations = 0
    
    print(f"Generating recommendations for {len(users)} users...")
    
    for user_id in users:
        try:
            # Generate recommendations
            recommendations = generate_recommendations_for_user(user_id)
            
            if recommendations:
                # Delete existing recommendations
                supabase.table("recommendations").delete().eq("user_id", user_id).execute()
                
                # Insert new recommendations
                supabase.table("recommendations").insert(recommendations).execute()
                
                total_recommendations += len(recommendations)
                print(f"✓ Generated {len(recommendations)} recommendations for user {user_id}")
            else:
                print(f"○ No recommendations for user {user_id}")
                
        except Exception as e:
            print(f"✗ Error generating recommendations for user {user_id}: {e}")
    
    print(f"\nCompleted! Generated {total_recommendations} total recommendations")


if __name__ == "__main__":
    print("Starting recommendation engine...")
    print(f"Timestamp: {datetime.now()}")
    update_recommendations_for_all_users()
