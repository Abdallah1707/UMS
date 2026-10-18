from django.test import TestCase
from django.contrib.auth import get_user_model
from staff.models import PerformanceReview
from datetime import date

User = get_user_model()

class PerformanceReviewTestCase(TestCase):
    def setUp(self):
        # Create admin user
        self.admin = User.objects.create_user(
            username='admin',
            password='admin123',
            user_type='admin',
            first_name='Admin',
            last_name='User'
        )
        
        # Create professor
        self.professor = User.objects.create_user(
            username='prof1',
            password='prof123',
            user_type='professor',
            first_name='John',
            last_name='Doe'
        )
    
    def test_create_performance_review(self):
        """Test creating a performance review"""
        review = PerformanceReview.objects.create(
            staff_member=self.professor,
            reviewer=self.admin,
            rating=5,
            review_period_start=date(2024, 1, 1),
            review_period_end=date(2024, 6, 30),
            comments='Excellent performance'
        )
        
        self.assertEqual(review.staff_member, self.professor)
        self.assertEqual(review.reviewer, self.admin)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.get_rating_display(), 'Excellent')
    
    def test_staff_member_reviews_relationship(self):
        """Test that staff member can access their reviews"""
        PerformanceReview.objects.create(
            staff_member=self.professor,
            reviewer=self.admin,
            rating=4,
            review_period_start=date(2024, 1, 1),
            review_period_end=date(2024, 6, 30),
            comments='Good work'
        )
        
        reviews = self.professor.performance_reviews.all()
        self.assertEqual(reviews.count(), 1)
        self.assertEqual(reviews.first().rating, 4)
