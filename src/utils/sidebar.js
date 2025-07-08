export const QUEST_SIDEBAR = (isAdmin = false) => {
  const basicMenus = [
    {
      label: '퀘스트와 뱃지',
      icon: '/icons/sidebar/badge.svg',
      path: '/quest'
    },
    {
      label: '–\u00A0\u00A0\u00A0퀘스트 목록',
      path: '/quest/list',
      submenu: true
    },
    {
      label: '–\u00A0\u00A0\u00A0뱃지 목록',
      path: '/quest/badge',
      submenu: true
    },
    {
      label: '내 퀘스트/뱃지',
      icon: '/icons/sidebar/record.svg',
      path: '/my-quest'
    },
    {
      label: '–\u00A0\u00A0\u00A0내 뱃지',
      path: '/my-quest/badge',
      submenu: true
    },
    {
      label: '–\u00A0\u00A0\u00A0내 퀘스트 기록',
      path: '/my-quest/record',
      submenu: true
    },
    {
      label: '유저들',
      icon: '/icons/sidebar/user_search.svg',
      path: '/rank/list'
    }
  ];

  const adminMenus = [
    {
      label: '관리자 메뉴',
      icon: '/icons/sidebar/admin.svg',
      path: '/quest-admin/quest'
    },
    {
      label: '–\u00A0\u00A0\u00A0퀘스트 관리',
      path: '/quest-admin/quest',
      submenu: true
    },
    {
      label: '–\u00A0\u00A0\u00A0뱃지 관리',
      path: '/quest-admin/badge',
      submenu: true
    },
    {
      label: '–\u00A0\u00A0\u00A0퀘스트 생성',
      path: '/quest-admin/quest/new',
      submenu: true
    },
    {
      label: '–\u00A0\u00A0\u00A0뱃지 생성',
      path: '/quest-admin/badge/new',
      submenu: true
    }
  ];

  return isAdmin ? [...basicMenus, ...adminMenus] : basicMenus;
};

export const USER_SIDEBAR = [
  {
    label: '회원 정보 수정',
    icon: '/icons/sidebar/manage.svg',
    path: '/user/manage'
  },
  {
    label: '프리미엄',
    icon: '/icons/sidebar/premium.svg',
    path: '/user/premium'
  },
  {
    label: '1:1 문의',
    icon: '/icons/sidebar/inquiry.svg',
    path: '/user/inquiry'
  },
  {
    label: '회원 탈퇴',
    icon: '/icons/sidebar/withdraw.svg',
    path: '/user/withdraw'
  }
];

export const ADMIN_SIDEBAR = [
  {
    label: '사용자 관리',
    icon: '/icons/sidebar/user.svg',
    path: '/admin/users'
  },
  {
    label: '콘텐츠 관리',
    icon: '/icons/sidebar/content.svg',
    path: '/admin/content'
  },
  {
    label: '–\u00A0\u00A0\u00A0게시글 관리',
    path: '/admin/content/posts',
    submenu: true
  },
  {
    label: '–\u00A0\u00A0\u00A0댓글 관리',
    path: '/admin/content/comments',
    submenu: true
  },
  {
    label: '–\u00A0\u00A0\u00A0모임 관리',
    path: '/admin/content/groups',
    submenu: true
  },
  {
    label: '퀘스트/뱃지 관리',
    icon: '/icons/sidebar/quest.svg',
    path: '/quest-admin/quest'
  },
  {
    label: '신고 내역',
    icon: '/icons/sidebar/report.svg',
    path: '/admin/reports'
  },
  {
    label: '1:1 문의',
    icon: '/icons/sidebar/inquiry.svg',
    path: '/admin/inquiries'
  }
];
