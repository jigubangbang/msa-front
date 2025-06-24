import React, { useState } from 'react';
import axios from 'axios';
import styles from './TravelTypeTest.module.css';

const QUESTIONS = [
  {
    question: '1. 여행을 떠나볼까? 어디로 갈지 먼저 생각해봐야지!',
    options: [
      '따뜻한 나라에서 여름 분위기를 느끼며 해변을 거닐고 싶어!',
      '더운 건 딱 질색! 선선하거나 쌀쌀한 나라로 떠나고 싶어.'
    ]
  },
  {
    question: '2. 가고 싶은 나라가 몇 군데 떠오르네! 이제 여행 방식을 정해볼까?',
    options: [
      '전문가에게 맡기는 게 편할 것 같아. 미리 짜여진 패키지나 투어를 알아볼래.',
      '자유로운 여행이 최고지! 이번엔 어떤 도시부터 둘러볼까?'
    ]
  },
  {
    question: '3. 그런데... 여행은 혼자 가는 걸까?',
    options: [
      '친구나 가족이랑 함께 가야지~ 내 계획에 잘 어울릴 사람을 떠올려본다.',
      '혼자 떠나는 여행도 좋아! 자유롭게 다니고 지금 바로 비행기랑 숙소부터 예약해야지~'
    ]
  },
  {
    question: '4. 벌써 밥 시간이네! 그런데 여행 가서 뭘 먹지?',
    options: [
      '현지 음식이 최고지! 그 나라의 맛을 느낄 수 있는 로컬 푸드를 먹을래.',
      '입맛에 안 맞으면 곤란하니까... 익숙하고 안전한 메뉴 위주로 먹을래.'
    ]
  },
  {
    question: '5. 이건 꼭 먹어야겠어! 이제 여행 중에 뭘 할지도 정해야지',
    options: [
      '유명한 산이나 바다! 등산, 다이빙 같은 액티비티를 해보고 싶어!',
      '아늑한 카페나 잔잔한 산책, 따뜻한 온천처럼 조용한 활동이 좋아.'
    ]
  },
  {
    question: '6. 이 활동도 좋고, 그 다음날엔 뭐하지?',
    options: [
      '그 나라 문화를 느끼고 싶어. 미술관이나 박물관, 역사 유적지를 방문해볼래.',
      '나는 초록이 좋아! 자연 경관을 즐기면서 트레킹 같은 힐링 여행을 하고 싶어.'
    ]
  },
  {
    question: '7. 좋아, 도시도 정했고 비행기표도 예매했어! 이제 숙소를 고르자',
    options: [
      '여행 중에는 잘 자는 게 중요하지! 고급 호텔이나 리조트로 예약할래.',
      '현지 감성 제대로 느끼려면 게스트하우스나 에어비앤비가 딱이지!'
    ]
  },
  {
    question: '8. 마음에 드는 숙소를 골랐어! 그런데 숙소까지는 어떻게 가지?',
    options: [
      '렌트카로 자유롭게 다닐래! 대중교통이 없는 곳도 마음껏 갈 수 있잖아.',
      '현지 분위기를 느끼려면 역시 대중교통이지! 루트부터 차근차근 알아봐야지.'
    ]
  },
  {
    question: '9. 이제 하고 싶은 것도 정했고, 예약만 남았어',
    options: [
      '여기가 마음에 쏙 들어! 언어가 안 통해도 번역기가 있으니 문제없어. 도전!',
      '그래도 기본적인 영어, 한국어는 통해야지. 언어가 통하는 곳으로 예약할래.'
    ]
  },
  {
    question: '10. 숙소 주변을 보니까 가보고 싶은 곳이 꽤 있네! 여기는 일정 중간에 넣자',
    options: [
      '근처에 유명 맛집이 있다던데! 웨이팅이 좀 있어도 꼭 가보고 싶어.',
      '조금만 걸어가면 조용한 골목이 있대. 로컬 감성이 가득하다던데 꼭 가봐야지.'
    ]
  },
  {
    question: '11. 여기는 거리가 생각보다 있네. 한 20분 정도 걸린대',
    options: [
      '여행 왔으면 하루에 2~3만 보쯤은 걸어야지! 20분 정도야 금방이지',
      '너무 많이 걷는 건 피하고 싶어. 다른 일정도 있으니까 여긴 걷지 말고 이동수단을 써야겠어.'
    ]
  },
  {
    question: '12. 마지막 날엔 쇼핑도 해야지!',
    options: [
      '여기 현지 브랜드가 그렇게 유명하대! 기념품도 챙기고 쇼핑몰 투어는 필수야!',
      '그냥 둘러보다가 괜찮은 게 있으면 간단히 살래. 필요한 것만 딱!'
    ]
  },
  {
    question: '13. 그런데 쇼핑은 뭘 사야 할까?',
    options: [
      '친구들이랑 부모님 선물은 꼭 사야지! 여긴 이게 유명하다던데, 이거 좋아 보인다!',
      '잘 다녀오는 게 가장 중요하지. 좋은 추억만 있으면 돼. 꼭 선물은 안 사도 괜찮아.'
    ]
  },
  {
    question: '14. 대략적인 계획은 다 세웠다! 이제 여행을 상상하니 설레는걸!',
    options: [
      '사진은 꼭 많이 찍어야지! 여행 일기장도 준비해야겠어.',
      '사진보다 내 눈으로 풍경과 분위기를 느끼고 싶어!'
    ]
  },
  {
    question: '15. 여행 가서 SNS는 어떻게 하지?',
    options: [
      '보조배터리는 필수! 실시간으로 SNS에 올리면서 여행을 공유할 거야.',
      '다녀와서 한 번에 정리해서 올릴래. 아니면 굳이 안 올려도 되지~ 내 기억이면 충분해.'
    ]
  }
];

