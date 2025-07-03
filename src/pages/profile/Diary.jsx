import { useParams } from "react-router-dom";
import ProfileTemplate from "../../components/profile/ProfileTemplate";

export default function Diary() {
    const {userId} = useParams();

    return (
        <ProfileTemplate heading={`@${userId}`}>
        </ProfileTemplate>
    );
}