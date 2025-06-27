import React, { useState } from 'react';
import Vote from '../../components/community/Vote';
import VoteCreate from '../../components/community/VoteCreate';
import {
  basicVoteData,
  multipleChoiceVoteData,
  blindVoteData,
  expiredVoteData,
  earlyVoteData,
} from '../../components/community/voteExampleData.jsx';

function TestPage() {
  const [currentVoteData, setCurrentVoteData] = useState(basicVoteData);
  const [selectedExample, setSelectedExample] = useState('basic');

  // 투표 제출 핸들러
  const handleVoteSubmit = (voteResults) => {
    console.log('투표 제출:', voteResults);
    alert(`투표가 완료되었습니다! ${voteResults.length}개 항목에 투표했습니다.`);
  };

  // 투표 생성/업데이트 핸들러
  const handleVoteUpdate = (vote, options) => {
    console.log('투표 생성/업데이트:', { vote, options });

    const newVoteId = vote.id || `vote_${Date.now()}`;
    const newVoteData = {
      ...vote,
      id: newVoteId,
      user_id: vote.user_id || 'user123',
      options: options.map((option, index) => ({
        ...option,
        id: option.id || `opt_${Date.now()}_${index}`,
        vote_id: newVoteId,
      })),
    };

    alert('투표가 생성되었습니다!');
    setCurrentVoteData(newVoteData);
    setSelectedExample('created');
  };

  // 예시 데이터
  const exampleData = {
    basic: basicVoteData,
    multiple: multipleChoiceVoteData,
    blind: blindVoteData,
    expired: expiredVoteData,
    early: earlyVoteData,
    create: null,
    created: currentVoteData,
  };

  const exampleTitles = {
    basic: '기본 투표 (점심 메뉴)',
    multiple: '중복 선택 투표 (복지 개선)',
    blind: '블라인드 투표 (팀장 선출)',
    expired: '종료된 투표 (간식 선택)',
    early: '초기 투표 (기술 스택)',
    create: '새 투표 만들기',
    created: '생성된 투표',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Vote 컴포넌트 예시</h1>

      {/* 예시 선택 버튼들 */}
      <div style={{ marginBottom: '30px' }}>
        <h3>예시 선택:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(exampleTitles).map(([key, title]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedExample(key);
                if (key !== 'create') setCurrentVoteData(exampleData[key]);
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: selectedExample === key ? '#007bff' : 'white',
                color: selectedExample === key ? 'white' : 'black',
                cursor: 'pointer',
              }}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 예시 설명 */}
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          border: '1px solid #dee2e6',
        }}
      >
        <h4>현재 예시: {exampleTitles[selectedExample]}</h4>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          {selectedExample === 'basic' && '단일 선택, 결과 공개, 일반 투표'}
          {selectedExample === 'multiple' && '중복 선택 (최대 3개), 익명, 공식 투표'}
          {selectedExample === 'blind' && '단일 선택, 익명, 공식, 결과 숨김'}
          {selectedExample === 'expired' && '종료된 투표, 결과만 확인 가능'}
          {selectedExample === 'early' && '중복 선택 (최대 2개), 투표 수 적음'}
          {selectedExample === 'create' && '새로운 투표를 만들어보세요'}
          {selectedExample === 'created' && '방금 생성한 투표입니다'}
        </p>
      </div>

      {/* 투표 컴포넌트 또는 생성 컴포넌트 */}
      {selectedExample === 'create' ? (
        <VoteCreate onVoteUpdate={handleVoteUpdate} />
      ) : (
        <Vote
          voteData={currentVoteData}
          onVoteSubmit={handleVoteSubmit}
          currentUserId="user123"
        />
      )}

      {/* 개발자 안내 */}
      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f1f3f4',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        <h4>개발자 정보:</h4>
        <p>• 브라우저 콘솔을 열어서 투표 이벤트 로그를 확인해보세요</p>
        <p>• 다양한 예시를 클릭해서 각기 다른 투표 유형을 테스트해보세요</p>
        <p>• "새 투표 만들기"를 통해 커스텀 투표를 생성할 수 있습니다</p>
      </div>
    </div>
  );
}

export default TestPage;
