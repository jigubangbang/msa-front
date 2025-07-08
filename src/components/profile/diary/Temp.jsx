import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './ReorderImagesStep.module.css';

function SortableImage({ image, index }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.imageItem}>
            <img src={image.photoUrl} alt={`uploaded-${index}`} className={styles.image} />
            <div className={styles.orderTag}>{index + 1}</div>
        </div>
    );
}

export default function ReorderImagesStep({ uploadedImages, setUploadedImages, onNext, onBack }) {
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = uploadedImages.findIndex(img => img.id === active.id);
            const newIndex = uploadedImages.findIndex(img => img.id === over.id);
            setUploadedImages((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>사진 순서 정하기</h2>
            <p className={styles.subtext}>드래그하여 사진의 순서를 원하는 대로 조정하세요.</p>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={uploadedImages.map(img => img.id)} strategy={verticalListSortingStrategy}>
                    <div className={styles.imagesContainer}>
                        {uploadedImages.map((image, index) => (
                            <SortableImage key={image.id} image={image} index={index} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className={styles.buttonContainer}>
                <button className={styles.backButton} onClick={onBack}>이전</button>
                <button className={styles.nextButton} onClick={onNext}>다음</button>
            </div>
        </div>
    );
}