const SCORES = {
  1: {
    1: { A: 2, B: 0, C: 0, D: 1, E: 1, F: 1, G: 2, H: 0, I: 0, J: 1 },
    2: { A: 0, B: 2, C: 1, D: 1, E: 0, F: 0, G: 0, H: 2, I: 1, J: 1 },
  },
  2: {
    1: { A: -1, B: 0, C: 2, D: 1, E: 0, F: -2, G: 0, H: 2, I: 4, J: -3 },
    2: { A: 3, B: 2, C: 1, D: 0, E: 1, F: 3, G: 2, H: 1, I: -1, J: 4 },
  },
  3: {
    1: { A: 1, B: 2, C: 0, D: 1, E: 1, F: 0, G: 1, H: 1, I: 1, J: -1 },
    2: { A: 2, B: 1, C: 1, D: 0, E: 1, F: 2, G: 0, H: 0, I: 0, J: 3 },
  },
  4: {
    1: { A: 1, B: 0, C: 0, D: 0, E: 0, F: 1, G: 4, H: 0, I: 0, J: 1 },
    2: { A: 0, B: 1, C: 1, D: 2, E: 0, F: 0, G: -1, H: 0, I: 1, J: 0 },
  },
  5: {
    1: { A: 4, B: -2, C: 1, D: 0, E: 1, F: 1, G: 1, H: 1, I: 1, J: 2 },
    2: { A: 0, B: 3, C: 1, D: 2, E: 2, F: 1, G: 0, H: 1, I: 0, J: 1 },
  },
  6: {
    1: { A: 1, B: 0, C: 0, D: 1, E: 1, F: 0, G: 0, H: 4, I: 1, J: 0 },
    2: { A: 2, B: 1, C: 1, D: 1, E: 0, F: 2, G: 1, H: 0, I: 0, J: 1 },
  },
  7: {
    1: { A: 1, B: 1, C: 2, D: 0, E: 1, F: 2, G: 0, H: 1, I: 1, J: 1 },
    2: { A: 0, B: 0, C: -1, D: 4, E: 1, F: 0, G: 0, H: 0, I: 0, J: 0 },
  },
  8: {
    1: { A: 2, B: 0, C: 1, D: 2, E: 1, F: 1, G: 0, H: 0, I: 1, J: 2 },
    2: { A: 0, B: 2, C: 2, D: 0, E: 0, F: 2, G: 1, H: 2, I: 1, J: 1 },
  },
  9: {
    1: { A: 2, B: 1, C: 0, D: 0, E: 0, F: 3, G: 1, H: 2, I: 0, J: 3 },
    2: { A: 0, B: 1, C: 1, D: 2, E: 1, F: 0, G: 0, H: 0, I: 1, J: 0 },
  },
  10: {
    1: { A: 2, B: 0, C: 0, D: 2, E: 2, F: 0, G: 2, H: 0, I: 1, J: 1 },
    2: { A: 0, B: 3, C: 1, D: 0, E: 1, F: 2, G: 0, H: 2, I: 0, J: 2 },
  },
  11: {
    1: { A: 2, B: 2, C: 1, D: 0, E: 1, F: 2, G: 1, H: 1, I: 1, J: 1 },
    2: { A: 0, B: 0, C: 1, D: 2, E: 0, F: 0, G: 0, H: 0, I: 0, J: 1 },
  },
  12: {
    1: { A: 0, B: 0, C: -1, D: 2, E: 2, F: -1, G: 1, H: 0, I: 0, J: 0 },
    2: { A: 1, B: 1, C: 2, D: 0, E: 0, F: 2, G: 0, H: 1, I: 1, J: 1 },
  },
  13: {
    1: { A: 1, B: 0, C: 0, D: 1, E: 2, F: 0, G: 1, H: 0, I: 1, J: 0 },
    2: { A: 0, B: 2, C: 1, D: 0, E: 0, F: 1, G: 0, H: 1, I: 0, J: 1 },
  },
  14: {
    1: { A: 1, B: 0, C: 0, D: 1, E: 4, F: 0, G: 1, H: 0, I: 1, J: 0 },
    2: { A: 0, B: 2, C: 1, D: 0, E: -1, F: 1, G: 0, H: 1, I: 0, J: 1 },
  },
  15: {
    1: { A: 1, B: 0, C: 0, D: 1, E: 4, F: 0, G: 1, H: 0, I: 0, J: 0 },
    2: { A: 0, B: 1, C: 1, D: 1, E: -1, F: 1, G: 0, H: 1, I: 1, J: 1 },
  }
};

