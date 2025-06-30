import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({
  currentPage = 1,
  pageBlock = 5,
  pageCount = 1,
  onPageChange = () => {}
}) => {

  if (pageCount === 0) return null;

  const startPage = Math.floor((currentPage - 1) / pageBlock) * pageBlock + 1;
  const endPage = Math.min(startPage + pageBlock - 1, pageCount);

  const handlePageChange = (pageNum) => {
    if (pageNum !== currentPage && pageNum > 0 && pageNum <= pageCount) {
      onPageChange(pageNum);
    }
  };

  return (
    <div className={styles.paginationContainer}>
      {startPage > 1 && (
        <button
          className={styles.paginationButton}
          onClick={() => handlePageChange(startPage - 1)}
        >
          <i className={`bi bi-chevron-left ${styles.paginationChevron}`}></i>
        </button>
      )}

      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
        <button
          key={pageNum}
          className={`${styles.paginationButton} ${pageNum === currentPage ? styles.active : ''}`}
          onClick={() => handlePageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      {endPage < pageCount && (
        <button
          className={styles.paginationButton}
          onClick={() => handlePageChange(endPage + 1)}
        >
          <i className={`bi bi-chevron-right ${styles.paginationChevron}`}></i>
        </button>
      )}
    </div>
  );
};

export default Pagination;