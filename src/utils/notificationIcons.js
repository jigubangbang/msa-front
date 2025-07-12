// utils/notificationIcons.js
import user from '../assets/default_profile.png';
import heart from '../assets/noti/heart.svg';
import comment from '../assets/noti/comment_green.svg';
import group from '../assets/noti/group.svg';
import groups from '../assets/noti/groups.svg';
import badge from '../assets/noti/badge.svg';
// import blind from '../assets/noti/badge.svg';
import admin from '../assets/noti/admin.svg';
import earth from '../assets/noti/earth.svg';

export const getNotificationIcon = (type) => {
  switch (type) {
    // 소셜/팔로우
    case 'FOLLOW':
      return user;

    case 'FEED_LIKED':
      return heart;

    case 'FEED_COMMENTED':
      return comment;

    case 'COM_COMMENTED':
      return comment;
    
    case 'GROUP_NEW_APPLICANT':
      return group;

    case 'GROUP_ACCEPTED':
      return groups;

    case 'BADGE_EARNED':
      return badge;

    case 'BADGE_REVOKED':
      return admin;

    case 'INQUIRY_ANSWERED':
      return admin;
    
    default:
      return earth;
  }
};