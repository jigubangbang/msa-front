// VoteCreate.jsx
import React, { useState, useEffect } from 'react';
import styles from './VoteCreate.module.css';

const VoteCreate = ({ onVoteUpdate }) => {
  const [vote, setVote] = useState({
    id: '',
    user_id: '',
    post_id: '',
    title: '',
    end_date: null,
    created_at: new Date(),
    is_multiple_choice: false,
    max_choices: 1,
    is_anonymous: false,
    is_official: false,
    blind_status: 'VISIBLE'
  });

  

  const [voteOptions, setVoteOptions] = useState([
    { id: '1', vote_id: '', option_title: '', vote_count: 0 },
    { id: '2', vote_id: '', option_title: '', vote_count: 0 }
  ]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
      setIsAdmin(false);
  }, []);

  const updateVoteSettings = (field, value) => {
    setVote(prev => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    const newOption = {
      id: Date.now().toString(),
      vote_id: '',
      option_title: '',
      vote_count: 0
    };
    setVoteOptions([...voteOptions, newOption]);
  };

  const removeOption = (optionId) => {
    if (voteOptions.length > 2) {
      setVoteOptions(voteOptions.filter(option => option.id !== optionId));
    }
  };

  const updateOption = (optionId, title) => {
    setVoteOptions(voteOptions.map(option =>
      option.id === optionId ? { ...option, option_title: title } : option
    ));
  };

  return (
    <div className={styles.voteContainer}>
      <div className={styles.contentPadding}>
        <h3 className={styles.voteTitle}>새 투표 만들기</h3>
        <div className={styles.badgeContainer}>
                        {vote.is_official && <span className={`${styles.badge} ${styles.badgeOfficial}`}>공식</span>}
                {vote.is_anonymous && <span className={`${styles.badge} ${styles.badgeAnonymous}`}>익명</span>}
                {vote.is_multiple_choice && (
                    <span className={`${styles.badge} ${styles.badgeMultiple}`}>
                    중복선택 (최대 {vote.max_choices}개)
                    </span>
                )}
        </div>

        <div className={styles.formGroup}>
          <h3 className={styles.voteSubtitle}>투표 제목</h3>
          <input
            type="text"
            className={styles.input}
            placeholder="투표 제목을 입력하세요"
            value={vote.title}
            onChange={(e) => updateVoteSettings('title', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
            


            
          <h3 className={styles.voteSubtitle}>투표 마감일</h3>
          <input
            type="datetime-local"
            className={styles.input}
            value={vote.end_date ? new Date(vote.end_date).toISOString().slice(0, 16) : ''}
            onChange={(e) => updateVoteSettings('end_date', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <h3 className={styles.voteSubtitle}>투표 항목</h3>
          {voteOptions.map((option, index) => (
            <div key={option.id} className={styles.optionContainer}>
              <input
                type="text"
                placeholder={`선택지 ${index + 1}`}
                value={option.option_title}
                onChange={(e) => updateOption(option.id, e.target.value)}
                className={styles.optionInput}
              />
              {voteOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className={styles.removeButton}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {voteOptions.length < 10 && (
            <button
                type="button"
                onClick={addOption}
                className={styles.addOptionButton}
            >
                + 선택지 추가
            </button>
            )}
        </div>

        

        <div className={styles.settingsPanel}>
            {isAdmin && 
                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        checked={vote.is_official}
                        onChange={(e) => updateVoteSettings('is_official', e.target.checked)}
                        className={styles.checkbox}
                    />
                    <label className={styles.voteText}>공식 투표 여부</label>
                </div>
            }

        <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    checked={vote.is_anonymous}
                    onChange={(e) => updateVoteSettings('is_anonymous', e.target.checked)}
                    className={styles.checkbox}
                />
              <label className={styles.voteText}>익명 투표 여부</label>
          </div>

        
            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    checked={vote.is_multiple_choice}
                    onChange={(e) => updateVoteSettings('is_multiple_choice', e.target.checked)}
                    className={styles.checkbox}
                />
                <label className={styles.voteText}>중복 선택 허용 여부</label>
            </div>

          {vote.is_multiple_choice && (
            <div className={styles.checkboxGroup}>
              <label className={styles.voteSubtext}>최대 선택 개수</label>
                <input
                    type="number"
                    min="1"
                    max={voteOptions.length}
                    value={vote.max_choices}
                    onChange={(e) => updateVoteSettings('max_choices', parseInt(e.target.value))}
                    className={styles.numberInput}
                />
            </div>
          )}

        </div>

        

        <button
          onClick={() => onVoteUpdate(vote, voteOptions)}
          className={styles.primaryButton}
          disabled={!vote.title || voteOptions.some(opt => !opt.option_title)}
        >
          투표 만들기
        </button>
      </div>
    </div>
  );
};

export default VoteCreate;
