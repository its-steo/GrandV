from django.utils import timezone
import boto3
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from .models import SupportMessage, SupportComment, SupportLike, SupportMute, SupportBlock, PrivateMessage
from .serializers import SupportMessageSerializer, SupportCommentSerializer, SupportLikeSerializer, SupportMuteSerializer, SupportBlockSerializer, UserProfileSerializer, PrivateMessageSerializer
from accounts.models import CustomUser
from django.shortcuts import get_object_or_404
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class SupportMessageListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        messages = SupportMessage.objects.filter(is_private=False).order_by('created_at')  # Ascending for newest at bottom
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(messages, request)
        serializer = SupportMessageSerializer(page, many=True, context={'request': request})
        # Update last_support_view for authenticated users
        if request.user.is_authenticated:
            request.user.last_support_view = timezone.now()
            request.user.save()
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
        comments = SupportComment.objects.filter(message_id=message_id, message__is_private=False).order_by('created_at')
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

class AdminListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        admins = CustomUser.objects.filter(Q(is_staff=True) | Q(is_manager=True))
        serializer = UserProfileSerializer(admins, many=True)
        return Response(serializer.data)

class PrivateMessageListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    parser_classes = [MultiPartParser, FormParser]  # Add this to support image uploads via FormData

    def get(self, request, receiver_id=None):
        if receiver_id:
            messages = PrivateMessage.objects.filter(
                (Q(sender=request.user, receiver_id=receiver_id) | Q(sender_id=receiver_id, receiver=request.user))
            ).order_by('created_at')
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(messages, request)
            serializer = PrivateMessageSerializer(page, many=True)
            # Mark messages as read
            unread_messages = messages.filter(receiver=request.user, read_at__isnull=True)
            for msg in unread_messages:
                msg.read_at = timezone.now()
                msg.save()
            return paginator.get_paginated_response(serializer.data)
        else:
            sent = PrivateMessage.objects.filter(sender=request.user).values('receiver__id', 'receiver__username').distinct()
            received = PrivateMessage.objects.filter(receiver=request.user).values('sender__id', 'sender__username').distinct()
            conversations = set()
            for s in sent:
                conversations.add((s['receiver__id'], s['receiver__username']))
            for r in received:
                conversations.add((r['sender__id'], r['sender__username']))
            # Calculate unread counts per conversation
            convos_with_unread = []
            for cid, username in conversations:
                unread_count = PrivateMessage.objects.filter(
                    receiver=request.user, sender_id=cid, read_at__isnull=True
                ).count()
                convos_with_unread.append({'id': cid, 'username': username, 'unread_count': unread_count})
            return Response(convos_with_unread)

    def post(self, request):
        serializer = PrivateMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(sender=request.user)
            logger.info(f"Private message sent by {request.user.username} to {serializer.validated_data['receiver'].username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Private message creation failed for user {request.user.username}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)