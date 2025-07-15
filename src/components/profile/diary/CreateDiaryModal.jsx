import React, { useEffect, useState } from "react";
import api from "../../../apis/api";
import ImageUploadStep from "./ImageUploadStep";
import ImageReorderStep from "./ImageReorderStep";
import PostInfoStep from "./PostInfoStep";
import PostContentStep from "./PostContentStep";

import styles from "./CreateDiaryModal.module.css";
import backIcon from "../../../assets/feed/arrow_back.svg";
import forwardIcon from "../../../assets/feed/arrow_forward.svg";
import API_ENDPOINTS from "../../../utils/constants";

export default function CreateDiaryModal({onClose, onPostCreated}) {
    const firstStep = 1;
    const lastStep = 4;
    const [step, setStep] = useState(firstStep);
    const [headerText, setHeaderText] = useState("");
    const [errorMessage, setErrorMessage] = useState();

    const [images, setImages] = useState([]);
    const [orderedImages, setOrderedImages] = useState([]);
    const [title, setTitle] = useState();
    const [publicStatus, setPublicStatus] = useState(true);

    const [postInfo, setPostInfo] = useState({
        countryId: '',
        cityId: '',
        title: '',
        startDate: '',
        endDate: '',
        publicStatus: publicStatus,
    });

    const handleSubmit = async() => {
        if (!postInfo.countryId || !postInfo.cityId || postInfo.countryId == "" || postInfo.cityId == "") {
            setErrorMessage("필수 항목을 입력하세요 *");
            return;
        }

        try {
            const postResponse = await api.post(`${API_ENDPOINTS.FEED.PRIVATE}`, {
                countryId : postInfo.countryId,
                cityId : postInfo.cityId,
                title : postInfo.title,
                startDate : postInfo.startDate,
                endDate : postInfo.endDate,
                publicStatus: postInfo.publicStatus
            });

            const feedId = postResponse.data.id;

            await Promise.all(
                orderedImages.map((img, idx) => {
                    api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/images`, {
                        feedId: feedId,
                        photoUrl: img.photoUrl,
                        displayOrder: idx + 1
                    })
                })
            )

            const newPost = {
                ...postResponse.data.post,
                photoUrl: orderedImages[0]?.photoUrl || null
            }
            onPostCreated(newPost);
            onClose();
        } catch (err) {
            console.error("Failed to upload post", err);
            alert('작성 중 오류가 발생했습니다.');
        }
    }

    useEffect(() => {
        switch(step) {
            case 1 :
                setHeaderText("1. 이미지 업로드");
                break;
            case 2 : 
                setHeaderText("2. 이미지 순서");
                break;
            case 3 :
                setHeaderText("3. 여행 일지 입력");
                break;
            case 4 :
                setHeaderText("4. 여행 정보 입력");
                break;
        }
    }, [step])

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>{headerText}</h3>
                <div className={styles.formGroup}>
                    {step === 1 && (
                        <ImageUploadStep images={images} setImages={setImages}/>
                    )}
                    {step === 2 && (
                        <ImageReorderStep images={images} orderedImages={orderedImages} setOrderedImages={setOrderedImages}/>
                    )}
                    {step === 3 && (
                        <PostContentStep title={title} publicStatus={publicStatus} setTitle={setTitle} setPublicStatus={setPublicStatus}/>
                    )}
                    {step === 4 && (
                        <PostInfoStep setPostInfo={setPostInfo} title={title} publicStatus={publicStatus} errorMessage={errorMessage}/>
                    )}
                </div>
                <div className={styles.btnContainer}>
                    {step > firstStep && (
                        <button className={`${styles.btn} ${styles.navButton}`} onClick={() => setStep(step - 1)}>
                            <img src={backIcon} alt="이전"/>
                        </button>
                    )}
                    {step < lastStep ? (
                        <button className={`${styles.btn} ${styles.navButton}`} onClick={() => setStep(step + 1)}
                            disabled={step === 1 && images.length === 0}
                        >
                            <img src={forwardIcon} alt="다음"/>
                        </button>
                    ) : (
                        <button className={`${styles.btn} ${styles.darkButton}`} onClick={handleSubmit}>
                            저장
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}