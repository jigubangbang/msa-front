import { useEffect, useState } from 'react';
import api from "../../apis/api";
import BucketlistItem from '../../components/profile/bucketlist/BucketlistItem';
import ProfileTemplate from '../../components/profile/ProfileTemplate';
import Modal from '../../components/common/Modal/Modal';
import Dropdown from '../../components/common/Dropdown';
import styles from './Bucketlist.module.css';
import API_ENDPOINTS from '../../utils/constants';
import { jwtDecode } from 'jwt-decode';

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

export default function Bucketlist() {
    const [sessionUserId, setSessionUserId] = useState();
    const {userId} = useParams();
    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [completeCount, setCompleteCount] = useState();
    const [incompleteCount, setIncompleteCount] = useState();
    
    const [reloadData, setReloadData] = useState(false);

    const [showGoalModal, setShowGoalModal] = useState(false); // showing modal to create new bucket list item
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();

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
        api
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist?status=${option.value}`)
            .then((response) => {
                setItems(response.data.items);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    function saveNewGoal() {
        api
            .post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist`, {
                title,
                description
            })
            .then((response) => {
                setTitle("");
                setDescription("");
                setReloadData(!reloadData);
                setShowGoalModal(false);
            })
            .catch((err) => {
                console.error("Failed to save new goal", err);
            })
    }

    function handleDragEnd(event) {
        const {active, over} = event;

        if (active.id !== over.id) {
            setItems((prevItems) => {
                const oldIndex = prevItems.findIndex(item => item.id === active.id);
                const newIndex = prevItems.findIndex(item => item.id === over.id);
                const newItems = arrayMove(prevItems, oldIndex, newIndex);

                saveNewOrder(newItems);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    function saveNewOrder(items) {
        const payload = items.map((item, index) => ({
            id: item.id,
            displayOrder: index + 1
        }));
        api
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist/reorder`, payload)
            .catch((err) => {
                console.log(err.message);
            });
    }

    function handleDeleteItem(deletedId, completionStatus) {
        setItems(prevItems => prevItems.filter(item => item.id !== deletedId));
        setTotalCount(prev => prev - 1);
        if (completionStatus) {
            setCompleteCount(prev => prev - 1);
        } else {
            setIncompleteCount(prev => prev - 1);
        }
    }

    function handleCheckItem(completionStatus) {
        if (completionStatus) {
            setCompleteCount(prev => prev + 1);
            setIncompleteCount(prev => prev - 1);
        } else {
            setIncompleteCount(prev => prev + 1);
            setCompleteCount(prev => prev - 1);
        }
    }
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = jwtDecode(token);
            setSessionUserId(decoded.sub);
        }

        api
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist`)
            .then((response) => {
                setItems(response.data.items);
                setTotalCount(response.data.totalItems);
                setCompleteCount(response.data.completeItems);
                setIncompleteCount(response.data.incompleteItems);
            })
    }, [reloadData, userId]);

    return (
        <>
        <ProfileTemplate heading={`@${userId}`}>
            <div className={styles.row}>
                <div className={styles.columnLeft}>
                    <div className={styles.topControls}>
                        {sessionUserId === userId && (
                            <div>
                                <button
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={() => setShowGoalModal(true)}
                                >
                                    +
                                </button>
                            </div>
                        )}
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
                                    displayOrder={item.displayOrder}
                                    userId={userId}
                                    sessionUserId={sessionUserId}
                                    activeDropdownOption={activeDropdownOption}
                                    onDelete={handleDeleteItem}
                                    onCheck={handleCheckItem}
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
        <Modal 
            show={showGoalModal}
            onClose={() => setShowGoalModal(false)}
            onSubmit={saveNewGoal}
            heading='NEW BUCKETLIST'
            firstLabel='추가'
            secondLabel='취소'
        >
            <div className={styles.formGroup}>
                <label>목표</label>
                <div className={styles.inputWrapper}>
                    <input
                        className={styles.formInput}
                        type="text"
                        value={title}
                        required
                        maxLength={50}
                        placeholder="목표를 입력하세요"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>상세</label>
                <div className={styles.inputWrapper}>
                    <textarea
                        className={styles.formInput}
                        value={description}
                        maxLength={120}
                        rows={6}
                        placeholder="목표 상세를 입력하세요"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>
        </Modal>

        </>
    );
}
