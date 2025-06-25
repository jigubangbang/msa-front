import { useEffect, useState } from 'react';
import axios from "axios";
import BucketlistItem from '../../components/profile/bucketlist/BucketlistItem';
import ProfileTemplate from '../../components/profile/ProfileTemplate';
import Modal from '../../components/profile/Modal';
import Dropdown from '../../components/common/Dropdown';
import styles from './Bucketlist.module.css';
import sortIcon from '../../assets/profile/sort_white.svg';
import API_ENDPOINTS from '../../utils/constants';

import {
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useParams } from 'react-router-dom';


// TODO: get session user
// TODO: "+" button onClickHandler
// TODO: edit mode logic

export default function Bucketlist() {
    const {userId} = useParams();
    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [completeCount, setCompleteCount] = useState();
    const [incompleteCount, setInompleteCount] = useState();

    const [sortMode, setSortMode] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false); // showing modal to create new bucket list item

    const sensors = useSensors(
        useSensor(PointerSensor)
    );
    const [activeDropdownOption, setActiveDropdownOption] = useState("전체");

    const dropdownOptions = [
        {
            label: "전체", 
            value: ""
        },
        {
            label: "달성",
            value: "completed"
        },
        {
            label: "미달성",
            value: "incomplete"
        }
    ];

    function handleOptionClick(option) {
        setActiveDropdownOption(option.label);
        axios
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist?status=${option.value}`)
            .then((response) => {
                setItems(response.data.items);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    function saveNewGoal() {
        // TODO: save new goal
    }

    function saveSortedList() {
        // TODO: save new order
        setSortMode(false);
    }
    
    useEffect(() => {
        axios
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist`)
            .then((response) => {
                setItems(response.data.items);
                setTotalCount(response.data.totalItems);
                setCompleteCount(response.data.completeItems);
                setInompleteCount(response.data.incompleteItems);
            })
    }, []);

    return (
        <>
        <ProfileTemplate heading={`@${userId}`}>
            <div className={styles.row}>
                <div className={styles.columnLeft}>
                    <div className={styles.topControls}>
                        <div>
                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={() => setShowGoalModal(true)}
                            >
                                +
                            </button>
                            <button 
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => setSortMode(true)}
                            >
                                <img className={styles.sortIcon} src={sortIcon} styles={{padding: 'none'}}/>
                            </button>
                            {sortMode && (
                                <button
                                    className={`${styles.btn} ${styles.btnOutline}`}
                                    onClick={saveSortedList}
                                >
                                    저장
                                </button>
                            )}
                        </div>
                        <Dropdown 
                            options={dropdownOptions}
                            defaultOption={activeDropdownOption}
                            onSelect={(option) => {handleOptionClick(option)}}
                            className={styles.dropdownMenu}
                        />
                    </div>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(item => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((item) => (
                                <BucketlistItem 
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    description={item.description}
                                    completionStatus={item.completionStatus}
                                    completedAt={item.formattedDate}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
                <div className={styles.columnRight}>
                    <div className={styles.statsContainer}>
                        <div>
                            <span>전체:</span>
                            <span>{totalCount}</span>
                        </div>
                        <div>
                            <span>달성:</span>
                            <span>{completeCount}</span>
                        </div>
                        <div>
                            <span>미달성:</span>
                            <span>{incompleteCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileTemplate>
        <Modal show={showGoalModal} onClose={() => setShowGoalModal(false)}>
            <form onSubmit={saveNewGoal} className={styles.modal} >
                <div>
                    <label>목표</label>
                    <input type="text" name="title" required maxLength={50}/>
                </div>
                <div>
                    <label>상세</label>
                    <textarea name="description" maxLength={120} rows={6}/>
                </div>
                <div className={styles.btnContainer}>
                    <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`}>추가</button>
                    <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => {setShowGoalModal(false)}}>취소</button>
                </div>
            </form>
        </Modal>

        </>
    );

    function handleDragEnd(event) {
        const {active, over} = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }
}
