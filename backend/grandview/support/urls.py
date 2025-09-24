from django.urls import path
from .views import (
    SupportMessageListView, SupportPresignedUploadView, SupportPrivateMessageView, SupportCommentView,
    SupportLikeView, SupportPinMessageView, SupportMuteUserView,
    SupportBlockUserView, UserProfileView
)

urlpatterns = [
    path('support/messages/', SupportMessageListView.as_view(), name='support_messages'),
    path('support/messages/private/', SupportPrivateMessageView.as_view(), name='support_private_message'),
    path('support/messages/<int:message_id>/comment/', SupportCommentView.as_view(), name='support_comment'),
    path('support/messages/<int:message_id>/like/', SupportLikeView.as_view(), name='support_like'),
    path('support/messages/<int:message_id>/pin/', SupportPinMessageView.as_view(), name='support_pin'),
    path('support/users/<int:user_id>/mute/', SupportMuteUserView.as_view(), name='support_mute'),
    path('support/users/<int:user_id>/block/', SupportBlockUserView.as_view(), name='support_block'),
    path('support/users/<int:user_id>/profile/', UserProfileView.as_view(), name='user_profile'),
    path('support/upload/', SupportPresignedUploadView.as_view(), name='support_upload'),
]