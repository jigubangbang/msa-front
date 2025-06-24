import React, { useState, useEffect } from 'react';
import styles from './Vote.module.css';
import check from '../../assets/common/check.svg';
import clock from '../../assets/common/clock.svg';
import user from '../../assets/common/user.svg';
import visibility from '../../assets/community/vote/visibility.svg';
import visibility_off from '../../assets/community/vote/visibility_off.svg'

const Vote = ({ 
  voteData, 
  onVoteSubmit = () => {}, 
  currentUserId = "admin" 
}) => {
  const [vote, setVote] = useState({});
  const [voteOptions, setVoteOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (voteData) {
      setVote(voteData);
      setVoteOptions(voteData.options || []);
      setSelectedOptions([]);
      const total = voteData.options?.reduce((sum, opt) => sum + opt.vote_count, 0) || 0;
      setTotalVotes(total);
      setIsExpired(new Date() > new Date(voteData.end_date));

      // #TODO 실제는 API 체크 필요
      setHasVoted(false); 

    }
  }, [voteData]);

  const handleOptionSelect = (optionId) => {
    if (hasVoted || isExpired) return;

    setSelectedOptions(prev => {
      const already = prev.includes(optionId);
      if (already) {
        return prev.filter(id => id !== optionId);
      } else {
        if (prev.length < vote.max_choices) {
          return [...prev, optionId];
        } else {
          alert(`최대 ${vote.max_choices}개까지 선택할 수 있습니다.`);
          return prev;
        }
      }
    });
  };

  const handleVoteSubmit = () => {
    if (selectedOptions.length === 0 || hasVoted || isExpired) return;

    const voteResults = selectedOptions.map(optionId => ({
      vote_id: vote.id,
      user_id: currentUserId,
      option_id: optionId,
      voted_at: new Date()
    }));

    onVoteSubmit(voteResults);
    setHasVoted(true);
  };

  const getVotePercentage = (count) => totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const showResults = hasVoted || isExpired || vote.blind_status === 'VISIBLE';

  return (
    <div className={styles.voteContainer}>
      <div className={styles.contentPadding}>
        <div className={styles.formGroup}>
          <h3 className={styles.voteTitle}>{vote.title}</h3>

          <div className={styles.badgeContainer}>
            {vote.is_official && <span className={`${styles.badge} ${styles.badgeOfficial}`}>공식</span>}
            {vote.is_anonymous && <span className={`${styles.badge} ${styles.badgeAnonymous}`}>익명</span>}
            {vote.is_multiple_choice && (
              <span className={`${styles.badge} ${styles.badgeMultiple}`}>
                중복선택 (최대 {vote.max_choices}개)
              </span>
            )}
          </div>

          <div className={styles.voteInfo}>
            <div className={styles.infoItem}>
              <img src={user} alt="user" />
              <span>{totalVotes}명 투표</span>
            </div>
            {vote.end_date && (
              <div className={styles.infoItem}>
                <img src={clock} alt="clock" />
                <span className={isExpired ? styles.infoItemExpired : ''}>
                  {isExpired ? '투표 종료' : `마감: ${formatDate(vote.end_date)}`}
                </span>
              </div>
            )}
            <div className={styles.infoItem}>
              <img src={vote.blind_status === 'BLINDED' ? visibility_off : visibility} alt="visibility" />
              <span>{vote.blind_status === 'BLINDED' ? '익명 투표' : '공개 투표'}</span>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          {voteOptions.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const percentage = getVotePercentage(option.vote_count);
            return (
              <div
                key={option.id}
                className={`${styles.voteOption} 
                  ${isSelected ? styles.voteOptionSelected : ''} 
                  ${(hasVoted || isExpired) ? styles.voteOptionDisabled : ''}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className={styles.voteOptionContent}>
                  <div className={styles.voteOptionLeft}>
                    {isSelected && <img src={check} alt="check" />}
                    <span>{option.option_title}</span>
                  </div>
                  {showResults && (
                    <div className={styles.voteOptionRight}>
                      <span className={styles.voteCount}>{option.vote_count}표</span>
                      <span className={styles.votePercentage}>{percentage}%</span>
                    </div>
                  )}
                </div>
                {showResults && (
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!hasVoted && !isExpired && (
          <button
            onClick={handleVoteSubmit}
            className={styles.primaryButton}
            disabled={selectedOptions.length === 0}
          >
            투표하기 ({selectedOptions.length}{vote.is_multiple_choice ? `/${vote.max_choices}` : ''})
          </button>
        )}

        {hasVoted && (
          <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
            <img src={check} alt="check" />
            투표가 완료되었습니다
          </div>
        )}

        {isExpired && (
          <div className={`${styles.statusMessage} ${styles.statusExpired}`}>
            <img src={clock} alt="clock" />
            투표가 종료되었습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;
