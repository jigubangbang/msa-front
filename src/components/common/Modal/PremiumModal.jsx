import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

export default function PremiumModal({showPremiumModal, setShowPremiumModal}) {
    const navigate = useNavigate();

    const handlePremiumPageClick = () => {
        setShowPremiumModal(false);
        navigate("/payment");
    };
    
    return (
        <Modal
            show={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            onSubmit={handlePremiumPageClick}
            heading="프리미엄 멤버십"
            firstLabel="구독하기"
            secondLabel="취소"
        >
            프리미엄 기능을 발견했습니다!
        </Modal>
    );
}