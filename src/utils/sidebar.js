export const QUEST_SIDEBAR = (isAdmin = false) => {
  const basicMenus = [
    {
      label: '퀘스트와 뱃지',
      icon: '/icons/sidebar/badge.svg',
      path: '/quest'
    },
    {
      label: '퀘스트 목록',
      path: '/quest/list',
      submenu: true
    },
    {
      label: '뱃지 목록',
      path: '/quest/badge',
      submenu: true
    },
    {
      label: '내 퀘스트/뱃지',
      icon: '/icons/sidebar/record.svg',
      path: '/my-quest'
    },
    {
      label: '내 뱃지',
      path: '/my-quest/badge',
      submenu: true
    },
    {
      label: '내 퀘스트 기록',
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
      label: '퀘스트 관리',
      path: '/quest-admin/quest',
      submenu: true
    },
    {
      label: '뱃지 관리',
      path: '/quest-admin/badge',
      submenu: true
    },
    {
      label: '퀘스트 생성',
      path: '/quest-admin/quest/new',
      submenu: true
    },
    {
      label: '뱃지 생성',
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

export const TRAVELER_SIDEBAR = [
  {
    label: '여행자 동행 모집',
    icon: '/icons/sidebar/travelmate.svg',
    path: '/traveler/mate',
  },
  {
    label: '모집 글쓰기',
    path: '/traveler/mate/new',
    submenu: true
  },
  {
    label: '여행 정보 공유방',
    icon: '/icons/sidebar/travelinfo.svg',
    path: '/traveler/info',
  },
  {
    label: '공유방 만들기',
    path: '/traveler/info/new',
    submenu: true
  },
  {
    label: '내 여행자 모임',
    icon: '/icons/sidebar/my_traveler.svg',
    path: '/traveler/my'
  },
  {
    label: '게시판',
    icon: '/icons/sidebar/board.svg',
    path: '/board',
    submenu: [
      {
        label: '인기글',
        path: '/board/popular'
      },
      {
        label: '정보글',
        path: '/board/info'
      },
      {
        label: '추천글',
        path: '/board/recommend'
      },
      {
        label: '잡담글',
        path: '/board/chat'
      },
      {
        label: '질문글',
        path: '/board/question'
      }
    ]
  },
  {
    label: '내 게시판',
    icon: '/icons/sidebar/my_board.svg',
    path: '/board/my'
  },
  {
    label: '글쓰기',
    icon: '/icons/sidebar/write.svg',
    path: '/board/new'
  }
];