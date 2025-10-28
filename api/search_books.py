"""
Python backend for Book Finder API
Handles Open Library API calls and data processing
"""

import requests
import json
from typing import Dict, List, Optional
from urllib.parse import quote

class BookSearchAPI:
    """Handle book search operations with Open Library API"""
    
    BASE_URL = "https://openlibrary.org/search.json"
    
    @staticmethod
    def search_by_title(title: str, limit: int = 20) -> Dict:
        """
        Search books by title
        
        Args:
            title: Book title to search
            limit: Maximum number of results (default: 20)
            
        Returns:
            Dictionary with search results or error
        """
        try:
            params = {
                'title': title,
                'limit': limit
            }
            response = requests.get(BookSearchAPI.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {'error': f'Failed to search by title: {str(e)}'}
    
    @staticmethod
    def search_by_author(author: str, limit: int = 20) -> Dict:
        """
        Search books by author
        
        Args:
            author: Author name to search
            limit: Maximum number of results (default: 20)
            
        Returns:
            Dictionary with search results or error
        """
        try:
            params = {
                'author': author,
                'limit': limit
            }
            response = requests.get(BookSearchAPI.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {'error': f'Failed to search by author: {str(e)}'}
    
    @staticmethod
    def search_by_isbn(isbn: str) -> Dict:
        """
        Search books by ISBN
        
        Args:
            isbn: ISBN number to search
            
        Returns:
            Dictionary with search results or error
        """
        try:
            params = {
                'isbn': isbn,
                'limit': 5
            }
            response = requests.get(BookSearchAPI.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {'error': f'Failed to search by ISBN: {str(e)}'}
    
    @staticmethod
    def transform_book_data(doc: Dict) -> Dict:
        """
        Transform Open Library API response to standardized format
        
        Args:
            doc: Raw document from Open Library API
            
        Returns:
            Transformed book data
        """
        return {
            'key': doc.get('key', ''),
            'title': doc.get('title', 'Unknown Title'),
            'author': doc.get('author_name', ['Unknown Author'])[0] if doc.get('author_name') else 'Unknown Author',
            'authors': doc.get('author_name', []),
            'year': doc.get('first_publish_year', 'N/A'),
            'isbn': doc.get('isbn', ['N/A'])[0] if doc.get('isbn') else 'N/A',
            'coverId': doc.get('cover_i'),
            'description': doc.get('description', 'No description available'),
            'pages': doc.get('number_of_pages_median', 'N/A'),
            'language': doc.get('language', ['en'])[0] if doc.get('language') else 'en'
        }
    
    @staticmethod
    def get_books(search_type: str, query: str, limit: int = 20) -> Dict:
        """
        Main method to search books with error handling
        
        Args:
            search_type: Type of search ('title', 'author', 'isbn')
            query: Search query string
            limit: Maximum number of results
            
        Returns:
            Dictionary with transformed book data or error
        """
        if not query or not query.strip():
            return {'error': 'Search query cannot be empty'}
        
        # Call appropriate search method
        if search_type == 'title':
            result = BookSearchAPI.search_by_title(query, limit)
        elif search_type == 'author':
            result = BookSearchAPI.search_by_author(query, limit)
        elif search_type == 'isbn':
            result = BookSearchAPI.search_by_isbn(query)
        else:
            return {'error': f'Invalid search type: {search_type}'}
        
        # Handle errors
        if 'error' in result:
            return result
        
        # Transform results
        if 'docs' not in result or not result['docs']:
            return {'docs': [], 'numFound': 0}
        
        transformed_docs = [BookSearchAPI.transform_book_data(doc) for doc in result['docs']]
        
        return {
            'docs': transformed_docs,
            'numFound': result.get('numFound', len(transformed_docs))
        }


# Example usage for testing
if __name__ == '__main__':
    # Test title search
    print("Testing title search for 'The Great Gatsby':")
    result = BookSearchAPI.get_books('title', 'The Great Gatsby', limit=5)
    print(json.dumps(result, indent=2))
    
    # Test author search
    print("\nTesting author search for 'J.K. Rowling':")
    result = BookSearchAPI.get_books('author', 'J.K. Rowling', limit=5)
    print(json.dumps(result, indent=2))