const RESULT_TYPES = {
  A: '열정폭발러',
  B: '휴식중심러',
  C: '계획왕여행자',
  D: '로컬러버',
  E: '기록러버',
  F: '혼행마스터',
  G: '맛집헌터',
  H: '문화수집러',
  I: '자연러버',
  J: '실속낭만러',
};

const TravelTypeTest = () => {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelect = (qIdx, optionIdx) => {
    const newAnswers = { ...answers, [qIdx + 1]: optionIdx + 1 };
    setAnswers(newAnswers);
    if (Object.keys(newAnswers).length === QUESTIONS.length) {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (answerObj) => {
    const finalScore = {
      A: 0, B: 0, C: 0, D: 0, E: 0,
      F: 0, G: 0, H: 0, I: 0, J: 0
    };

    Object.entries(answerObj).forEach(([q, opt]) => {
      const scores = SCORES[q][opt];
      Object.entries(scores).forEach(([type, val]) => {
        finalScore[type] += val;
      });
    });

    const bestType = Object.entries(finalScore).sort((a, b) => b[1] - a[1])[0][0];
    setResult(bestType);
    setShowResult(true);

    axios.post('/api/result', {
      type: bestType,
      score: finalScore
    }).catch(err => console.error(err));
  };

  if (showResult) {
    return (
        <div className={styles.resultContainer}>
        <h2 className={styles.resultTitle}>당신의 여행자 유형은?</h2>
        <p className={styles.resultType}>{RESULT_TYPES[result]} ({result})</p>
        </div>
    );
    }

  return (
    <div className={styles.container}>
        {QUESTIONS.map((q, idx) => (
            <div key={idx} className={styles.questionBlock}>
            <h3 className={styles.questionTitle}>{q.question}</h3>
            {q.options.map((opt, oIdx) => (
                <button
                key={oIdx}
                className={`${styles.optionButton} ${answers[idx + 1] === oIdx + 1 ? styles.selected : ''}`}
                onClick={() => handleSelect(idx, oIdx)}
                >
                {opt}
                </button>
            ))}
            </div>
        ))}
    </div>

  );
};

export default TravelTypeTest;
