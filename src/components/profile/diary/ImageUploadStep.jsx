import React, { useState } from "react";
import styles from "./ImageUploadStep.module.css";
import API_ENDPOINTS from "../../../utils/constants";
import api from "../../../apis/api";
import deleteIcon from "../../../assets/feed/close_small_white.svg";

export default function ImageUploadStep({images, setImages}) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState();
    const imageLimit = 10;

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const availableSlots = imageLimit - images.length;
        if (availableSlots <= 0) {
            setError(`최대 ${imageLimit}장의 이미지만 업로드할 수 있습니다.`);
            return;
        }

        const filesToUpload = files.slice(0, availableSlots);

        setIsUploading(true);
        setError(null);

        for (const file of filesToUpload) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/images`, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                
                const imageUrl = response.data.photoUrl;
                setImages((prev) => [...prev, imageUrl])
            } catch (err) {
                console.error('Upload failed', err);
                setError("이미지 업로드에 실패했습니다");
            }
            setIsUploading(false);
        }
    }

    const handleRemove = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <div className={styles.formGroup}>
            <div className={styles.container}>
                <p>이미지를 선택해주세요. ({images.length} / {imageLimit})</p>
                <label className={styles.uploadLabel}>
                    {isUploading ? '업로드 중...' : '이미지 선택'}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        disabled={isUploading || images.length >= imageLimit}
                    />
                </label>
                {error && <div className={styles.error}>{error}</div>}
                {images.length > 0 && (
                    <div className={styles.previewGrid}>
                        {images.map((url, index) => (
                            <div key={index} className={styles.imageWrapper}>
                                <img src={url} alt={`upload-${index}`} className={styles.image}/>
                                <button
                                    className={styles.removeButton}
                                    onClick={() => handleRemove(index)}
                                >
                                    <img src={deleteIcon} alt="삭제"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}