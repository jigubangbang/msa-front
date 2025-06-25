import SearchBar from '../../components/common/Searchbar';
import Header from '../../components/main/Header';
import styles from './Main.module.css';
import Vote from '../../components/community/Vote';

export default function Main() {
    return (
        <div className={styles.outerContainer}>
            <div className={styles.mainPoster}>
                <div className={styles.posterTitle}>JIGU PROJECT</div>
                <div className={styles.posterSubtitle}>여행, 그 이상의 여정을 기록하다</div>
                <button className={styles.startButton}>START NOW</button>
            </div>
            <div className={styles.container}>

                <div className={styles.section}>
                <h1>Header 1</h1>
                <h2>Header 2</h2>
                <p className={styles.bodySecondary}>Topic · 10.6M followers · 1M stories</p>
                </div>

                <div className={styles.section}>
                <h2>Sample Container</h2>
                    <div className={styles.sampleContainer}>
                        <p>공통 컨테이너 스타일 예시-로그인컨테이너 참고</p>
                        <p>background: #fff, 컨테이너 padding은 조절가능, border-radius: 8px(버튼은 6px), shadow는 배경에 따라 자율(안보일까봐 넣어둠)</p>

                        <div className={styles.formGroup}>
                        <label>입력 필드</label>
                        <div className={styles.inputWrapper}>
                            <input
                            type="text"
                            className={styles.formInput}
                            placeholder="입력해 주세요"
                            />
                        </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                        <button className={`${styles.button} ${styles.darkButton}`}>다크 버튼</button>
                        <button className={`${styles.button} ${styles.outlineButton}`}>외곽선 버튼</button>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                <h2>Buttons</h2>
                <button className={`${styles.btn} ${styles.btnPrimary}`}>Sign up</button>
                <button className={`${styles.btn} ${styles.btnSecondary}`}>기본</button>
                <button className={`${styles.btn} ${styles.btnOutline}`}>취소</button>
                </div>

                <div className={styles.section}>
                <h2>Tags</h2>
                <div className={styles.flexRow}>
                    <span className={styles.tag}>Work</span>
                    <span className={styles.tag}>Life</span>
                    <span className={`${styles.tag} ${styles.tagSelected}`}>Self Improvement</span>
                </div>
                </div>

                <div className={styles.section}>
                <h2>Colors</h2>
                <div className={styles.colorBox} style={{backgroundColor: '#ffffff'}}></div>#ffffff
                <div className={styles.colorBox}  style={{backgroundColor: '#242424'}}></div>#242424
                <div className={styles.colorBox}  style={{backgroundColor: '#6b6b6b'}}></div>#6b6b6b
                <div className={styles.colorBox}  style={{backgroundColor: '#1a8917'}}></div>#1a8917
                <div className={styles.colorBox}  style={{backgroundColor: '#83D9E0'}}></div>#83D9E0
                <br/>
                <br/>
                <div className={styles.colorBox}  style={{backgroundColor: '#2585C1'}}></div>#2585C1
                <div className={styles.colorBox}  style={{backgroundColor: '#0B79B8'}}></div>#0B79B8
                <div className={styles.colorBox}  style={{backgroundColor: '#ABBA17'}}></div>#ABBA17
                <div className={styles.colorBox}  style={{backgroundColor: '#93AD28'}}></div>#93AD28
                <div className={styles.colorBox}  style={{backgroundColor: '#F1DC81'}}></div>#F1DC81
                <div className={styles.colorBox}  style={{backgroundColor: '#EDD470'}}></div>#EDD470
                </div>

                <h2>Search Bar</h2>
                <SearchBar placeholder="검색어 입력..." title="검색 항목" recommended={["검색어", "검색어", "검색어"]}/>

                <Vote/>
                
            </div>
        </div>
    );
}