export const QUEST_SIDEBAR = (isAdmin = false) => {
  const basicMenus = [
    {
      label: '퀘스트와 뱃지',
      icon: '/icons/sidebar/badge.svg',
      path: '/quest',
      submenus: [
        {
          label: '퀘스트 목록',
          path: '/quest/list'
        },
        {
          label: '뱃지 목록',
          path: '/quest/badge'
        }
      ]
    },
    {
      label: '내 퀘스트/뱃지',
      icon: '/icons/sidebar/record.svg',
      path: '/my-quest',
      submenus: [
        {
          label: '내 뱃지',
          path: '/my-quest/badge'
        },
        {
          label: '내 퀘스트 기록',
          path: '/my-quest/record'
        }
      ]
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
      path: '/quest-admin/quest',
      submenus: [
        {
          label: '퀘스트 관리',
          path: '/quest-admin/quest'
        },
        {
          label: '뱃지 관리',
          path: '/quest-admin/badge'
        },
        {
          label: '퀘스트 생성',
          path: '/quest-admin/quest/new'
        },
        {
          label: '뱃지 생성',
          path: '/quest-admin/badge/new'
        }
      ]
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
    path: '/admin/content/posts', 
    submenus: [
      {
        label: '게시글 관리',
        path: '/admin/content/posts'
      },
      {
        label: '댓글 관리',
        path: '/admin/content/comments'
      },
      {
        label: '모임 관리',
        path: '/admin/content/groups'
      }
    ]
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