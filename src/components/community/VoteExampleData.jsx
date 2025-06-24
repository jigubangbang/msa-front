// 기본 투표 예시 데이터
export const basicVoteData = {
  id: "vote_001",
  user_id: "admin123",
  post_id: "post_456",
  title: "점심 메뉴 투표",
  end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
  is_multiple_choice: false,
  max_choices: 1,
  is_anonymous: false,
  is_official: false,
  blind_status: 'VISIBLE',
  options: [
    {
      id: "opt_001",
      vote_id: "vote_001",
      option_title: "김치찌개",
      vote_count: 15
    },
    {
      id: "opt_002",
      vote_id: "vote_001",
      option_title: "된장찌개",
      vote_count: 8
    },
    {
      id: "opt_003",
      vote_id: "vote_001",
      option_title: "순두부찌개",
      vote_count: 12
    }
  ]
};

// 중복 선택 가능한 투표 예시
export const multipleChoiceVoteData = {
  id: "vote_002",
  user_id: "admin123",
  post_id: "post_789",
  title: "회사 복지 개선 항목 (최대 3개 선택)",
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
  created_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
  is_multiple_choice: true,
  max_choices: 3,
  is_anonymous: true,
  is_official: true,
  blind_status: 'VISIBLE',
  options: [
    {
      id: "opt_004",
      vote_id: "vote_002",
      option_title: "재택근무 확대",
      vote_count: 45
    },
    {
      id: "opt_005",
      vote_id: "vote_002",
      option_title: "점심 식비 지원 증액",
      vote_count: 38
    },
    {
      id: "opt_006",
      vote_id: "vote_002",
      option_title: "헬스장 이용권 지원",
      vote_count: 32
    },
    {
      id: "opt_007",
      vote_id: "vote_002",
      option_title: "교육비 지원 확대",
      vote_count: 28
    },
    {
      id: "opt_008",
      vote_id: "vote_002",
      option_title: "휴가일 추가",
      vote_count: 41
    }
  ]
};

// 블라인드 투표 예시 (결과 숨김)
export const blindVoteData = {
  id: "vote_003",
  user_id: "admin123",
  post_id: "post_321",
  title: "팀장 후보 선출",
  end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
  created_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1시간 전
  is_multiple_choice: false,
  max_choices: 1,
  is_anonymous: true,
  is_official: true,
  blind_status: 'BLINDED',
  options: [
    {
      id: "opt_009",
      vote_id: "vote_003",
      option_title: "김민수",
      vote_count: 8
    },
    {
      id: "opt_010",
      vote_id: "vote_003",
      option_title: "이영희",
      vote_count: 12
    },
    {
      id: "opt_011",
      vote_id: "vote_003",
      option_title: "박철수",
      vote_count: 6
    }
  ]
};

// 종료된 투표 예시
export const expiredVoteData = {
  id: "vote_004",
  user_id: "admin123",
  post_id: "post_654",
  title: "사무실 간식 선택",
  end_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전 종료
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
  is_multiple_choice: false,
  max_choices: 1,
  is_anonymous: false,
  is_official: false,
  blind_status: 'VISIBLE',
  options: [
    {
      id: "opt_012",
      vote_id: "vote_004",
      option_title: "과자류",
      vote_count: 22
    },
    {
      id: "opt_013",
      vote_id: "vote_004",
      option_title: "과일",
      vote_count: 18
    },
    {
      id: "opt_014",
      vote_id: "vote_004",
      option_title: "견과류",
      vote_count: 13
    },
    {
      id: "opt_015",
      vote_id: "vote_004",
      option_title: "음료",
      vote_count: 25
    }
  ]
};

// 투표 수가 적은 초기 투표 예시
export const earlyVoteData = {
  id: "vote_005",
  user_id: "user456",
  post_id: "post_987",
  title: "다음 프로젝트 기술 스택",
  end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일 후
  created_at: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
  is_multiple_choice: true,
  max_choices: 2,
  is_anonymous: false,
  is_official: false,
  blind_status: 'VISIBLE',
  options: [
    {
      id: "opt_016",
      vote_id: "vote_005",
      option_title: "React + TypeScript",
      vote_count: 3
    },
    {
      id: "opt_017",
      vote_id: "vote_005",
      option_title: "Vue.js + JavaScript",
      vote_count: 1
    },
    {
      id: "opt_018",
      vote_id: "vote_005",
      option_title: "Svelte + TypeScript",
      vote_count: 2
    },
    {
      id: "opt_019",
      vote_id: "vote_005",
      option_title: "Angular + TypeScript",
      vote_count: 0
    }
  ]
};
