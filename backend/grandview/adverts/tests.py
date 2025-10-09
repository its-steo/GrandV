# tests.py
from django.test import TestCase
from django.contrib.admin.sites import AdminSite
from django.core.files.uploadedfile import SimpleUploadedFile
from adverts.models import Advert
from adverts.admin import AdvertAdmin
from django.core.exceptions import ValidationError

class AdvertAdminTest(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.advert_admin = AdvertAdmin(Advert, self.site)

    def test_file_url_with_valid_file(self):
        advert = Advert.objects.create(
            title="Test Advert",
            file=SimpleUploadedFile("test.pdf", b"file_content"),
            rate_category=90
        )
        result = self.advert_admin.file_url(advert)
        self.assertIn("View File", result)
        self.assertIn(advert.file.url, result)

    def test_file_url_with_no_file(self):
        advert = Advert(title="Test Advert", rate_category=90)
        advert.file = None
        advert.save = lambda *args, **kwargs: None  # Bypass save to allow null file for test
        result = self.advert_admin.file_url(advert)
        self.assertEqual(result, "No file")

    def test_file_url_with_empty_file(self):
        advert = Advert.objects.create(
            title="Test Advert",
            file="",  # Simulate empty file name
            rate_category=90
        )
        advert.file = ""  # Simulate empty file
        advert.save = lambda *args, **kwargs: None  # Bypass save
        result = self.advert_admin.file_url(advert)
        self.assertEqual(result, "No file")

class AdvertModelTest(TestCase):
    def test_create_advert_without_file(self):
        advert = Advert(title="Test Advert", rate_category=90)
        with self.assertRaises(ValidationError):
            advert.full_clean()  # Should raise ValidationError for missing file

    def test_create_advert_with_valid_file(self):
        advert = Advert(
            title="Test Advert",
            file=SimpleUploadedFile("test.pdf", b"file_content"),
            rate_category=90
        )
        advert.full_clean()  # Should not raise an error
        advert.save()
        self.assertIsNotNone(advert.file)