import React from "react";
import axios from "axios";
import API_ENDPOINTS from "../../../utils/constants";
import { useParams } from "react-router-dom";
import Modal from "../../common/Modal/Modal";

export default function DeleteLanguageModal({selectedLanguage, showDeleteLanguageModal, setShowDeleteLanguageModal, onSubmit}) {
    const {userId} = useParams();

    const handleSubmit = async() => {
        try {
            await axios.delete(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/languages/${selectedLanguage.id}`);
            setShowDeleteLanguageModal(false);
            onSubmit(selectedLanguage.id);
        } catch (error) {
            console.error("Failed to delete language", error);
        }
    }

    return (
        <Modal
            show={showDeleteLanguageModal}
            onClose={() => setShowDeleteLanguageModal(false)}
            onSubmit={handleSubmit}
            secondLabel="취소"
        >
            언어를 리스트에서 삭제하시겠습니까?
        </Modal>
    );
}