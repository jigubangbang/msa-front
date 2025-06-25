import ProfileTemplate from "../../components/profile/ProfileTemplate";
import { useParams } from "react-router-dom";

export default function Countries() {
    const {userId} = useParams();
    return (
        <ProfileTemplate heading={`@${userId}`}>
        </ProfileTemplate>
    );
}