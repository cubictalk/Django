# core/utils.py
import random

def generate_dummy_title(level: str) -> str:
    topics = {
        "beginner": [
            "My Favorite Animal",
            "A Day at School",
            "What I Like to Eat"
        ],
        "intermediate": [
            "The Importance of Exercise",
            "A Memorable Family Trip",
            "How Technology Changes Our Life"
        ],
        "advanced": [
            "The Impact of Climate Change",
            "The Pros and Cons of Social Media",
            "What Makes a Good Leader"
        ],
    }
    return random.choice(topics.get(level, topics["beginner"]))
