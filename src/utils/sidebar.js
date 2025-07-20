export const QUEST_SIDEBAR = (isAdmin = false) => {
  const basicMenus = [
    {
      label: '도전 챌린지',
      icon: '/icons/sidebar/badge.svg',
      path: '/quest',
      needLogin: false,
      submenus: [
        {
          label: '퀘스트 목록',
          path: '/quest/list',
          needLogin: false
        },
        {
          label: '뱃지 목록',
          path: '/quest/badge',
          needLogin: false
        }
      ]
    },
    {
      label: '내 챌린지 기록',
      icon: '/icons/sidebar/record.svg',
      path: '/my-quest',
      needLogin: true,
      submenus: [
        {
          label: '내 퀘스트',
          path: '/my-quest/record',
          needLogin: true
        },
        {
          label: '내 뱃지',
          path: '/my-quest/badge',
          needLogin: true
        }
      ]
    },
    {
      label: '회원 랭킹',
      icon: '/icons/sidebar/user_search.svg',
      path: '/rank/list',
      needLogin: false
    }
  ];

  const adminMenus = [
    {
      label: '퀘스트/뱃지 관리',
      icon: '/icons/sidebar/quest_manage.svg',
      path: '/quest-admin/quest',
      needLogin: true,
      submenus: [
        {
          label: '퀘스트 관리',
          path: '/quest-admin/quest',
          needLogin: true
        },
        {
          label: '뱃지 관리',
          path: '/quest-admin/badge',
          needLogin: true
        },
        {
          label: '퀘스트 생성',
          path: '/quest-admin/quest/new',
          needLogin: true
        },
        {
          label: '뱃지 생성',
          path: '/quest-admin/badge/new',
          needLogin: true
        }
      ]
    },
    {
      label: '관리자 페이지',
      icon: '/icons/sidebar/back_admin.svg',
      path: '/admin/users',
      needLogin: true
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

export const TRAVELER_SIDEBAR = [
  {
    label: '여행 메이트',
    icon: '/icons/sidebar/travelmate.svg',
    path: '/traveler/mate',
    needLogin: false,
    submenus: [
      {
        label: '모임 둘러보기',
        path: '/traveler/mate',
        needLogin: false
      },
      {
        label: '모임 생성',
        path: '/traveler/mate/new',
        needLogin: true
      }
    ]
  },
  {
    label: '여행 정보 공유',
    icon: '/icons/sidebar/travelinfo.svg',
    path: '/traveler/info',
    needLogin: false,
    submenus: [
      {
        label: '공유방 둘러보기',
        path: '/traveler/info',
        needLogin: false
      },
      {
        label: '공유방 생성',
        path: '/traveler/info/new',
        needLogin: true
      }
    ]
  },
  {
    label: '자유 게시판',
    icon: '/icons/sidebar/board.svg',
    path: '/board/popular',
    needLogin: false,
    submenus: [
      {
        label: '게시글 작성',
        path: '/board/new',
        needLogin: true
      },
      {
        label: '내 글 관리',
        path: '/board/my',
        needLogin: true
      },
    ]
  },
  {
    label: '내 그룹 관리',
    icon: '/icons/sidebar/my_traveler.svg',
    path: '/traveler/my',
    needLogin: true,
    submenus: [
      {
        label: '내 여행 모임',
        path: '/traveler/my/travelmate',
        needLogin: true
      },
      {
        label: '내 정보 공유방',
        path: '/traveler/my/travelinfo',
        needLogin: true
      }
    ]
  }
];

export const ADMIN_SIDEBAR = [
  {
    label: '회원 관리',
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
        label: '그룹 관리',
        path: '/admin/content/groups'
      }
    ]
  },
  {
    label: '퀘스트/뱃지 관리',
    icon: '/icons/sidebar/quest_manage.svg',
    path: '/quest-admin/quest'
  },
  {
    label: '신고 내역',
    icon: '/icons/sidebar/report.svg',
    path: '/admin/reports'
  },
  {
    label: '1:1 문의 내역',
    icon: '/icons/sidebar/inquiry.svg',
    path: '/admin/inquiries'
  }
];

export const FEED_SIDEBAR = (isLoggedIn = false) => {
  const basicMenus = [
    {
      label: '피드 홈',
      icon: '/icons/sidebar/home.svg',
      path: '/feed', 
      needLogin: false
    },
    {
      label: '탐색',
      icon: '/icons/sidebar/search.svg',
      path: '/feed/search', 
      needLogin: false
    }
  ]
  const userMenus = [
    {
      label: '피드 홈',
      icon: '/icons/sidebar/home.svg',
      path: '/feed', 
      needLogin: false
    },
    {
      label: '탐색',
      icon: '/icons/sidebar/search.svg',
      path: '/feed/search', 
      needLogin: false
    },
    {
      label: '팔로우',
      icon: '/icons/sidebar/follow.svg',
      path: '/feed/following'
    },
    {
      label: '북마크',
      icon: '/icons/sidebar/bookmark.svg',
      path: '/feed/bookmark'
    },
    {
      label: '친구 추천',
      icon: '/icons/sidebar/user_recommendation.svg',
      path: '/feed/recommendation'
    }
  ]
  return !isLoggedIn ? basicMenus : userMenus;
}