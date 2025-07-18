// utils/notificationIcons.js
import user from '../assets/default_profile.png';
import heart from '../assets/noti/heart.svg';
import comment from '../assets/noti/comment.svg';
import group_new from '../assets/noti/group_new.svg';
import group from '../assets/noti/group.svg';
import group_off from '../assets/noti/group_off.svg';
import badge_earn from '../assets/noti/badge_earn.svg';
import badge_revoke from '../assets/noti/badge_revoke.svg';
import inquiry from '../assets/noti/inquiry.svg';
import blind from '../assets/noti/blind.svg';
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
      return group_new;

    case 'GROUP_ACCEPTED':
      return group;

    case 'FORCED_REMOVAL' :
      return group_off;

    case 'BADGE_EARNED':
      return badge_earn;

    case 'BADGE_REVOKED':
      return badge_revoke;

    case 'INQUIRY_ANSWERED':
      return inquiry;
    
    case 'BLIND_NOTIFICATION':
      return blind;
      
    default:
      return earth;
  }
};