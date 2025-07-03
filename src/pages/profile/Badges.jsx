import ProfileTemplate from "../../components/profile/ProfileTemplate";
import { useParams } from "react-router-dom";

export default function Badges() {
    const {userId} = useParams();
    return (
        <ProfileTemplate heading={`@${userId}`}>
        </ProfileTemplate>
    );
}