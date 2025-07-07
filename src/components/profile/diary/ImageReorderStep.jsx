
import { closestCenter, DndContext } from "@dnd-kit/core";
import styles from "./ImageReorderStep.module.css";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { useEffect } from "react";

function SortableImage({image, index}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef}  style={style} {...attributes} {...listeners} className={styles.imageItem}>
            <img src={image.photoUrl} alt={`uploaded-${index}`} className={styles.image} />
            <div className={styles.orderTag}>{index + 1}</div>
        </div>
    );
}

export default function ImageReorderStep({images, orderedImages, setOrderedImages}) {
    const handleDragEnd = (event) => {
        const {active, over} = event;
        if (active.id !== over.id) {
            const oldIndex = orderedImages.findIndex(img => img.id === active.id);
            const newIndex = orderedImages.findIndex(img => img.id === over.id);
            setOrderedImages((items) => arrayMove(items, oldIndex, newIndex));
        }
    }
    
    useEffect(() => {
        if (images.length > 0) {
            const initialized = images.map((url, idx) => ({
                id: idx,             // Use index as id
                photoUrl: url,
            }));
            setOrderedImages(initialized);
        }
    }, [images]);

    return (
        <div className={styles.container}>
            <p>드래그하여 사진의 순서를 원하는 대로 조정하세요.</p>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedImages.map(img => img.id)} strategy={verticalListSortingStrategy}>
                    <div className={styles.imagesContainer}>
                        {orderedImages.map((image, index) => (
                            <SortableImage key={image.id} image={image} index={index}/>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}