from django.utils import timezone  # FIXED: Correct import for timezone
import boto3
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from .models import SupportMessage, SupportComment, SupportLike, SupportMute, SupportBlock
from .serializers import SupportMessageSerializer, SupportCommentSerializer, SupportLikeSerializer, SupportMuteSerializer, SupportBlockSerializer, UserProfileSerializer
from accounts.models import CustomUser
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

# Define pagination class at the top to avoid NameError
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class SupportMessageListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        messages = SupportMessage.objects.filter(is_private=False).order_by('-is_pinned', '-created_at')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(messages, request)
        serializer = SupportMessageSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = SupportMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            logger.info(f"Message created by {request.user.username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportPrivateMessageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = SupportMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user, is_private=True)
            logger.info(f"Private message created by {request.user.username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportPresignedUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doc_type = request.data.get('doc_type', 'support_image')
        file_name = f"support/images/{request.user.username}_{doc_type}_{int(timezone.now().timestamp())}.{request.data.get('extension', 'jpg')}"
        content_type = request.data.get('content_type', 'image/jpeg')

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        presigned = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=file_name,
            Fields={'Content-Type': content_type, 'acl': 'private'},
            Conditions=[['content-length-range', 0, 5*1024*1024]],
            ExpiresIn=3600
        )
        return Response({'upload_url': presigned['url'], 'fields': presigned['fields'], 'key': file_name})

class SupportCommentView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request, message_id):
        comments = SupportComment.objects.filter(message_id=message_id, message__is_private=False)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(comments, request)
        serializer = SupportCommentSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, message_id):
        message = get_object_or_404(SupportMessage, id=message_id, is_private=False)
        serializer = SupportCommentSerializer(data=request.data, context={'request': request, 'message': message})
        if serializer.is_valid():
            serializer.save(user=request.user, message=message)
            logger.info(f"Comment created by {request.user.username} on message {message_id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Comment creation failed for user {request.user.username} on message {message_id}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(SupportMessage, id=message_id, is_private=False)
        serializer = SupportLikeSerializer(data={'message': message_id}, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user, message=message)
            logger.info(f"Like added by {request.user.username} on message {message_id}")
            return Response({"message": "Liked successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportPinMessageView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, message_id):
        message = get_object_or_404(SupportMessage, id=message_id)
        message.is_pinned = True
        message.save()
        logger.info(f"Message {message_id} pinned by {request.user.username}")
        return Response({"message": "Message pinned successfully"}, status=status.HTTP_200_OK)

class SupportMuteUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = SupportMuteSerializer(data={'user': user_id}, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {user.username} muted by {request.user.username}")
            return Response({"message": "User muted successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportBlockUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = SupportBlockSerializer(data={'user': user_id}, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {user.username} blocked by {request.user.username}")
            return Response({"message": "User blocked successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)